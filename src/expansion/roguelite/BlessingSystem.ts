import { BLESSING_BY_ID, BLESSINGS } from "@/data/blessings";
import { RARITY_WEIGHTS, type RarityType, type WardenType } from "@/data/enums";
import type { BlessingData } from "@/data/types";
import { SeededRandom } from "@/engine/SeededRandom";

export function wardenAffinity(owned: string[]): Record<WardenType, number> {
  const a: Record<WardenType, number> = { ember: 0, frost: 0, storm: 0, void: 0 };
  for (const id of owned) {
    const b = BLESSING_BY_ID[id];
    if (b) a[b.warden]++;
  }
  return a;
}

export function rollBlessings(owned: string[], seed: number, count = 3): BlessingData[] {
  const rng = new SeededRandom(seed);
  const have = new Set(owned);
  const aff = wardenAffinity(owned);
  const pool = BLESSINGS.filter((b) => !have.has(b.id));
  const picks: BlessingData[] = [];
  const used = new Set<string>();
  for (let n = 0; n < count && pool.length; n++) {
    const weights = pool.map((b) => {
      if (used.has(b.id)) return 0;
      let w = RARITY_WEIGHTS[b.rarity as RarityType];
      if (aff[b.warden] >= 2) w *= 1.35;
      return w;
    });
    const total = weights.reduce((s, x) => s + x, 0);
    if (total <= 0) break;
    let r = rng.range(0, total);
    let chosen = pool[0];
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        chosen = pool[i];
        break;
      }
    }
    picks.push(chosen);
    used.add(chosen.id);
  }
  return picks;
}

export function blessingPrefixMatch(owned: string[], requiredPrefix: string): boolean {
  return owned.some((id) => id.startsWith(requiredPrefix) || id === requiredPrefix);
}
