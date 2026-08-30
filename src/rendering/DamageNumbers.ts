interface Floater {
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  color: string;
  scale: number;
}

export class DamageNumbers {
  private nums: Floater[] = [];
  enabled = true;

  spawn(dmg: number, x: number, y: number, isCrit: boolean, color?: string): void {
    if (!this.enabled) return;
    this.nums.push({
      text: isCrit ? `${Math.round(dmg)}!` : Math.round(dmg).toString(),
      x: x + (Math.random() - 0.5) * 8,
      y: y - 10,
      vy: -110,
      life: 0.9,
      color: color ?? (isCrit ? "#ffd700" : "#ffffff"),
      scale: isCrit ? 1.5 : 1,
    });
  }

  spawnText(text: string, x: number, y: number, color: string): void {
    this.nums.push({
      text,
      x,
      y: y - 12,
      vy: -80,
      life: 0.8,
      color,
      scale: 1.1,
    });
  }

  update(dt: number): void {
    for (let i = this.nums.length - 1; i >= 0; i--) {
      const n = this.nums[i];
      n.y += n.vy * dt;
      n.vy += 90 * dt;
      n.life -= dt;
      if (n.life <= 0) this.nums.splice(i, 1);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const n of this.nums) {
      const a = Math.min(1, n.life / 0.28);
      const s = Math.round(10 * n.scale * (1 + (1 - n.life) * 0.25));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `bold ${s}px monospace`;
      ctx.fillStyle = n.color;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.textAlign = "center";
      ctx.strokeText(n.text, n.x, n.y);
      ctx.fillText(n.text, n.x, n.y);
      ctx.restore();
    }
  }

  clear(): void {
    this.nums.length = 0;
  }
}
