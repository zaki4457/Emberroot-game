import { Tile } from "@/data/enums";
import type { DungeonMap, RegionData } from "@/data/types";
import { TILE } from "@/engine/Constants";
import { atlas } from "./sprites";
import type { Camera } from "./Camera";

const TILE_KEY: Record<number, string> = {
  [Tile.Floor]: "tile_floor",
  [Tile.Wall]: "tile_wall",
  [Tile.Corridor]: "tile_corridor",
  [Tile.Door]: "tile_door",
  [Tile.Water]: "tile_water",
  [Tile.Lava]: "tile_lava",
  [Tile.Ice]: "tile_ice",
  [Tile.Grass]: "tile_grass",
  [Tile.Crystal]: "tile_crystal",
  [Tile.Wood]: "tile_wood",
};

export function paintTileCache(map: DungeonMap, region: RegionData): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = map.width * TILE;
  c.height = map.height * TILE;
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  g.fillStyle = region.fog;
  g.fillRect(0, 0, c.width, c.height);
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const t = map.tiles[y * map.width + x];
      if (t === Tile.Void) continue;
      let key = TILE_KEY[t] ?? "tile_floor";
      if (t === Tile.Floor) {
        if (region.theme === "mines") key = "tile_crystal";
        else if (region.theme === "volcano") key = "tile_wood";
        else if (region.theme === "ice") key = "tile_ice";
        else if (region.theme === "water") key = "tile_water";
        else if (region.theme === "forest") key = "tile_grass";
        else key = "tile_floor";
      }
      const spr = atlas.get(key) ?? atlas.get("tile_floor");
      if (spr) g.drawImage(spr, x * TILE, y * TILE);
      else {
        g.fillStyle = t === Tile.Wall ? region.wall : region.floor;
        g.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }
  return c;
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  key: string,
  x: number,
  y: number,
  opts?: { flipX?: boolean; flash?: number; alpha?: number; scale?: number }
): void {
  const s = atlas.get(key);
  if (!s) {
    ctx.fillStyle = "#ff6b35";
    ctx.fillRect(x - 4, y - 8, 8, 8);
    return;
  }
  const sc = opts?.scale ?? 1;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (opts?.flipX) ctx.scale(-1, 1);
  ctx.globalAlpha = opts?.alpha ?? 1;
  if (opts?.flash && opts.flash > 0) ctx.filter = "brightness(2.4)";
  ctx.drawImage(s, -((s.width * sc) / 2), -s.height * sc + 2, s.width * sc, s.height * sc);
  ctx.restore();
}

export function drawLighting(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  lights: { x: number; y: number; r: number; a?: number }[],
  ambient = 0.62
): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(4,2,10,${ambient})`;
  ctx.fillRect(0, 0, cam.w, cam.h);
  ctx.globalCompositeOperation = "destination-out";
  for (const l of lights) {
    const sx = l.x - cam.x;
    const sy = l.y - cam.y;
    const grd = ctx.createRadialGradient(sx, sy, 4, sx, sy, l.r);
    grd.addColorStop(0, `rgba(0,0,0,${l.a ?? 0.9})`);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(sx, sy, l.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawMinimap(
  canvas: HTMLCanvasElement,
  map: DungeonMap,
  px: number,
  py: number
): void {
  const g = canvas.getContext("2d");
  if (!g) return;
  const w = canvas.width;
  const h = canvas.height;
  g.fillStyle = "rgba(0,0,0,0.75)";
  g.fillRect(0, 0, w, h);
  const sx = w / map.width;
  const sy = h / map.height;
  for (const r of map.rooms) {
    if (!r.discovered) continue;
    g.fillStyle =
      r.type === "boss"
        ? "#e94560"
        : r.type === "entrance"
          ? "#4ecdc4"
          : r.type === "shop"
            ? "#ffd700"
            : r.type === "healing"
              ? "#88ff88"
              : r.cleared
                ? "#533483"
                : "#3a3a55";
    g.fillRect(r.x * sx, r.y * sy, r.w * sx, r.h * sy);
  }
  g.fillStyle = "#ff6b35";
  g.fillRect((px / TILE) * sx - 1, (py / TILE) * sy - 1, 3, 3);
}
