export type YieldAction =
  | { type: "wait"; duration: number }
  | { type: "waitUntil"; cond: () => boolean }
  | { type: "waitFrames"; frames: number };

type Routine = Generator<YieldAction | void, void, void>;

interface Running {
  gen: Routine;
  wait: number;
  frames: number;
  cond: (() => boolean) | null;
}

export class CoroutineRunner {
  private list: Running[] = [];

  start(gen: Routine): void {
    this.list.push({ gen, wait: 0, frames: 0, cond: null });
  }

  clear(): void {
    this.list.length = 0;
  }

  update(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const r = this.list[i];
      if (r.wait > 0) {
        r.wait -= dt;
        continue;
      }
      if (r.frames > 0) {
        r.frames--;
        continue;
      }
      if (r.cond && !r.cond()) continue;
      r.cond = null;
      const n = r.gen.next();
      if (n.done) {
        this.list.splice(i, 1);
        continue;
      }
      const y = n.value;
      if (!y) continue;
      if (y.type === "wait") r.wait = y.duration;
      else if (y.type === "waitFrames") r.frames = y.frames;
      else r.cond = y.cond;
    }
  }
}
