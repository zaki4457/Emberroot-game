export class Timer {
  elapsed = 0;
  duration: number;
  running = false;

  constructor(duration = 0) {
    this.duration = duration;
  }

  start(duration?: number): void {
    if (duration !== undefined) this.duration = duration;
    this.elapsed = 0;
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  update(dt: number): void {
    if (!this.running) return;
    this.elapsed += dt;
  }

  get t(): number {
    return this.duration <= 0 ? 1 : Math.min(1, this.elapsed / this.duration);
  }

  get finished(): boolean {
    return this.running && this.elapsed >= this.duration;
  }
}
