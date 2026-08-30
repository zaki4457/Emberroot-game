import { defenseReduction } from "@/engine/MathUtils";
import type { StatMods } from "@/data/types";

export interface AttackContext {
  baseDamage: number;
  power: number;
  skillMult: number;
  blessingMult: number;
  synergyMult: number;
  comboCount: number;
  critChance: number;
  critMultiplier: number;
  defense: number;
  vulnerable: boolean;
}

export function computeDamage(ctx: AttackContext): { dmg: number; crit: boolean } {
  let dmg = (ctx.baseDamage + ctx.power) * ctx.skillMult * ctx.blessingMult * ctx.synergyMult;
  dmg *= 1 + ctx.comboCount * 0.1;
  const crit = Math.random() < ctx.critChance;
  if (crit) dmg *= ctx.critMultiplier;
  dmg = defenseReduction(dmg, ctx.defense);
  if (ctx.vulnerable) dmg *= 1.25;
  return { dmg: Math.max(1, Math.round(dmg)), crit };
}

export function emptyMods(): Required<StatMods> {
  return {
    damage: 0,
    attackSpeed: 0,
    moveSpeed: 0,
    maxHp: 0,
    defense: 0,
    critChance: 0,
    critDamage: 0,
    lifesteal: 0,
    staminaRegen: 0,
    cooldown: 0,
    area: 0,
    projectile: 0,
    dodgeIFrames: 0,
    luck: 0,
    xpGain: 0,
    goldGain: 0,
    onHitStatus: undefined as unknown as never,
    onHitChance: 0,
  };
}

export function addMods(a: StatMods, b: StatMods): StatMods {
  const o: StatMods = { ...a };
  (Object.keys(b) as (keyof StatMods)[]).forEach((k) => {
    const bv = b[k];
    if (bv === undefined) return;
    if (typeof bv === "number") {
      const av = (o[k] as number | undefined) ?? 0;
      (o[k] as number) = av + bv;
    } else if (k === "onHitStatus" && bv) {
      o.onHitStatus = bv;
    }
  });
  return o;
}

export function sumMods(list: StatMods[]): StatMods {
  return list.reduce((a, b) => addMods(a, b), {});
}
