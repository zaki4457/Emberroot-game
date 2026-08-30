import { Tile } from "@/data/enums";
import type { DungeonMap } from "@/data/types";
import { TILE as TS } from "@/engine/Constants";

const SOLID = new Set<number>([Tile.Void, Tile.Wall, Tile.Pit]);

export function tileAt(map: DungeonMap, x: number, y: number): number {
  const tx = Math.floor(x / TS);
  const ty = Math.floor(y / TS);
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return Tile.Wall;
  return map.tiles[ty * map.width + tx];
}

export function isSolidTile(t: number): boolean {
  return SOLID.has(t);
}

export function isSolidWorld(map: DungeonMap, x: number, y: number): boolean {
  return isSolidTile(tileAt(map, x, y));
}

export function moveWithCollisions(
  map: DungeonMap,
  x: number,
  y: number,
  vx: number,
  vy: number,
  hw: number,
  hh: number,
  dt: number
): { x: number; y: number; hitX: boolean; hitY: boolean } {
  let nx = x + vx * dt;
  let ny = y + vy * dt;
  let hitX = false;
  let hitY = false;
  if (overlapsSolid(map, nx, y, hw, hh)) {
    nx = x;
    hitX = true;
  }
  if (overlapsSolid(map, nx, ny, hw, hh)) {
    ny = y;
    hitY = true;
  }
  return { x: nx, y: ny, hitX, hitY };
}

export function overlapsSolid(
  map: DungeonMap,
  x: number,
  y: number,
  hw: number,
  hh: number
): boolean {
  const x0 = x - hw;
  const x1 = x + hw;
  const y0 = y - hh;
  const y1 = y + hh;
  for (let py = y0; py <= y1; py += TS / 2) {
    for (let px = x0; px <= x1; px += TS / 2) {
      if (isSolidWorld(map, px, py)) return true;
    }
  }
  return (
    isSolidWorld(map, x0, y0) ||
    isSolidWorld(map, x1, y0) ||
    isSolidWorld(map, x0, y1) ||
    isSolidWorld(map, x1, y1)
  );
}

export function los(
  map: DungeonMap,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): boolean {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(2, Math.ceil(dist / 6));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    const tile = tileAt(map, x, y);
    if (tile === Tile.Wall || tile === Tile.Void) return false;
  }
  return true;
}

export function tileFriction(t: number): number {
  if (t === Tile.Ice) return 0.08;
  if (t === Tile.Water) return 0.72;
  return 1;
}

export function tileHazard(t: number): { kind: string; dps: number } | null {
  if (t === Tile.Lava) return { kind: "burn", dps: 14 };
  if (t === Tile.Water) return { kind: "slow", dps: 0 };
  return null;
}
