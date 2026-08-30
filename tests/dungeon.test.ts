import { describe, expect, it } from "vitest";
import { dungeonConnected, generateDungeon } from "../src/world/DungeonGenerator";
import { RoomType } from "../src/data/enums";

describe("procedural dungeon", () => {
  it("produces connected entrance-to-boss for many seeds", () => {
    for (let s = 1; s <= 40; s++) {
      const d = generateDungeon(s * 97);
      expect(d.rooms.length).toBeGreaterThanOrEqual(5);
      expect(dungeonConnected(d)).toBe(true);
      const ent = d.rooms.find((r) => r.type === RoomType.Entrance);
      const boss = d.rooms.find((r) => r.type === RoomType.Boss);
      expect(ent).toBeTruthy();
      expect(boss).toBeTruthy();
      expect(ent!.id).not.toBe(boss!.id);
    }
  });

  it("is deterministic", () => {
    const a = generateDungeon(12345);
    const b = generateDungeon(12345);
    expect(a.rooms.length).toBe(b.rooms.length);
    expect([...a.tiles]).toEqual([...b.tiles]);
  });
});
