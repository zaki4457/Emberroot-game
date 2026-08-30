export type Action =
  | "up"
  | "down"
  | "left"
  | "right"
  | "attack"
  | "ranged"
  | "dodge"
  | "parry"
  | "interact"
  | "inventory"
  | "skills"
  | "pause"
  | "map"
  | "heal"
  | "ult";

const DEFAULT_KEYS: Record<string, Action> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  KeyJ: "attack",
  KeyK: "ranged",
  Space: "dodge",
  ShiftLeft: "dodge",
  KeyL: "parry",
  KeyE: "interact",
  Enter: "interact",
  KeyI: "inventory",
  Tab: "inventory",
  KeyT: "skills",
  Escape: "pause",
  KeyM: "map",
  KeyQ: "heal",
  KeyR: "ult",
};

export class InputManager {
  private down = new Set<Action>();
  private pressed = new Set<Action>();
  private released = new Set<Action>();
  private keys = { ...DEFAULT_KEYS };
  mouseX = 0;
  mouseY = 0;
  mouseWorldX = 0;
  mouseWorldY = 0;
  mouseDown = false;
  mouseRight = false;
  locked = false;
  aimAssist = false;
  moveX = 0;
  moveY = 0;
  private joyX = 0;
  private joyY = 0;
  private canvas: HTMLCanvasElement | null = null;

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("blur", () => this.down.clear());
    this.bindTouch();
  }

  detach(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return;
    const a = this.keys[e.code];
    if (!a) return;
    if (a === "inventory" || a === "pause" || a === "skills") e.preventDefault();
    if (e.code === "Tab" || e.code === "Space") e.preventDefault();
    if (!this.down.has(a)) this.pressed.add(a);
    this.down.add(a);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const a = this.keys[e.code];
    if (!a) return;
    if (this.down.has(a)) this.released.add(a);
    this.down.delete(a);
  };

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.mouseDown = true;
      if (!this.down.has("attack")) this.pressed.add("attack");
      this.down.add("attack");
    }
    if (e.button === 2) {
      this.mouseRight = true;
      if (!this.down.has("ranged")) this.pressed.add("ranged");
      this.down.add("ranged");
    }
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.mouseDown = false;
      this.released.add("attack");
      this.down.delete("attack");
    }
    if (e.button === 2) {
      this.mouseRight = false;
      this.released.add("ranged");
      this.down.delete("ranged");
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.canvas) return;
    const r = this.canvas.getBoundingClientRect();
    this.mouseX = ((e.clientX - r.left) / r.width) * this.canvas.width;
    this.mouseY = ((e.clientY - r.top) / r.height) * this.canvas.height;
  };

  private bindTouch(): void {
    const root = document.getElementById("touch-controls");
    if (!root) return;
    const coarse =
      navigator.maxTouchPoints > 0 &&
      window.matchMedia("(pointer: coarse)").matches;
    if (coarse) root.classList.remove("hidden");
    const joy = document.getElementById("joystick");
    const knob = document.getElementById("joystick-knob");
    if (joy) {
      const set = (cx: number, cy: number) => {
        const r = joy.getBoundingClientRect();
        const x = cx - (r.left + r.width / 2);
        const y = cy - (r.top + r.height / 2);
        const l = Math.hypot(x, y);
        const max = r.width / 2 - 8;
        const k = l > max ? max / l : 1;
        this.joyX = (x * k) / max;
        this.joyY = (y * k) / max;
        if (knob) {
          knob.style.left = `${31 + this.joyX * 28}px`;
          knob.style.top = `${31 + this.joyY * 28}px`;
        }
      };
      joy.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          set(e.touches[0].clientX, e.touches[0].clientY);
        },
        { passive: false }
      );
      joy.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
          set(e.touches[0].clientX, e.touches[0].clientY);
        },
        { passive: false }
      );
      joy.addEventListener("touchend", () => {
        this.joyX = 0;
        this.joyY = 0;
        if (knob) {
          knob.style.left = "31px";
          knob.style.top = "31px";
        }
      });
    }
    root.querySelectorAll("button[data-touch]").forEach((btn) => {
      const action = (btn as HTMLElement).dataset.touch as Action | undefined;
      if (!action) return;
      const map: Record<string, Action> = {
        attack: "attack",
        ranged: "ranged",
        dodge: "dodge",
        interact: "interact",
      };
      const act = map[action] ?? action;
      btn.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          if (!this.down.has(act)) this.pressed.add(act);
          this.down.add(act);
        },
        { passive: false }
      );
      btn.addEventListener("touchend", () => {
        this.released.add(act);
        this.down.delete(act);
      });
    });
  }

  pollGamepad(): void {
    const pads = navigator.getGamepads?.() ?? [];
    const g = pads[0];
    if (!g) return;
    const ax = Math.abs(g.axes[0]) > 0.25 ? g.axes[0] : 0;
    const ay = Math.abs(g.axes[1]) > 0.25 ? g.axes[1] : 0;
    if (ax || ay) {
      this.joyX = ax;
      this.joyY = ay;
    }
    const map: [number, Action][] = [
      [0, "attack"],
      [1, "dodge"],
      [2, "ranged"],
      [3, "interact"],
      [9, "pause"],
      [8, "inventory"],
      [4, "parry"],
      [5, "heal"],
    ];
    for (const [i, a] of map) {
      if (g.buttons[i]?.pressed) {
        if (!this.down.has(a)) this.pressed.add(a);
        this.down.add(a);
      }
    }
    if (g.buttons[12]?.pressed) this.joyY = -1;
    if (g.buttons[13]?.pressed) this.joyY = 1;
    if (g.buttons[14]?.pressed) this.joyX = -1;
    if (g.buttons[15]?.pressed) this.joyX = 1;
  }

  beginFrame(): void {
    this.pollGamepad();
    let x = this.joyX;
    let y = this.joyY;
    if (this.down.has("left")) x -= 1;
    if (this.down.has("right")) x += 1;
    if (this.down.has("up")) y -= 1;
    if (this.down.has("down")) y += 1;
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    this.moveX = this.locked ? 0 : x;
    this.moveY = this.locked ? 0 : y;
  }

  endFrame(): void {
    this.pressed.clear();
    this.released.clear();
  }

  isDown(a: Action): boolean {
    return !this.locked && this.down.has(a);
  }

  justPressed(a: Action): boolean {
    return !this.locked && this.pressed.has(a);
  }

  justReleased(a: Action): boolean {
    return this.released.has(a);
  }

  uiPressed(a: Action): boolean {
    return this.pressed.has(a);
  }

  vector(): { x: number; y: number } {
    return { x: this.moveX, y: this.moveY };
  }
}
