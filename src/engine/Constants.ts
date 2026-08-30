export const TILE = 16;
export const MAX_DT = 0.05;
export const FIXED_DT = 1 / 60;
export const PLAYER_SPEED = 92;
export const PLAYER_RADIUS = 6;
export const DODGE_SPEED = 210;
export const DODGE_TIME = 0.22;
export const IFRAME_DODGE = 0.2;
export const MELEE_RANGE = 22;
export const RANGED_SPEED = 180;
export const STAMINA_MAX = 100;
export const STAMINA_REGEN = 28;
export const XP_PER_LEVEL = 50;
export const MAX_LEVEL = 20;
export const AUTO_SAVE_MS = 5 * 60 * 1000;
export const SAVE_KEY = "emberroot_save_v1";
export const SETTINGS_KEY = "emberroot_settings_v1";
export const LIGHT_RADIUS = 88;
export const PARTICLE_CAP = 900;
export const PROJECTILE_CAP = 80;

export const LAYERS = {
  floor: 0,
  deco: 1,
  shadow: 2,
  entity: 5,
  player: 6,
  vfx: 8,
  overlay: 10,
} as const;

export const COLLISION = {
  player: "player",
  enemy: "enemy",
  projectile: "projectile",
  wall: "wall",
  pickup: "pickup",
  trigger: "trigger",
} as const;
