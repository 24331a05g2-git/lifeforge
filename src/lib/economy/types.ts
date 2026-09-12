/**
 * LIFEFORGE: Economy & Virtual Inventory Domain Types
 * Phase 11: Server-Authoritative Shop & Cosmetics
 */

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type ItemType = "cosmetic_frame" | "cosmetic_badge" | "cosmetic_aura" | "cosmetic_banner";

export interface ShopItem {
  key: string;
  name: string;
  description: string;
  price: number; // In Gold coins
  rarity: ItemRarity;
  type: ItemType;
  iconName: string;
  badgeLabel?: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_key: string;
  item_type: string;
  quantity: number;
  metadata?: Record<string, any>;
  acquired_at: string;
}

export interface ShopCatalogItem extends ShopItem {
  isOwned: boolean;
  canAfford: boolean;
}

export interface PurchaseActionResult {
  success: boolean;
  itemKey?: string;
  pricePaid?: number;
  remainingGold?: number;
  error?: string;
}
