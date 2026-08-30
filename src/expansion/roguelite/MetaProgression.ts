import { metaCost, META_UPGRADES } from "@/core/SaveSystem";
import type { MetaProgression } from "@/data/types";

export { META_UPGRADES, metaCost };

export function upgradeRank(meta: MetaProgression, id: string): boolean {
  const rank = meta.upgrades[id] ?? 0;
  if (rank >= 20) return false;
  const cost = metaCost(rank);
  if (meta.essence < cost) return false;
  meta.essence -= cost;
  meta.upgrades[id] = rank + 1;
  return true;
}

export function metaBonuses(meta: MetaProgression) {
  const v = meta.upgrades.vigor ?? 0;
  const s = meta.upgrades.steel ?? 0;
  const h = meta.upgrades.haste ?? 0;
  const f = meta.upgrades.fortune ?? 0;
  const m = meta.upgrades.memory ?? 0;
  return {
    hp: v * 4,
    damage: s * 0.03,
    speed: h * 0.02,
    attackSpeed: h * 0.02,
    gold: f * 0.04,
    luck: f * 0.04,
    xp: m * 0.02,
    shield: m * 2,
  };
}
