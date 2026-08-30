import { SYNERGIES } from "@/data/synergies";
import type { SynergyData } from "@/data/types";

/** required entries are prefixes like "ember_strike" matching "ember_strike_rare" */
export function detectSynergies(ownedBlessingIds: string[]): SynergyData[] {
  const hit = (req: string) =>
    ownedBlessingIds.some((id) => id === req || id.startsWith(req + "_") || id.startsWith(req));
  return SYNERGIES.filter((s) => s.required.every(hit));
}
