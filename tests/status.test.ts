import { describe, expect, it } from "vitest";
import { applyStatus, makeStatus, tickStatus } from "../src/combat/StatusEffects";
import { tryReaction } from "../src/combat/ElementalReactions";

describe("status effects", () => {
  it("ticks burn damage", () => {
    const c = makeStatus();
    applyStatus(c, "burn", 2, 1, 2);
    const r = tickStatus(c, 0.51);
    expect(r.hpDelta).toBe(-10);
  });
  it("stun roots and blocks attacks", () => {
    const c = makeStatus();
    applyStatus(c, "stun", 1, 0);
    const r = tickStatus(c, 0.01);
    expect(r.rooted).toBe(true);
    expect(r.noAttack).toBe(true);
  });
  it("melt reaction", () => {
    const c = makeStatus();
    applyStatus(c, "freeze", 2, 0);
    const rx = tryReaction(c, "burn");
    expect(rx?.name).toBe("MELT");
  });
});
