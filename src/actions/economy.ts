"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { revalidatePath } from "next/cache";
import { SHOP_CATALOG, getShopItemByKey } from "@/lib/economy/catalog";
import {
  InventoryItem,
  PurchaseActionResult,
  ShopCatalogItem,
} from "@/lib/economy/types";

/**
 * Fetches the authoritative shop catalog with user-specific ownership and affordability flags.
 */
export async function getShopCatalogAction(): Promise<{
  success: boolean;
  catalog: ShopCatalogItem[];
  playerGold: number;
  error?: string;
}> {
  if (!getSupabaseEnv().isConfigured) {
    return { success: false, catalog: [], playerGold: 0, error: "Database unconfigured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, catalog: [], playerGold: 0, error: "Authentication required." };
  }

  // Fetch player profile for current gold
  const { data: profile } = await supabase
    .from("profiles")
    .select("gold")
    .eq("user_id", user.id)
    .maybeSingle();

  const playerGold = profile?.gold || 0;

  // Fetch user's existing inventory to check ownership
  const { data: inventory = [] } = await supabase
    .from("inventory_items")
    .select("item_key")
    .eq("user_id", user.id);

  const ownedKeys = new Set((inventory || []).map((i) => i.item_key));

  const catalog: ShopCatalogItem[] = SHOP_CATALOG.map((item) => {
    const isOwned = ownedKeys.has(item.key);
    const canAfford = playerGold >= item.price;
    return {
      ...item,
      isOwned,
      canAfford,
    };
  });

  return {
    success: true,
    catalog,
    playerGold,
  };
}

/**
 * Executes an atomic shop purchase.
 * Prices and item validity are strictly server-authoritative.
 */
export async function purchaseShopItemAction(
  itemKey: string
): Promise<PurchaseActionResult> {
  if (!getSupabaseEnv().isConfigured) {
    return { success: false, error: "Database unconfigured." };
  }

  const catalogItem = getShopItemByKey(itemKey);
  if (!catalogItem) {
    return { success: false, error: "Invalid or nonexistent shop item." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to purchase items." };
  }

  // 1. Try atomic PostgreSQL RPC function (purchase_shop_item)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "purchase_shop_item",
      { p_item_key: itemKey }
    );

    if (!rpcError && rpcData && rpcData.success) {
      revalidatePath("/shop");
      revalidatePath("/character");
      revalidatePath("/dashboard");
      return {
        success: true,
        itemKey,
        pricePaid: rpcData.price_paid,
        remainingGold: rpcData.remaining_gold,
      };
    }

    if (rpcError) {
      // Known business exceptions from RPC
      const msg = rpcError.message || "";
      if (msg.includes("already owned")) {
        return { success: false, error: "You already own this cosmetic item." };
      }
      if (msg.includes("Insufficient gold")) {
        return { success: false, error: "Insufficient Gold in your vault." };
      }
    }
  } catch {
    // Fall back to server-authoritative verification transaction
  }

  // 2. Server-Authoritative Fallback Transaction
  // Check if already owned
  const { data: existingItem } = await supabase
    .from("inventory_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_key", itemKey)
    .maybeSingle();

  if (existingItem) {
    return { success: false, error: "You already own this cosmetic item." };
  }

  // Check current gold
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("gold")
    .eq("user_id", user.id)
    .single();

  if (profileErr || !profile) {
    return { success: false, error: "Profile not found." };
  }

  if (profile.gold < catalogItem.price) {
    return {
      success: false,
      error: `Insufficient Gold: need ${catalogItem.price} Gold, you have ${profile.gold}.`,
    };
  }

  // Deduct gold
  const newGold = profile.gold - catalogItem.price;
  const { error: updateGoldErr } = await supabase
    .from("profiles")
    .update({ gold: newGold })
    .eq("user_id", user.id);

  if (updateGoldErr) {
    return { success: false, error: "Failed to deduct gold transaction." };
  }

  // Insert inventory item
  const { error: insertErr } = await supabase.from("inventory_items").insert({
    user_id: user.id,
    item_key: itemKey,
    item_type: catalogItem.type,
    quantity: 1,
    metadata: { purchased_price: catalogItem.price },
  });

  if (insertErr) {
    // Revert gold if inventory insertion failed
    await supabase.from("profiles").update({ gold: profile.gold }).eq("user_id", user.id);
    return { success: false, error: "Failed to record item in vault." };
  }

  revalidatePath("/shop");
  revalidatePath("/character");
  revalidatePath("/dashboard");

  return {
    success: true,
    itemKey,
    pricePaid: catalogItem.price,
    remainingGold: newGold,
  };
}

/**
 * Fetches the authenticated user's inventory collection.
 */
export async function getUserInventoryAction(): Promise<{
  success: boolean;
  inventory: InventoryItem[];
  error?: string;
}> {
  if (!getSupabaseEnv().isConfigured) {
    return { success: false, inventory: [], error: "Database unconfigured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, inventory: [], error: "Authentication required." };
  }

  const { data: items, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("user_id", user.id)
    .order("acquired_at", { ascending: false });

  if (error) {
    return { success: false, inventory: [], error: error.message };
  }

  return {
    success: true,
    inventory: items || [],
  };
}
