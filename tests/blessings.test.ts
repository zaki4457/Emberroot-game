import { describe, expect, it } from "vitest";
import { BLESSINGS } from "../src/data/blessings";
import { SYNERGIES } from "../src/data/synergies";
import { rollBlessings } from "../src/expansion/roguelite/BlessingSystem";
import { detectSynergies } from "../src/expansion/roguelite/SynergyChecker";
import { SKILLS } from "../src/data/skills";
import { ENEMIES } from "../src/data/enemies";
import { BOSSES } from "../src/data/bosses";
import { REGIONS } from "../src/data/regions";
import { CURSES } from "../src/data/curses";
import { ACHIEVEMENTS } from "../src/data/achievements";

describe("content counts", () => {
  it("has 140 unique blessings", () => {
    expect(BLESSINGS.length).toBe(140);
    expect(new Set(BLESSINGS.map((b) => b.id)).size).toBe(140);
  });
  it("has 39 synergies", () => {
    expect(SYNERGIES.length).toBe(39);
  });
  it("has 30 skills", () => expect(SKILLS.length).toBe(30));
  it("has 24 enemies", () => expect(ENEMIES.length).toBe(24));
  it("has 11 bosses", () => expect(BOSSES.length).toBe(11));
  it("has 9 regions", () => expect(REGIONS.length).toBe(9));
  it("has 10 curses", () => expect(CURSES.length).toBe(10));
  it("has 50 achievements", () => expect(ACHIEVEMENTS.length).toBe(50));
});

describe("blessing rolls", () => {
  it("never duplicates owned ids", () => {
    const owned = [BLESSINGS[0].id, BLESSINGS[1].id];
    const picks = rollBlessings(owned, 42, 3);
    expect(picks).toHaveLength(3);
    expect(picks.some((p) => owned.includes(p.id))).toBe(false);
    expect(new Set(picks.map((p) => p.id)).size).toBe(3);
  });
});

describe("synergies", () => {
  it("detects flame dance from ember strike + pulse of any rarity", () => {
    const ids = ["ember_strike_common", "ember_pulse_rare"];
    const syn = detectSynergies(ids);
    expect(syn.some((s) => s.id === "flame_dance")).toBe(true);
  });
  it("does not false-positive", () => {
    expect(detectSynergies(["ember_strike_common"])).toHaveLength(0);
  });
});
