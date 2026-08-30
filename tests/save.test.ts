import { describe, expect, it } from "vitest";
import { defaultSave, metaCost, emptyMeta } from "../src/core/SaveSystem";
import { SeededRandom, dateSeed } from "../src/engine/SeededRandom";

describe("save defaults", () => {
  it("starts in early story with woods unlocked", () => {
    const s = defaultSave();
    expect(s.version).toBe(1);
    expect(s.karma).toBe(0);
    expect(s.meta.unlockedRegions).toContain("whispering_woods");
    expect(s.player.equipment.weapon).toBe("rusty_sword");
  });
  it("meta cost scales", () => {
    expect(metaCost(0)).toBe(5);
    expect(metaCost(1)).toBe(8);
    expect(emptyMeta().upgrades.vigor).toBe(0);
  });
});

describe("rng", () => {
  it("is deterministic", () => {
    const a = new SeededRandom(99);
    const b = new SeededRandom(99);
    expect(a.next()).toBe(b.next());
    expect(a.int(0, 10)).toBe(b.int(0, 10));
  });
  it("dateSeed is stable for a day", () => {
    const d = new Date("2026-08-30T12:00:00Z");
    expect(dateSeed(d)).toBe(20260830);
  });
});
