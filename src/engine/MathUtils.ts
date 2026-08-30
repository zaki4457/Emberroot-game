export const clamp = (v: number, a: number, b: number): number =>
  Math.max(a, Math.min(b, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const inverseLerp = (a: number, b: number, v: number): number =>
  a === b ? 0 : (v - a) / (b - a);

export const mapRange = (
  v: number,
  a: number,
  b: number,
  c: number,
  d: number
): number => lerp(c, d, inverseLerp(a, b, v));

export const smoothstep = (t: number): number => t * t * (3 - 2 * t);

export const randRange = (a: number, b: number): number => a + Math.random() * (b - a);

export const randInt = (a: number, b: number): number =>
  (a + Math.floor(Math.random() * (b - a + 1))) | 0;

export const pick = <T>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];

export const sign = (v: number): number => (v < 0 ? -1 : v > 0 ? 1 : 0);

export const angleTo = (ax: number, ay: number, bx: number, by: number): number =>
  Math.atan2(by - ay, bx - ax);

export const len = (x: number, y: number): number => Math.hypot(x, y);

export const norm = (x: number, y: number): { x: number; y: number } => {
  const l = Math.hypot(x, y);
  if (l < 1e-8) return { x: 0, y: 0 };
  return { x: x / l, y: y / l };
};

export function hash(n: number): number {
  n = ((n << 13) ^ n) | 0;
  return (
    ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 0x7fffffff
  );
}

export function noise1(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = smoothstep(f);
  return lerp(hash(i), hash(i + 1), u);
}

export function perlin2(x: number, y: number): number {
  return (noise1(x) + noise1(y + 19.1) + noise1(x * 0.5 + y * 1.7)) / 3;
}

export function defenseReduction(damage: number, defense: number): number {
  return damage * (1 - defense / (defense + 100));
}

export function xpForLevel(level: number): number {
  return 50 * level;
}
