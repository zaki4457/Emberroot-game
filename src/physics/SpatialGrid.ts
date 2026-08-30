export class SpatialGrid {
  private cells = new Map<string, Set<number>>();
  constructor(private cellSize = 64) {}

  clear(): void {
    this.cells.clear();
  }

  insert(id: number, x: number, y: number, w: number, h: number): void {
    const minX = Math.floor((x - w / 2) / this.cellSize);
    const maxX = Math.floor((x + w / 2) / this.cellSize);
    const minY = Math.floor((y - h / 2) / this.cellSize);
    const maxY = Math.floor((y + h / 2) / this.cellSize);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const k = cx + "," + cy;
        let s = this.cells.get(k);
        if (!s) {
          s = new Set();
          this.cells.set(k, s);
        }
        s.add(id);
      }
    }
  }

  query(x: number, y: number, w: number, h: number): number[] {
    const r = new Set<number>();
    const minX = Math.floor((x - w / 2) / this.cellSize);
    const maxX = Math.floor((x + w / 2) / this.cellSize);
    const minY = Math.floor((y - h / 2) / this.cellSize);
    const maxY = Math.floor((y + h / 2) / this.cellSize);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const c = this.cells.get(cx + "," + cy);
        if (c) c.forEach((id) => r.add(id));
      }
    }
    return [...r];
  }
}

export function aabbOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  return Math.abs(ax - bx) * 2 < aw + bw && Math.abs(ay - by) * 2 < ah + bh;
}

export function circleOverlap(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number
): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy < r * r;
}
