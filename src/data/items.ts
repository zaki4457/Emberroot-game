import type { ItemData } from "./types";

export const ITEMS: ItemData[] = [
  { id: "rusty_sword", name: "Rusty Sword", type: "weapon", slot: "weapon", rarity: "common", damage: 8, hpBonus: 0, powerBonus: 0, buyPrice: 20, sellPrice: 8, icon: "/", description: "It has opinions about rust.", mods: {}, element: null as unknown as string },
  { id: "ember_blade", name: "Ember Blade", type: "weapon", slot: "weapon", rarity: "rare", damage: 12, hpBonus: 0, powerBonus: 2, buyPrice: 80, sellPrice: 30, icon: "/", description: "Warm even in frosthollow.", mods: { damage: 0.08 }, element: "fire" },
  { id: "frost_pike", name: "Frost Pike", type: "weapon", slot: "weapon", rarity: "rare", damage: 11, hpBonus: 0, powerBonus: 1, buyPrice: 80, sellPrice: 30, icon: "/", description: "A needle of winter.", mods: { onHitStatus: "slow", onHitChance: 0.2 }, element: "ice" },
  { id: "storm_bow", name: "Storm Bow", type: "weapon", slot: "weapon", rarity: "epic", damage: 10, hpBonus: 0, powerBonus: 3, buyPrice: 140, sellPrice: 50, icon: ")", description: "Strings that hum with ozone.", mods: { projectile: 1, attackSpeed: 0.1 }, element: "lightning" },
  { id: "void_fang", name: "Void Fang", type: "weapon", slot: "weapon", rarity: "legendary", damage: 15, hpBonus: 0, powerBonus: 4, buyPrice: 260, sellPrice: 90, icon: "†", description: "It drinks more than blood.", mods: { lifesteal: 0.06, critChance: 0.08 }, element: "void" },
  { id: "wood_buckler", name: "Wood Buckler", type: "armor", slot: "offhand", rarity: "common", damage: 0, hpBonus: 4, powerBonus: 0, buyPrice: 25, sellPrice: 10, icon: "o", description: "Better than a wish.", mods: { defense: 3 } },
  { id: "iron_shield", name: "Iron Shield", type: "armor", slot: "offhand", rarity: "uncommon", damage: 0, hpBonus: 8, powerBonus: 0, buyPrice: 60, sellPrice: 22, icon: "o", description: "Honest metal.", mods: { defense: 6 } },
  { id: "warden_aegis", name: "Warden Aegis", type: "armor", slot: "offhand", rarity: "epic", damage: 0, hpBonus: 14, powerBonus: 0, buyPrice: 180, sellPrice: 70, icon: "⬡", description: "Four sigils, one promise.", mods: { defense: 10, maxHp: 10 } },
  { id: "leather_cap", name: "Leather Cap", type: "armor", slot: "head", rarity: "common", damage: 0, hpBonus: 4, powerBonus: 0, buyPrice: 18, sellPrice: 6, icon: "^", description: "Smells like a good decision.", mods: { defense: 1 } },
  { id: "hunter_hood", name: "Hunter Hood", type: "armor", slot: "head", rarity: "uncommon", damage: 0, hpBonus: 6, powerBonus: 1, buyPrice: 50, sellPrice: 18, icon: "^", description: "Keeps the rain and the doubts off.", mods: { critChance: 0.04 } },
  { id: "crown_of_cinders", name: "Crown of Cinders", type: "armor", slot: "head", rarity: "legendary", damage: 0, hpBonus: 8, powerBonus: 3, buyPrice: 240, sellPrice: 90, icon: "♛", description: "Still warm with someone else's ending.", mods: { damage: 0.1, critChance: 0.05 } },
  { id: "travel_cloak", name: "Travel Cloak", type: "armor", slot: "body", rarity: "common", damage: 0, hpBonus: 8, powerBonus: 0, buyPrice: 30, sellPrice: 10, icon: "T", description: "Patched more times than the road.", mods: { defense: 2 } },
  { id: "scale_mail", name: "Scale Mail", type: "armor", slot: "body", rarity: "rare", damage: 0, hpBonus: 18, powerBonus: 0, buyPrice: 110, sellPrice: 40, icon: "T", description: "A dragon would like a word.", mods: { defense: 8 } },
  { id: "voidweave", name: "Voidweave Robe", type: "armor", slot: "body", rarity: "epic", damage: 0, hpBonus: 12, powerBonus: 2, buyPrice: 170, sellPrice: 60, icon: "T", description: "It is not always there when you look.", mods: { dodgeIFrames: 0.03, critChance: 0.04 } },
  { id: "worn_boots", name: "Worn Boots", type: "armor", slot: "boots", rarity: "common", damage: 0, hpBonus: 2, powerBonus: 0, buyPrice: 16, sellPrice: 6, icon: "b", description: "They know the way home.", mods: { moveSpeed: 0.04 } },
  { id: "windstep", name: "Windstep Boots", type: "armor", slot: "boots", rarity: "rare", damage: 0, hpBonus: 4, powerBonus: 0, buyPrice: 90, sellPrice: 32, icon: "b", description: "Leave no print, only weather.", mods: { moveSpeed: 0.1, dodgeIFrames: 0.02 } },
  { id: "rootwalkers", name: "Rootwalkers", type: "armor", slot: "boots", rarity: "epic", damage: 0, hpBonus: 6, powerBonus: 1, buyPrice: 150, sellPrice: 55, icon: "b", description: "The forest steps with you.", mods: { moveSpeed: 0.08, staminaRegen: 0.1 } },
  { id: "copper_ring", name: "Copper Ring", type: "accessory", slot: "ring", rarity: "common", damage: 0, hpBonus: 0, powerBonus: 1, buyPrice: 22, sellPrice: 8, icon: "°", description: "A little luck, a little green.", mods: { luck: 0.05 } },
  { id: "blood_signet", name: "Blood Signet", type: "accessory", slot: "ring", rarity: "rare", damage: 0, hpBonus: 0, powerBonus: 2, buyPrice: 100, sellPrice: 36, icon: "°", description: "It beats when you do.", mods: { lifesteal: 0.04 } },
  { id: "warden_seal", name: "Warden Seal", type: "accessory", slot: "ring", rarity: "legendary", damage: 0, hpBonus: 6, powerBonus: 3, buyPrice: 280, sellPrice: 100, icon: "°", description: "Four names. One oath.", mods: { damage: 0.08, defense: 4, luck: 0.1 } },
  { id: "potion", name: "Root Tonic", type: "consumable", rarity: "common", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 15, sellPrice: 5, icon: "+", description: "Restores 40 HP.", mods: {} },
  { id: "stamina_tea", name: "Bitter Tea", type: "consumable", rarity: "common", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 12, sellPrice: 4, icon: "~", description: "Restores 40 stamina.", mods: {} },
  { id: "antidote", name: "Antidote", type: "consumable", rarity: "uncommon", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 20, sellPrice: 6, icon: "x", description: "Cures poison and burn.", mods: {} },
  { id: "bomb", name: "Firebomb", type: "consumable", rarity: "uncommon", damage: 30, hpBonus: 0, powerBonus: 0, buyPrice: 25, sellPrice: 8, icon: "*", description: "A rude sphere of bad ideas.", mods: { area: 1 } },
  { id: "key", name: "Old Key", type: "key", rarity: "rare", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 40, sellPrice: 0, icon: "k", description: "Opens what wants to stay shut.", mods: {} },
  { id: "ember_core", name: "Ember Core", type: "key", rarity: "epic", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 0, sellPrice: 40, icon: "●", description: "A warden's leftover heartbeat.", mods: {} },
  { id: "lore_page", name: "Charred Page", type: "key", rarity: "uncommon", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 0, sellPrice: 5, icon: "¶", description: "The world wrote this down so it wouldn't have to remember alone.", mods: {} },
  { id: "fish", name: "Silverfin", type: "consumable", rarity: "common", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 8, sellPrice: 8, icon: "~", description: "A respectable fish. Restores 20 HP.", mods: {} },
  { id: "gold_nugget", name: "Gold Nugget", type: "key", rarity: "rare", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 0, sellPrice: 25, icon: "$", description: "Heavy with other people's luck.", mods: {} },
  { id: "whetstone", name: "Whetstone", type: "consumable", rarity: "uncommon", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 30, sellPrice: 10, icon: "=", description: "Next 20 seconds: +20% damage.", mods: { damage: 0.2 } },
  { id: "cloak_pin", name: "Cloak Pin", type: "accessory", slot: "ring", rarity: "uncommon", damage: 0, hpBonus: 0, powerBonus: 1, buyPrice: 40, sellPrice: 14, icon: "°", description: "Fashion is a kind of armor.", mods: { luck: 0.04 } },
  { id: "lucky_bone", name: "Lucky Bone", type: "accessory", slot: "ring", rarity: "rare", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 70, sellPrice: 24, icon: "°", description: "Someone else was not lucky.", mods: { luck: 0.12, goldGain: 0.1 } },
  { id: "seed_of_root", name: "Seed of Root", type: "key", rarity: "legendary", damage: 0, hpBonus: 0, powerBonus: 0, buyPrice: 0, sellPrice: 0, icon: "♣", description: "Plant it and the world might forgive you.", mods: {} },
];

export const ITEM_BY_ID: Record<string, ItemData> = Object.fromEntries(
  ITEMS.map((i) => [i.id, i])
);

export const SHOP_POOL = [
  "potion",
  "stamina_tea",
  "antidote",
  "bomb",
  "whetstone",
  "iron_shield",
  "hunter_hood",
  "ember_blade",
  "frost_pike",
  "windstep",
  "blood_signet",
  "scale_mail",
  "copper_ring",
];
