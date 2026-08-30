import { clamp, lerp, noise1 } from "@/engine/MathUtils";

export class Camera {
  x = 0;
  y = 0;
  w = 400;
  h = 225;
  shakeX = 0;
  shakeY = 0;
  trauma = 0;
  zoom = 1;
  zoomPunch = 1;
  shakeMul = 1;
  private time = 0;

  resize(vw: number, vh: number): void {
    this.w = vw;
    this.h = vh;
  }

  follow(tx: number, ty: number, dt: number, bounds?: { w: number; h: number }): void {
    const k = 1 - Math.pow(0.0008, dt);
    this.x = lerp(this.x, tx - this.w / 2, k);
    this.y = lerp(this.y, ty - this.h / 2, k);
    if (bounds) {
      this.x = clamp(this.x, 0, Math.max(0, bounds.w - this.w));
      this.y = clamp(this.y, 0, Math.max(0, bounds.h - this.h));
    }
  }

  snap(tx: number, ty: number): void {
    this.x = tx - this.w / 2;
    this.y = ty - this.h / 2;
  }

  addTrauma(t: number): void {
    this.trauma = clamp(this.trauma + t, 0, 1);
  }

  punch(amount = 0.12): void {
    this.zoomPunch = 1 - amount;
  }

  update(dt: number): void {
    this.time += dt;
    this.trauma = Math.max(0, this.trauma - dt * 1.4);
    const s = this.trauma * this.trauma * 10 * this.shakeMul;
    this.shakeX = (noise1(this.time * 28) - 0.5) * 2 * s;
    this.shakeY = (noise1(this.time * 31 + 50) - 0.5) * 2 * s;
    this.zoomPunch = lerp(this.zoomPunch, 1, 1 - Math.pow(0.001, dt));
  }

  apply(ctx: CanvasRenderingContext2D): void {
    const z = this.zoom * this.zoomPunch;
    const cx = this.w / 2;
    const cy = this.h / 2;
    ctx.setTransform(z, 0, 0, z, cx * (1 - z) + this.shakeX, cy * (1 - z) + this.shakeY);
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return { x: sx + this.x, y: sy + this.y };
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: wx - this.x, y: wy - this.y };
  }

  visible(x: number, y: number, pad = 24): boolean {
    return (
      x > this.x - pad &&
      y > this.y - pad &&
      x < this.x + this.w + pad &&
      y < this.y + this.h + pad
    );
  }
}
