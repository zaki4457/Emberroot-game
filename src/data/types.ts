import type {
  BehaviorType,
  EndingType,
  RarityType,
  RoomType,
  StatusEffectType,
  WardenType,
} from "./enums";

export interface TransformComponent {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  pivotX: number;
  pivotY: number;
}

export interface SpriteComponent {
  key: string;
  flipX: boolean;
  flipY: boolean;
  tint: string | null;
  opacity: number;
  layer: number;
  visible: boolean;
  bob: number;
}

export interface HealthComponent {
  current: number;
  max: number;
  invulnerable: boolean;
  invulnerableTimer: number;
  shield: number;
  shieldMax: number;
  regenRate: number;
  lastDamageTime: number;
  lastDamageSource: number;
  defense: number;
}

export interface PhysicsComponent {
  velocityX: number;
  velocityY: number;
  drag: number;
  maxSpeed: number;
  mass: number;
  knockbackX: number;
  knockbackY: number;
}

export interface ColliderComponent {
  type: "aabb" | "circle";
  width: number;
  height: number;
  radius: number;
  offsetX: number;
  offsetY: number;
  isTrigger: boolean;
  layer: string;
}

export interface AIComponent {
  type: string;
  state: string;
  target: number | null;
  timer: number;
  detectionRange: number;
  attackRange: number;
  telegraphTimer: number;
  telegraphDuration: number;
  attackCooldown: number;
  attackCooldownTimer: number;
  patrolOriginX: number;
  patrolOriginY: number;
  special: number;
  elite: boolean;
}

export interface CombatComponent {
  damage: number;
  damageMultiplier: number;
  critChance: number;
  critMultiplier: number;
  attackSpeed: number;
  attackCooldown: number;
  lifesteal: number;
  element: string | null;
  faction: "player" | "enemy";
}

export interface ProjectileComponent {
  speed: number;
  lifetime: number;
  damage: number;
  element: string | null;
  statusEffect: StatusEffectType | null;
  pierceCount: number;
  ownerId: number;
  homing: number;
  radius: number;
}

export interface StatusEffectComponent {
  effects: Map<string, ActiveStatusEffectData>;
}

export interface ActiveStatusEffectData {
  type: StatusEffectType;
  duration: number;
  maxDuration: number;
  stacks: number;
  tickTimer: number;
  tickRate: number;
  source: number;
}

export interface PlayerStateComponent {
  facingX: number;
  facingY: number;
  state:
    | "idle"
    | "walk"
    | "attack"
    | "heavy"
    | "ranged"
    | "dodge"
    | "parry"
    | "hurt"
    | "dead"
    | "finisher"
    | "ultimate";
  stateTime: number;
  comboCount: number;
  comboTimer: number;
  attackIndex: number;
  bufferedAttack: boolean;
  charge: number;
  charging: boolean;
  stamina: number;
  maxStamina: number;
  xp: number;
  level: number;
  gold: number;
  essence: number;
  mastery: number;
  parryWindow: number;
  aimX: number;
  aimY: number;
  iFrames: number;
  attackLock: number;
}

export interface EnemyData {
  id: string;
  name: string;
  hp: number;
  damage: number;
  speed: number;
  detectionRange: number;
  attackRange: number;
  aiType: string;
  deathXP: number;
  deathGold: number;
  color: string;
  accent: string;
  w: number;
  h: number;
  element: string | null;
  telegraph: number;
  attackCd: number;
  description: string;
}

export interface BlessingData {
  id: string;
  name: string;
  warden: WardenType;
  behavior: BehaviorType;
  rarity: RarityType;
  icon: string;
  description: string;
  damageMultiplier: number;
  cooldownReduction: number;
  grantedEffect: StatusEffectType | null;
  mods: StatMods;
}

export interface StatMods {
  damage?: number;
  attackSpeed?: number;
  moveSpeed?: number;
  maxHp?: number;
  defense?: number;
  critChance?: number;
  critDamage?: number;
  lifesteal?: number;
  staminaRegen?: number;
  cooldown?: number;
  area?: number;
  projectile?: number;
  dodgeIFrames?: number;
  luck?: number;
  xpGain?: number;
  goldGain?: number;
  onHitStatus?: StatusEffectType;
  onHitChance?: number;
}

export interface SkillData {
  id: string;
  name: string;
  branch: number;
  tier: number;
  prerequisite: string | null;
  masteryCost: number;
  type: "active" | "passive";
  description: string;
  icon: string;
  cooldown: number;
  mods: StatMods;
}

export interface ItemData {
  id: string;
  name: string;
  type: "weapon" | "armor" | "accessory" | "consumable" | "key";
  slot?: "weapon" | "offhand" | "head" | "body" | "boots" | "ring";
  rarity: RarityType;
  damage: number;
  hpBonus: number;
  powerBonus: number;
  buyPrice: number;
  sellPrice: number;
  icon: string;
  description: string;
  mods: StatMods;
  element?: string;
}

export interface QuestObjective {
  type: "kill" | "interact" | "collect" | "boss" | "talk";
  target: string;
  count: number;
  progress: number;
}

export interface QuestData {
  id: string;
  name: string;
  description: string;
  type: "main" | "side";
  region: string;
  giver: string;
  objectives: QuestObjective[];
  rewards: { gold: number; xp: number; essence: number; item?: string };
}

export interface RegionData {
  id: string;
  name: string;
  theme: string;
  music: string;
  hazards: string[];
  enemyPool: string[];
  bossId: string;
  difficulty: number;
  unlockAfter: string | null;
  floor: string;
  wall: string;
  accent: string;
  fog: string;
  ambient: string;
  lore: string;
}

export interface SynergyData {
  id: string;
  name: string;
  required: string[];
  description: string;
  damageBonus: number;
  specialEffect: string | null;
  mods: StatMods;
}

export interface CurseData {
  id: string;
  name: string;
  description: string;
  negative: string;
  positive: string;
  riskReward: number;
  mods: StatMods;
  penalty: StatMods;
}

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  hidden: boolean;
  condition: { type: string; value: number; extra?: string };
}

export interface NPCData {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  color: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
}

export interface DialogueChoice {
  text: string;
  next: string | null;
  karma?: number;
  flag?: string;
  requireFlag?: string;
}

export interface DialogueTree {
  id: string;
  npc: string;
  states: Record<string, DialogueLine[]>;
}

export interface BossPatternData {
  id: string;
  name: string;
  hp: number;
  phases: number[];
  damage: number;
  speed: number;
  color: string;
  accent: string;
  w: number;
  h: number;
  intro: string;
  patterns: string[][];
}

export interface RunData {
  regionId: string;
  seed: number;
  floor: number;
  room: number;
  roomsCleared: number;
  blessings: string[];
  curses: string[];
  synergies: string[];
  gold: number;
  essence: number;
  kills: number;
  damageTaken: number;
  damageDealt: number;
  startTime: number;
  mode: "story" | "daily" | "endless" | "bossrush";
}

export interface MetaProgression {
  essence: number;
  upgrades: Record<string, number>;
  unlockedRegions: string[];
  unlockedBlessings: string[];
  bestiary: Record<string, number>;
  achievements: string[];
  lore: string[];
  totalRuns: number;
  totalKills: number;
  deaths: number;
  highestFloor: number;
  bossesDefeated: string[];
  playTime: number;
  ngPlus: number;
}

export interface GameSaveData {
  version: number;
  timestamp: number;
  playTime: number;
  player: {
    level: number;
    xp: number;
    hp: number;
    maxHp: number;
    gold: number;
    mastery: number;
    skills: string[];
    inventory: { id: string; qty: number }[];
    equipment: Record<string, string | null>;
  };
  karma: number;
  flags: Record<string, boolean>;
  storyPhase: "early" | "mid" | "late";
  completedQuests: string[];
  activeQuests: QuestData[];
  meta: MetaProgression;
  run: RunData | null;
  hubStage: number;
}

export interface GameEventMap {
  enemyKilled: { enemyId: string; x: number; y: number; elite: boolean };
  bossDefeated: { bossId: string; x: number; y: number };
  playerDied: { killer: string };
  playerHurt: { amount: number; x: number; y: number };
  runStarted: { run: RunData };
  runEnded: { run: RunData; survived: boolean };
  blessingAcquired: { blessing: BlessingData };
  synergyDetected: { synergy: SynergyData };
  regionEntered: { regionId: string };
  questCompleted: { questId: string };
  achievementUnlocked: { id: string };
  dungeonGenerated: { regionId: string; rooms: number };
  levelUp: { newLevel: number };
  skillUnlocked: { skillId: string };
  itemPickup: { itemId: string };
  choiceRecorded: { choiceId: string; karmaDelta: number };
  roomCleared: { type: RoomType };
  playerRespawned: Record<string, never>;
  curseApplied: { curse: CurseData };
  hit: { x: number; y: number; dmg: number; crit: boolean; element: string | null };
  parry: { perfect: boolean };
}

export interface Room {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: RoomType;
  cleared: boolean;
  connections: number[];
  discovered: boolean;
  cx: number;
  cy: number;
}

export interface DungeonMap {
  width: number;
  height: number;
  tiles: Uint8Array;
  rooms: Room[];
  entrance: { x: number; y: number };
  bossRoomId: number;
  seed: number;
}

export interface ActiveSynergy {
  id: string;
  name: string;
}
