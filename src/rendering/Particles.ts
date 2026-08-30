import { PARTICLE_CAP } from "@/engine/Constants";
import { randRange } from "@/engine/MathUtils";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
  damp: number;
}

export class ParticleSystem {
  list: Particle[] = [];

  emit(
    x: number,
    y: number,
    n: number,
    color: string | string[],
    opts: {
      speed?: number;
      life?: number;
      size?: number;
      gravity?: number;
      spread?: number;
      vx?: number;
      vy?: number;
    } = {}
  ): void {
    const speed = opts.speed ?? 70;
    const life = opts.life ?? 0.45;
    const size = opts.size ?? 2;
    for (let i = 0; i < n; i++) {
      if (this.list.length >= PARTICLE_CAP) this.list.shift();
      const a = Math.random() * (opts.spread ?? Math.PI * 2);
      const s = randRange(speed * 0.3, speed);
      const col = Array.isArray(color) ? color[(Math.random() * color.length) | 0] : color;
      this.list.push({
        x,
        y,
        vx: Math.cos(a) * s + (opts.vx ?? 0),
        vy: Math.sin(a) * s + (opts.vy ?? 0),
        life,
        max: life,
        size: randRange(size * 0.6, size * 1.4),
        color: col,
        gravity: opts.gravity ?? 40,
        damp: 0.92,
      });
    }
  }

  hitSpark(x: number, y: number, element?: string | null): void {
    const colors =
      element === "fire"
        ? ["#ff6b35", "#ffd700", "#fff"]
        : element === "ice"
          ? ["#88ddff", "#fff", "#4fc3f7"]
          : element === "lightning"
            ? ["#ffe566", "#fff", "#ff6b35"]
            : element === "void"
              ? ["#9b59b6", "#e94560", "#fff"]
              : ["#fff", "#ffd700", "#ff6b35"];
    this.emit(x, y, 8, colors, { speed: 90, life: 0.35, size: 2, gravity: 20 });
  }

  kill(x: number, y: number, color: string): void {
    this.emit(x, y, 20, [color, "#fff", "#ff6b35"], { speed: 120, life: 0.55, size: 2.5, gravity: 30 });
  }

  dodge(x: number, y: number, vx: number, vy: number): void {
    this.emit(x, y, 4, ["#4ecdc4", "#fff"], {
      speed: 20,
      life: 0.28,
      size: 2,
      gravity: 0,
      vx: -vx * 0.3,
      vy: -vy * 0.3,
    });
  }

  levelUp(x: number, y: number): void {
    this.emit(x, y, 30, ["#ffd700", "#fff", "#ff6b35"], {
      speed: 80,
      life: 0.8,
      size: 2.5,
      gravity: -40,
    });
  }

  ambientEmber(x: number, y: number): void {
    if (this.list.length > PARTICLE_CAP * 0.7) return;
    this.emit(x, y, 1, ["#ff6b35", "#ffd700"], {
      speed: 12,
      life: 1.6,
      size: 1.4,
      gravity: -18,
    });
  }

  heal(x: number, y: number): void {
    this.emit(x, y, 10, ["#4ecdc4", "#fff"], { speed: 40, life: 0.6, size: 2, gravity: -30 });
  }

  dust(x: number, y: number): void {
    this.emit(x, y, 2, ["#6d5c4a", "#c4a35a"], { speed: 18, life: 0.3, size: 1.5, gravity: 50 });
  }

  update(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= p.damp;
      p.vy *= p.damp;
      p.life -= dt;
      if (p.life <= 0) this.list.splice(i, 1);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.list) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      const s = Math.max(1, p.size);
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.list.length = 0;
  }
}
