import { describe, expect, it } from "vitest";
import { computeDamage, addMods, sumMods } from "../src/combat/CombatMath";
import { defenseReduction, xpForLevel } from "../src/engine/MathUtils";

describe("damage pipeline", () => {
  it("never returns below 1", () => {
    const r = computeDamage({
      baseDamage: 0,
      power: 0,
      skillMult: 0,
      blessingMult: 0,
      synergyMult: 0,
      comboCount: 0,
      critChance: 0,
      critMultiplier: 2,
      defense: 999,
      vulnerable: false,
    });
    expect(r.dmg).toBeGreaterThanOrEqual(1);
    expect(r.crit).toBe(false);
  });

  it("applies combo and vulnerability", () => {
    const a = computeDamage({
      baseDamage: 10,
      power: 0,
      skillMult: 1,
      blessingMult: 1,
      synergyMult: 1,
      comboCount: 5,
      critChance: 0,
      critMultiplier: 2,
      defense: 0,
      vulnerable: true,
    });
    expect(a.dmg).toBe(Math.round(10 * 1.5 * 1.25));
  });

  it("defense reduction approaches but never reaches 100%", () => {
    expect(defenseReduction(100, 0)).toBe(100);
    expect(defenseReduction(100, 100)).toBe(50);
    expect(defenseReduction(100, 10000)).toBeLessThan(2);
  });
});

describe("stat mods", () => {
  it("sums numeric fields", () => {
    const s = sumMods([{ damage: 0.1 }, { damage: 0.2, critChance: 0.05 }]);
    expect(s.damage).toBeCloseTo(0.3);
    expect(s.critChance).toBeCloseTo(0.05);
  });
  it("addMods keeps onHitStatus", () => {
    const m = addMods({}, { onHitStatus: "burn", onHitChance: 0.2 });
    expect(m.onHitStatus).toBe("burn");
  });
});

describe("xp curve", () => {
  it("is 50 * level", () => {
    expect(xpForLevel(1)).toBe(50);
    expect(xpForLevel(10)).toBe(500);
  });
});
