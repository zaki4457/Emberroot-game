export class Vec2 {
  constructor(public x = 0, public y = 0) {}

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v: Vec2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  add(v: Vec2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vec2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  len(): number {
    return Math.hypot(this.x, this.y);
  }

  lenSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): this {
    const l = this.len();
    if (l > 1e-8) {
      this.x /= l;
      this.y /= l;
    }
    return this;
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  static dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}
