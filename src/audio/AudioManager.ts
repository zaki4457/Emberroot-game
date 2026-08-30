export type Bus = "master" | "music" | "sfx" | "ui";

interface Voice {
  osc: OscillatorNode;
  gain: GainNode;
}

export class AudioManager {
  ctx: AudioContext | null = null;
  master!: GainNode;
  music!: GainNode;
  sfx!: GainNode;
  ui!: GainNode;
  muted = false;
  volumes = { master: 0.8, music: 0.55, sfx: 0.8, ui: 0.7 };
  private musicTimer: number | null = null;
  private track: string | null = null;
  private step = 0;
  unlocked = false;

  async unlock(): Promise<void> {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.ui = this.ctx.createGain();
      this.music.connect(this.master);
      this.sfx.connect(this.master);
      this.ui.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyVolumes();
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.unlocked = true;
  }

  applyVolumes(): void {
    if (!this.ctx) return;
    const m = this.muted ? 0 : 1;
    this.master.gain.value = this.volumes.master * m;
    this.music.gain.value = this.volumes.music;
    this.sfx.gain.value = this.volumes.sfx;
    this.ui.gain.value = this.volumes.ui;
  }

  setVolume(bus: Bus, v: number): void {
    this.volumes[bus] = v;
    this.applyVolumes();
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    bus: GainNode,
    vol = 0.12,
    slide?: number
  ): void {
    if (!this.ctx || !this.unlocked) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol = 0.08, bus?: GainNode): void {
    if (!this.ctx || !this.unlocked) return;
    const n = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = n;
    const g = this.ctx.createGain();
    const t = this.ctx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(g);
    g.connect(bus ?? this.sfx);
    src.start();
  }

  play(name: string, pitch = 1): void {
    const p = pitch * (0.96 + Math.random() * 0.08);
    switch (name) {
      case "sword_swing":
        this.tone(240 * p, 0.08, "square", this.sfx, 0.06, 90);
        this.noise(0.05, 0.03);
        break;
      case "sword_hit":
        this.tone(140 * p, 0.1, "square", this.sfx, 0.1, 50);
        this.noise(0.07, 0.08);
        break;
      case "critical_hit":
        this.tone(520 * p, 0.12, "square", this.sfx, 0.1);
        this.tone(780 * p, 0.14, "square", this.sfx, 0.06);
        break;
      case "arrow_shoot":
        this.tone(680 * p, 0.07, "triangle", this.sfx, 0.07, 200);
        break;
      case "magic_cast":
        this.tone(420 * p, 0.12, "sine", this.sfx, 0.08, 900);
        break;
      case "player_hurt":
        this.tone(220 * p, 0.16, "sawtooth", this.sfx, 0.1, 70);
        break;
      case "enemy_death":
        this.tone(180 * p, 0.2, "square", this.sfx, 0.08, 40);
        break;
      case "dodge_roll":
        this.noise(0.1, 0.06);
        this.tone(300 * p, 0.1, "sine", this.sfx, 0.04, 120);
        break;
      case "parry":
        this.tone(880 * p, 0.08, "square", this.sfx, 0.1);
        this.tone(1320 * p, 0.1, "triangle", this.sfx, 0.06);
        break;
      case "heal":
        this.tone(523, 0.12, "sine", this.sfx, 0.07);
        this.tone(659, 0.14, "sine", this.sfx, 0.05);
        break;
      case "level_up":
        [523, 659, 784, 1046].forEach((f, i) =>
          setTimeout(() => this.tone(f, 0.16, "triangle", this.sfx, 0.08), i * 90)
        );
        break;
      case "gold_pickup":
        this.tone(880 * p, 0.08, "square", this.sfx, 0.05);
        this.tone(1320 * p, 0.1, "square", this.sfx, 0.04);
        break;
      case "item_pickup":
        this.tone(660, 0.1, "triangle", this.sfx, 0.06);
        break;
      case "menu_click":
        this.tone(440, 0.04, "square", this.ui, 0.05);
        break;
      case "menu_confirm":
        this.tone(660, 0.08, "square", this.ui, 0.06);
        break;
      case "chest_open":
        this.tone(200, 0.15, "square", this.sfx, 0.08, 400);
        break;
      case "door_open":
        this.noise(0.12, 0.05);
        break;
      case "boss_entrance":
        this.tone(80, 0.4, "sawtooth", this.sfx, 0.12, 40);
        break;
      case "boss_death":
        this.tone(120, 0.5, "sawtooth", this.sfx, 0.1, 30);
        this.tone(240, 0.4, "square", this.sfx, 0.06, 60);
        break;
      case "quest_complete":
        [392, 523, 659].forEach((f, i) =>
          setTimeout(() => this.tone(f, 0.14, "triangle", this.ui, 0.07), i * 100)
        );
        break;
      case "portal":
        this.tone(180, 0.3, "sine", this.sfx, 0.08, 60);
        this.tone(90, 0.35, "sine", this.sfx, 0.06, 40);
        break;
      case "finisher":
        this.tone(90, 0.18, "sawtooth", this.sfx, 0.12, 40);
        this.noise(0.12, 0.1);
        break;
      default:
        this.tone(330, 0.06, "square", this.sfx, 0.05);
    }
  }

  playMusic(track: string): void {
    if (this.track === track) return;
    this.track = track;
    this.step = 0;
    this.scheduleMusic();
  }

  stopMusic(): void {
    this.track = null;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusic(): void {
    if (!this.ctx || !this.track) return;
    const bpm = this.track === "boss" ? 140 : this.track === "menu" ? 84 : this.track === "hub" ? 92 : 110;
    const beat = 60000 / bpm / 2;
    const seq = this.sequence(this.track);
    const note = seq[this.step % seq.length];
    if (note > 0) {
      this.tone(note, beat / 1000 * 0.9, this.track === "boss" ? "sawtooth" : "triangle", this.music, 0.045);
      this.tone(note / 2, beat / 1000, "sine", this.music, 0.03);
    }
    this.step++;
    this.musicTimer = window.setTimeout(() => this.scheduleMusic(), beat);
  }

  private sequence(track: string): number[] {
    const A = 110, C = 130.81, D = 146.83, E = 164.81, F = 174.61, G = 196, As = 233.08;
    if (track === "menu") return [A, 0, C, 0, E, 0, A * 2, 0, G, 0, E, 0, D, 0, C, 0];
    if (track === "hub") return [C, E, G, E, C, D, F, D, A, C, E, C, G / 2, C, E, 0];
    if (track === "boss") return [A, A, 0, A, C, 0, As, A, G, G, 0, E, F, E, D, A];
    if (track === "victory") return [C * 2, E * 2, G * 2, C * 4, G * 2, E * 2, C * 2, 0];
    if (track === "gameover") return [A, E, C, A / 2, 0, 0, 0, 0];
    return [A, 0, E, 0, C, 0, G, 0, A, C, E, 0, D, 0, C, 0];
  }
}

export const audio = new AudioManager();
