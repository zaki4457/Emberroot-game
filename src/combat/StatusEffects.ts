import { STATUS_META, type StatusEffectType } from "@/data/enums";
import type { ActiveStatusEffectData, StatusEffectComponent } from "@/data/types";

export function makeStatus(): StatusEffectComponent {
  return { effects: new Map() };
}

export function applyStatus(
  c: StatusEffectComponent,
  type: StatusEffectType,
  duration: number,
  source: number,
  stacks = 1
): void {
  const meta = STATUS_META[type];
  const existing = c.effects.get(type);
  if (existing) {
    existing.duration = Math.max(existing.duration, duration);
    existing.maxDuration = Math.max(existing.maxDuration, duration);
    existing.stacks = Math.min(meta.maxStacks, existing.stacks + stacks);
    existing.source = source;
    return;
  }
  c.effects.set(type, {
    type,
    duration,
    maxDuration: duration,
    stacks: Math.min(meta.maxStacks, stacks),
    tickTimer: meta.tick,
    tickRate: meta.tick,
    source,
  });
}

export function hasStatus(c: StatusEffectComponent, type: StatusEffectType): boolean {
  return c.effects.has(type);
}

export function clearHarmful(c: StatusEffectComponent): void {
  for (const k of [...c.effects.keys()]) {
    if (k !== "shield" && k !== "haste" && k !== "regen" && k !== "stealth" && k !== "berserk") {
      c.effects.delete(k);
    }
  }
}

export interface StatusTickResult {
  hpDelta: number;
  speedMul: number;
  rooted: boolean;
  noAttack: boolean;
  dmgMul: number;
  takenMul: number;
  stealthed: boolean;
  ticks: ActiveStatusEffectData[];
}

export function tickStatus(c: StatusEffectComponent, dt: number): StatusTickResult {
  let hpDelta = 0;
  let speedMul = 1;
  let rooted = false;
  let noAttack = false;
  let dmgMul = 1;
  let takenMul = 1;
  let stealthed = false;
  const ticks: ActiveStatusEffectData[] = [];

  for (const [k, e] of c.effects) {
    e.duration -= dt;
    if (e.duration <= 0) {
      c.effects.delete(k);
      continue;
    }
    switch (e.type) {
      case "slow":
        speedMul *= 0.5;
        break;
      case "freeze":
        speedMul *= 0.15;
        rooted = true;
        break;
      case "stun":
        rooted = true;
        noAttack = true;
        break;
      case "haste":
        speedMul *= 1.4;
        break;
      case "stealth":
        stealthed = true;
        break;
      case "berserk":
        dmgMul *= 1.5;
        takenMul *= 1.25;
        break;
      case "vulnerable":
        takenMul *= 1.25;
        break;
    }
    if (e.tickRate > 0) {
      e.tickTimer -= dt;
      if (e.tickTimer <= 0) {
        e.tickTimer += e.tickRate;
        ticks.push(e);
        if (e.type === "burn") hpDelta -= 5 * e.stacks;
        if (e.type === "shock") hpDelta -= 3 * e.stacks;
        if (e.type === "poison") hpDelta -= 3 * e.stacks;
        if (e.type === "bleed") hpDelta -= 4 * e.stacks;
        if (e.type === "regen") hpDelta += 2 * e.stacks;
      }
    }
  }
  return { hpDelta, speedMul, rooted, noAttack, dmgMul, takenMul, stealthed, ticks };
}
