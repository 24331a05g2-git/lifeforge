import { ShopItem } from "./types";

/**
 * Authoritative Server-Side Shop Catalog
 * Prices and item properties are immutable and never determined by the client.
 */
export const SHOP_CATALOG: readonly ShopItem[] = [
  {
    key: "ember_frame",
    name: "Ember Frame",
    description: "Burning proof of your consistency and inner forge.",
    price: 100,
    rarity: "uncommon",
    type: "cosmetic_frame",
    iconName: "Flame",
    badgeLabel: "Avatar Frame",
  },
  {
    key: "scholar_sigil",
    name: "Scholar Sigil",
    description: "A mark of accumulated knowledge and thoughtful focus.",
    price: 150,
    rarity: "rare",
    type: "cosmetic_badge",
    iconName: "BookOpen",
    badgeLabel: "Sigil",
  },
  {
    key: "warrior_crest",
    name: "Warrior Crest",
    description: "Emblem of relentless grit and discipline under pressure.",
    price: 175,
    rarity: "rare",
    type: "cosmetic_badge",
    iconName: "Shield",
    badgeLabel: "Crest",
  },
  {
    key: "golden_flame",
    name: "Golden Flame",
    description: "Radiance of an unbreakable spirit and long-running streak.",
    price: 200,
    rarity: "epic",
    type: "cosmetic_badge",
    iconName: "Sparkles",
    badgeLabel: "Glory Badge",
  },
  {
    key: "forge_aura",
    name: "Forge Aura",
    description: "The atmospheric glow of a persistent, ascended adventurer.",
    price: 250,
    rarity: "legendary",
    type: "cosmetic_aura",
    iconName: "Zap",
    badgeLabel: "Mystic Aura",
  },
  {
    key: "citadel_banner",
    name: "Citadel Banner",
    description: "Standard flown above the grand citadel honoring true mastery.",
    price: 300,
    rarity: "legendary",
    type: "cosmetic_banner",
    iconName: "Flag",
    badgeLabel: "Citadel Standard",
  },
] as const;

/**
 * Look up an authoritative shop item by key.
 */
export function getShopItemByKey(key: string): ShopItem | undefined {
  return SHOP_CATALOG.find((item) => item.key === key);
}
