import { RoomType, Tile } from "@/data/enums";
import type { DungeonMap, Room } from "@/data/types";
import { SeededRandom } from "@/engine/SeededRandom";
import { TILE } from "@/engine/Constants";

class UF {
  p: number[];
  r: number[];
  constructor(n: number) {
    this.p = Array.from({ length: n }, (_, i) => i);
    this.r = Array(n).fill(0);
  }
  find(x: number): number {
    while (this.p[x] !== x) {
      this.p[x] = this.p[this.p[x]];
      x = this.p[x];
    }
    return x;
  }
  union(a: number, b: number): boolean {
    a = this.find(a);
    b = this.find(b);
    if (a === b) return false;
    if (this.r[a] < this.r[b]) [a, b] = [b, a];
    this.p[b] = a;
    if (this.r[a] === this.r[b]) this.r[a]++;
    return true;
  }
}

function overlaps(a: Room, b: Room, pad: number): boolean {
  return !(
    a.x + a.w + pad <= b.x ||
    b.x + b.w + pad <= a.x ||
    a.y + a.h + pad <= b.y ||
    b.y + b.h + pad <= a.y
  );
}

function carveRoom(tiles: Uint8Array, w: number, room: Room): void {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      const edge =
        x === room.x || y === room.y || x === room.x + room.w - 1 || y === room.y + room.h - 1;
      tiles[y * w + x] = edge ? Tile.Wall : Tile.Floor;
    }
  }
}

function carveCorridor(
  tiles: Uint8Array,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  rng: SeededRandom,
  width = 2
): void {
  const horizFirst = rng.chance(0.5);
  const carve = (x: number, y: number) => {
    for (let oy = 0; oy < width; oy++) {
      for (let ox = 0; ox < width; ox++) {
        const tx = x + ox;
        const ty = y + oy;
        if (tx <= 0 || ty <= 0 || tx >= w - 1 || ty >= h - 1) continue;
        const i = ty * w + tx;
        if (tiles[i] === Tile.Void) tiles[i] = Tile.Corridor;
        if (tiles[i] === Tile.Wall) tiles[i] = Tile.Door;
      }
    }
  };
  const hline = (xa: number, xb: number, y: number) => {
    const s = xa < xb ? 1 : -1;
    for (let x = xa; x !== xb + s; x += s) carve(x, y);
  };
  const vline = (ya: number, yb: number, x: number) => {
    const s = ya < yb ? 1 : -1;
    for (let y = ya; y !== yb + s; y += s) carve(x, y);
  };
  if (horizFirst) {
    hline(x0, x1, y0);
    vline(y0, y1, x1);
  } else {
    vline(y0, y1, x0);
    hline(x0, x1, y1);
  }
}

function thickenWalls(tiles: Uint8Array, w: number, h: number): void {
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (tiles[i] !== Tile.Void) continue;
      let near = false;
      for (let oy = -1; oy <= 1 && !near; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const t = tiles[(y + oy) * w + (x + ox)];
          if (t === Tile.Floor || t === Tile.Corridor || t === Tile.Door) near = true;
        }
      }
      if (near) tiles[i] = Tile.Wall;
    }
  }
}

const TYPE_WEIGHTS: { t: RoomType; w: number }[] = [
  { t: RoomType.Combat, w: 40 },
  { t: RoomType.Challenge, w: 20 },
  { t: RoomType.Treasure, w: 15 },
  { t: RoomType.Shop, w: 10 },
  { t: RoomType.Healing, w: 15 },
];

function pickType(rng: SeededRandom, used: Record<string, number>): RoomType {
  const pool = TYPE_WEIGHTS.filter((x) => {
    if (x.t === RoomType.Shop && (used.shop ?? 0) >= 1) return false;
    if (x.t === RoomType.Healing && (used.heal ?? 0) >= 2) return false;
    return true;
  });
  const total = pool.reduce((s, x) => s + x.w, 0);
  let r = rng.range(0, total);
  for (const x of pool) {
    r -= x.w;
    if (r <= 0) {
      if (x.t === RoomType.Shop) used.shop = (used.shop ?? 0) + 1;
      if (x.t === RoomType.Healing) used.heal = (used.heal ?? 0) + 1;
      return x.t;
    }
  }
  return RoomType.Combat;
}

export function generateDungeon(seed: number, opts?: { rooms?: number; w?: number; h?: number }): DungeonMap {
  const rng = new SeededRandom(seed);
  const width = opts?.w ?? 60;
  const height = opts?.h ?? 60;
  const roomCount = opts?.rooms ?? rng.int(8, 14);
  const tiles = new Uint8Array(width * height);
  const rooms: Room[] = [];

  for (let attempt = 0; attempt < 400 && rooms.length < roomCount; attempt++) {
    const w = rng.int(6, 12);
    const h = rng.int(6, 11);
    const x = rng.int(2, width - w - 3);
    const y = rng.int(2, height - h - 3);
    const room: Room = {
      id: rooms.length,
      x,
      y,
      w,
      h,
      type: RoomType.Combat,
      cleared: false,
      connections: [],
      discovered: false,
      cx: x + (w / 2 | 0),
      cy: y + (h / 2 | 0),
    };
    if (rooms.some((o) => overlaps(room, o, 3))) continue;
    rooms.push(room);
  }

  if (rooms.length < 5) {
    return generateDungeon(seed + 17, opts);
  }

  const edges: { a: number; b: number; d: number }[] = [];
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const d = Math.abs(rooms[i].cx - rooms[j].cx) + Math.abs(rooms[i].cy - rooms[j].cy);
      edges.push({ a: i, b: j, d });
    }
  }
  edges.sort((a, b) => a.d - b.d);
  const uf = new UF(rooms.length);
  const usedEdges: typeof edges = [];
  for (const e of edges) {
    if (uf.union(e.a, e.b)) usedEdges.push(e);
  }
  const extra = Math.max(1, Math.floor(usedEdges.length * 0.15));
  let added = 0;
  for (const e of edges) {
    if (added >= extra) break;
    if (usedEdges.includes(e)) continue;
    usedEdges.push(e);
    added++;
  }

  for (const r of rooms) carveRoom(tiles, width, r);
  for (const e of usedEdges) {
    rooms[e.a].connections.push(e.b);
    rooms[e.b].connections.push(e.a);
    carveCorridor(tiles, width, height, rooms[e.a].cx, rooms[e.a].cy, rooms[e.b].cx, rooms[e.b].cy, rng, 2);
  }
  thickenWalls(tiles, width, height);

  const cx = rooms.reduce((s, r) => s + r.cx, 0) / rooms.length;
  const cy = rooms.reduce((s, r) => s + r.cy, 0) / rooms.length;
  let entrance = rooms[0];
  let best = -1;
  for (const r of rooms) {
    const d = Math.hypot(r.cx - cx, r.cy - cy);
    if (d > best) {
      best = d;
      entrance = r;
    }
  }
  entrance.type = RoomType.Entrance;
  entrance.cleared = true;
  entrance.discovered = true;

  let boss = rooms[0];
  best = -1;
  for (const r of rooms) {
    if (r === entrance) continue;
    const d = Math.abs(r.cx - entrance.cx) + Math.abs(r.cy - entrance.cy);
    if (d > best) {
      best = d;
      boss = r;
    }
  }
  boss.type = RoomType.Boss;

  const used: Record<string, number> = {};
  for (const r of rooms) {
    if (r.type === RoomType.Entrance || r.type === RoomType.Boss) continue;
    r.type = pickType(rng, used);
  }

  if (rng.chance(0.35)) {
    for (let k = 0; k < 40; k++) {
      const w = rng.int(5, 7);
      const h = rng.int(5, 7);
      const x = rng.int(2, width - w - 3);
      const y = rng.int(2, height - h - 3);
      const secret: Room = {
        id: rooms.length,
        x,
        y,
        w,
        h,
        type: RoomType.Secret,
        cleared: false,
        connections: [],
        discovered: false,
        cx: x + (w / 2 | 0),
        cy: y + (h / 2 | 0),
      };
      if (rooms.some((o) => overlaps(secret, o, 1))) continue;
      rooms.push(secret);
      carveRoom(tiles, width, secret);
      const near = rooms.filter((r) => r !== secret).sort(
        (a, b) =>
          Math.hypot(a.cx - secret.cx, a.cy - secret.cy) -
          Math.hypot(b.cx - secret.cx, b.cy - secret.cy)
      )[0];
      if (near) {
        carveCorridor(tiles, width, height, secret.cx, secret.cy, near.cx, near.cy, rng, 1);
        secret.connections.push(near.id);
      }
      break;
    }
  }

  const ex = (entrance.cx + 0.5) * TILE;
  const ey = (entrance.cy + 0.5) * TILE;

  return {
    width,
    height,
    tiles,
    rooms,
    entrance: { x: ex, y: ey },
    bossRoomId: boss.id,
    seed,
  };
}

export function dungeonConnected(map: DungeonMap): boolean {
  const start = map.rooms.find((r) => r.type === RoomType.Entrance);
  const boss = map.rooms.find((r) => r.id === map.bossRoomId);
  if (!start || !boss) return false;
  const seen = new Set<number>([start.id]);
  const q = [start.id];
  while (q.length) {
    const id = q.pop()!;
    const r = map.rooms[id];
    if (!r) continue;
    for (const c of r.connections) {
      if (!seen.has(c)) {
        seen.add(c);
        q.push(c);
      }
    }
  }
  return seen.has(boss.id);
}

export function roomAt(map: DungeonMap, px: number, py: number): Room | null {
  const tx = Math.floor(px / TILE);
  const ty = Math.floor(py / TILE);
  for (const r of map.rooms) {
    if (tx >= r.x + 1 && tx < r.x + r.w - 1 && ty >= r.y + 1 && ty < r.y + r.h - 1) return r;
  }
  return null;
}
