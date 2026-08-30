import { ENEMIES } from "@/data/enemies";
import { BOSSES } from "@/data/bosses";
import { NPCS } from "@/data/npcs";

export const atlas = new Map<string, HTMLCanvasElement>();

function canvas(w: number, h: number): { c: HTMLCanvasElement; g: CanvasRenderingContext2D } {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  return { c, g };
}

function px(g: CanvasRenderingContext2D, x: number, y: number, s: string): void {
  g.fillStyle = s;
  g.fillRect(x, y, 1, 1);
}

function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, s: string): void {
  g.fillStyle = s;
  g.fillRect(x, y, w, h);
}

function bakePixels(rows: string[], pal: Record<string, string>): HTMLCanvasElement {
  const h = rows.length;
  const w = rows[0].length;
  const { c, g } = canvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const col = pal[rows[y][x]];
      if (col) px(g, x, y, col);
    }
  }
  return c;
}

const PLAYER_PAL: Record<string, string> = {
  "0": "#1a1020",
  "1": "#2a2a4a",
  "2": "#5a5a7a",
  "3": "#e8c4a0",
  "4": "#ff6b35",
  "5": "#e94560",
  "7": "#4ecdc4",
  "8": "#c0c0d0",
  "9": "#ffaa33",
};

const PLAYER_IDLE = [
  "..000000..",
  ".00444400.",
  ".00333300.",
  ".03733730.",
  ".00333300.",
  "0011111100",
  "0511221150",
  "0.122221.0",
  "08.1111.80",
  ".01100110.",
  ".011..110.",
  ".00....00.",
];

function humanoid(w: number, h: number, body: string, accent: string, eye = "#fff"): HTMLCanvasElement {
  const { c, g } = canvas(w, h);
  const cx = (w / 2) | 0;
  rect(g, cx - 3, 2, 6, 5, body);
  rect(g, cx - 2, 3, 2, 2, eye);
  rect(g, cx + 1, 3, 2, 2, eye);
  px(g, cx - 1, 3, "#111");
  px(g, cx + 2, 3, "#111");
  rect(g, cx - 4, 7, 8, 6, body);
  rect(g, cx - 3, 8, 6, 3, accent);
  rect(g, cx - 3, 13, 2, 3, "#222");
  rect(g, cx + 1, 13, 2, 3, "#222");
  rect(g, 1, 8, 2, 5, accent);
  rect(g, w - 3, 8, 2, 5, body);
  return c;
}

function blob(w: number, h: number, body: string, accent: string): HTMLCanvasElement {
  const { c, g } = canvas(w, h);
  g.fillStyle = body;
  g.beginPath();
  g.ellipse(w / 2, h / 2 + 1, w / 2 - 1, h / 2 - 2, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = accent;
  g.fillRect((w / 2) - 3, (h / 2) - 2, 2, 2);
  g.fillRect((w / 2) + 1, (h / 2) - 2, 2, 2);
  g.fillStyle = "rgba(255,255,255,0.35)";
  g.fillRect(2, 2, 3, 2);
  return c;
}

function tileNoise(g: CanvasRenderingContext2D, w: number, h: number, a: string, b: string): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      px(g, x, y, (x * 13 + y * 7) % 5 === 0 ? b : a);
    }
  }
}

function makeTile(a: string, b: string, wall = false): HTMLCanvasElement {
  const { c, g } = canvas(16, 16);
  tileNoise(g, 16, 16, a, b);
  if (wall) {
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.fillRect(0, 0, 16, 2);
    g.fillRect(0, 14, 16, 2);
    g.fillStyle = "rgba(255,255,255,0.08)";
    g.fillRect(0, 2, 16, 1);
  }
  return c;
}

function chest(): HTMLCanvasElement {
  const { c, g } = canvas(16, 12);
  rect(g, 2, 4, 12, 8, "#6b4c2a");
  rect(g, 2, 4, 12, 4, "#8d6e43");
  rect(g, 7, 6, 2, 3, "#ffd700");
  rect(g, 2, 4, 12, 1, "#3e2723");
  return c;
}

function portal(): HTMLCanvasElement {
  const { c, g } = canvas(16, 20);
  for (let i = 0; i < 8; i++) {
    g.strokeStyle = i % 2 ? "#9b59b6" : "#ff6b35";
    g.strokeRect(3 + i * 0.4, 2 + i * 0.4, 10 - i * 0.8, 16 - i * 0.8);
  }
  return c;
}

export function bakeSprites(): void {
  atlas.clear();
  atlas.set("player", bakePixels(PLAYER_IDLE, PLAYER_PAL));
  atlas.set(
    "player_walk",
    bakePixels(
      [
        "..000000..",
        ".00444400.",
        ".00333300.",
        ".03733730.",
        ".00333300.",
        "0011111100",
        "0511221150",
        "0.122221.0",
        "08.1111.80",
        ".011..110.",
        ".011...10.",
        ".00....00.",
      ],
      PLAYER_PAL
    )
  );
  for (const e of ENEMIES) {
    if (e.aiType === "hopper" || e.id.includes("slime") || e.id.includes("spawn")) {
      atlas.set(e.id, blob(e.w, e.h, e.color, e.accent));
    } else if (e.id.includes("spider") || e.id.includes("crawler") || e.id.includes("wurm") || e.id.includes("tentacle")) {
      const { c, g } = canvas(e.w, e.h);
      rect(g, 3, 4, e.w - 6, e.h - 6, e.color);
      for (let i = 0; i < 4; i++) {
        rect(g, 1, 3 + i * 2, 3, 1, e.accent);
        rect(g, e.w - 4, 3 + i * 2, 3, 1, e.accent);
      }
      px(g, (e.w / 2) | 0, 5, "#fff");
      atlas.set(e.id, c);
    } else if (e.aiType === "swooper" || e.id === "bat" || e.id.includes("hawk")) {
      const { c, g } = canvas(e.w, e.h);
      rect(g, 2, 4, e.w - 4, 4, e.color);
      rect(g, 0, 5, 4, 2, e.accent);
      rect(g, e.w - 4, 5, 4, 2, e.accent);
      px(g, 6, 4, "#fff");
      atlas.set(e.id, c);
    } else {
      atlas.set(e.id, humanoid(e.w, e.h, e.color, e.accent));
    }
  }
  for (const b of BOSSES) {
    const { c, g } = canvas(b.w, b.h);
    rect(g, 4, 6, b.w - 8, b.h - 10, b.color);
    rect(g, 8, 2, b.w - 16, 8, b.accent);
    rect(g, 6, 10, 4, 4, "#fff");
    rect(g, b.w - 10, 10, 4, 4, "#fff");
    px(g, 8, 12, "#111");
    px(g, b.w - 8, 12, "#111");
    rect(g, 2, b.h - 8, 5, 8, b.color);
    rect(g, b.w - 7, b.h - 8, 5, 8, b.color);
    g.fillStyle = "rgba(255,107,53,0.5)";
    g.fillRect(b.w / 2 - 2, 0, 4, 4);
    atlas.set(b.id, c);
  }
  for (const n of NPCS) {
    atlas.set("npc_" + n.id, humanoid(12, 16, n.color, "#fff8e7", "#222"));
  }
  atlas.set("tile_floor", makeTile("#1b3a24", "#245c32"));
  atlas.set("tile_wall", makeTile("#0d2214", "#16301c", true));
  atlas.set("tile_corridor", makeTile("#243028", "#1a241c"));
  atlas.set("tile_door", makeTile("#6b4c2a", "#c4a35a"));
  atlas.set("tile_water", makeTile("#0d3b4c", "#1565a0"));
  atlas.set("tile_lava", makeTile("#bf360c", "#ff6b35"));
  atlas.set("tile_ice", makeTile("#b3e5fc", "#e1f5fe"));
  atlas.set("tile_grass", makeTile("#1b5e20", "#388e3c"));
  atlas.set("tile_crystal", makeTile("#006064", "#4dd0e1"));
  atlas.set("tile_wood", makeTile("#4e342e", "#6d4c41"));
  atlas.set("chest", chest());
  atlas.set("chest_open", (() => {
    const { c, g } = canvas(16, 12);
    rect(g, 2, 6, 12, 6, "#6b4c2a");
    rect(g, 2, 1, 12, 5, "#8d6e43");
    rect(g, 7, 6, 2, 2, "#ffd700");
    return c;
  })());
  atlas.set("portal", portal());
  atlas.set("heart", bakePixels([".0.0.", "00000", "00000", ".000.", "..0.."], { "0": "#e94560" }));
  atlas.set("coin", bakePixels([".000.", "0.9.0", "09090", "0.9.0", ".000."], { "0": "#b8860b", "9": "#ffd700" }));
  atlas.set("slash", bakePixels([
    "....00....",
    "...0990...",
    "..099990..",
    ".09999990.",
    "0999..9990",
  ], { "0": "#fff", "9": "#ffd700" }));
  atlas.set("arrow", bakePixels(["..0..", ".090.", "09990", "..9..", "..9.."], { "0": "#fff", "9": "#c0c0d0" }));
  atlas.set("shadow", (() => {
    const { c, g } = canvas(12, 5);
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.beginPath();
    g.ellipse(6, 2.5, 5, 2, 0, 0, Math.PI * 2);
    g.fill();
    return c;
  })());
  atlas.set("torch", bakePixels(["..9..", ".949.", "..4..", "..0..", "..0.."], { "9": "#ffd700", "4": "#ff6b35", "0": "#4e342e" }));
  atlas.set("fox", humanoid(10, 12, "#ff6b35", "#fff", "#111"));
}

export function sprite(key: string): HTMLCanvasElement | undefined {
  return atlas.get(key);
}

export function tinted(key: string, color: string, alpha = 0.4): HTMLCanvasElement | undefined {
  const src = atlas.get(key);
  if (!src) return;
  const { c, g } = canvas(src.width, src.height);
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = color;
  g.globalAlpha = alpha;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}
