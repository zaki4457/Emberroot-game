export const GameState = {
  LOADING: "LOADING",
  MAIN_MENU: "MAIN_MENU",
  HUB_VILLAGE: "HUB_VILLAGE",
  REGION_MAP: "REGION_MAP",
  DUNGEON_ROOM: "DUNGEON_ROOM",
  BOSS_ARENA: "BOSS_ARENA",
  DIALOGUE: "DIALOGUE",
  INVENTORY: "INVENTORY",
  SKILL_TREE: "SKILL_TREE",
  PAUSED: "PAUSED",
  DEATH_SCREEN: "DEATH_SCREEN",
  VICTORY: "VICTORY",
  ENDING: "ENDING",
  SETTINGS: "SETTINGS",
} as const;
export type GameState = (typeof GameState)[keyof typeof GameState];

export const WardenType = {
  Ember: "ember",
  Frost: "frost",
  Storm: "storm",
  Void: "void",
} as const;
export type WardenType = (typeof WardenType)[keyof typeof WardenType];

export const BehaviorType = {
  Strike: "strike",
  Ward: "ward",
  Surge: "surge",
  Bloom: "bloom",
  Grasp: "grasp",
  Pulse: "pulse",
  Echo: "echo",
} as const;
export type BehaviorType = (typeof BehaviorType)[keyof typeof BehaviorType];

export const RarityType = {
  Common: "common",
  Uncommon: "uncommon",
  Rare: "rare",
  Epic: "epic",
  Legendary: "legendary",
} as const;
export type RarityType = (typeof RarityType)[keyof typeof RarityType];

export const StatusEffectType = {
  Burn: "burn",
  Freeze: "freeze",
  Shock: "shock",
  Poison: "poison",
  Bleed: "bleed",
  Slow: "slow",
  Stun: "stun",
  Vulnerable: "vulnerable",
  Shield: "shield",
  Haste: "haste",
  Regen: "regen",
  Stealth: "stealth",
  Berserk: "berserk",
} as const;
export type StatusEffectType = (typeof StatusEffectType)[keyof typeof StatusEffectType];

export const RoomType = {
  Entrance: "entrance",
  Combat: "combat",
  Challenge: "challenge",
  Treasure: "treasure",
  Shop: "shop",
  Healing: "healing",
  Boss: "boss",
  Secret: "secret",
} as const;
export type RoomType = (typeof RoomType)[keyof typeof RoomType];

export const Tile = {
  Void: 0,
  Floor: 1,
  Wall: 2,
  Corridor: 3,
  Door: 4,
  Water: 5,
  Lava: 6,
  Ice: 7,
  Pit: 8,
  Deco: 9,
  Grass: 10,
  Crystal: 11,
  Wood: 12,
} as const;
export type TileId = (typeof Tile)[keyof typeof Tile];

export const EndingType = {
  Merciful: "merciful",
  Balanced: "balanced",
  Ruthless: "ruthless",
} as const;
export type EndingType = (typeof EndingType)[keyof typeof EndingType];

export const RARITY_WEIGHTS: Record<RarityType, number> = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1,
};

export const RARITY_MULT: Record<RarityType, number> = {
  common: 1.05,
  uncommon: 1.1,
  rare: 1.18,
  epic: 1.3,
  legendary: 1.5,
};

export const RARITY_COLOR: Record<RarityType, string> = {
  common: "#aaaaaa",
  uncommon: "#4ecdc4",
  rare: "#5b8def",
  epic: "#9b59b6",
  legendary: "#ffd700",
};

export const WARDEN_COLOR: Record<WardenType, string> = {
  ember: "#ff6b35",
  frost: "#88ddff",
  storm: "#ffe566",
  void: "#9b59b6",
};

export const STATUS_META: Record<
  StatusEffectType,
  { color: string; icon: string; maxStacks: number; tick: number }
> = {
  burn: { color: "#ff6b35", icon: "B", maxStacks: 5, tick: 0.5 },
  freeze: { color: "#88ddff", icon: "F", maxStacks: 1, tick: 0 },
  shock: { color: "#ffe566", icon: "S", maxStacks: 3, tick: 0.4 },
  poison: { color: "#88ff44", icon: "P", maxStacks: 8, tick: 0.6 },
  bleed: { color: "#e94560", icon: "L", maxStacks: 6, tick: 0.4 },
  slow: { color: "#aaaaff", icon: "W", maxStacks: 1, tick: 0 },
  stun: { color: "#ffffaa", icon: "X", maxStacks: 1, tick: 0 },
  vulnerable: { color: "#ff88aa", icon: "V", maxStacks: 1, tick: 0 },
  shield: { color: "#88ccff", icon: "H", maxStacks: 1, tick: 0 },
  haste: { color: "#ffe88a", icon: ">", maxStacks: 1, tick: 0 },
  regen: { color: "#4ecdc4", icon: "+", maxStacks: 5, tick: 0.5 },
  stealth: { color: "#8888aa", icon: "O", maxStacks: 1, tick: 0 },
  berserk: { color: "#ff4444", icon: "!", maxStacks: 1, tick: 0 },
};
