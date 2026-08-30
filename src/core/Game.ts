import { audio } from "@/audio/AudioManager";
import { ACHIEVEMENTS } from "@/data/achievements";
import { BLESSING_BY_ID } from "@/data/blessings";
import { BOSS_BY_ID } from "@/data/bosses";
import { CURSES } from "@/data/curses";
import { DIALOGUES, ENDING_TEXT } from "@/data/dialogues";
import { ENEMIES, ENEMY_BY_ID } from "@/data/enemies";
import { GameState, RoomType, Tile } from "@/data/enums";
import { ITEM_BY_ID, ITEMS, SHOP_POOL } from "@/data/items";
import { LORE } from "@/data/lore";
import { NPCS } from "@/data/npcs";
import { QUEST_BY_ID, QUESTS } from "@/data/quests";
import { REGIONS, REGION_BY_ID } from "@/data/regions";
import { SKILL_BRANCHES, SKILL_BY_ID, SKILLS } from "@/data/skills";
import type {
  BlessingData,
  CurseData,
  DungeonMap,
  GameSaveData,
  PlayerStateComponent,
  QuestData,
  RegionData,
  Room,
  RunData,
  StatMods,
  StatusEffectComponent,
} from "@/data/types";
import { AUTO_SAVE_MS, DODGE_SPEED, DODGE_TIME, IFRAME_DODGE, LIGHT_RADIUS, MAX_DT, PLAYER_SPEED, STAMINA_MAX, STAMINA_REGEN, TILE } from "@/engine/Constants";
import { lerp, randRange, xpForLevel } from "@/engine/MathUtils";
import { SeededRandom, dateSeed } from "@/engine/SeededRandom";
import { World } from "@/engine/World";
import { events } from "@/core/EventBus";
import { defaultSave, loadSave, writeSave, exportSave, META_UPGRADES, metaCost } from "@/core/SaveSystem";
import { loadSettings, saveSettings, type Settings } from "@/core/GameSettings";
import { computeDamage, sumMods } from "@/combat/CombatMath";
import { applyStatus, hasStatus, makeStatus, tickStatus, clearHarmful } from "@/combat/StatusEffects";
import { tryReaction } from "@/combat/ElementalReactions";
import { rollBlessings } from "@/expansion/roguelite/BlessingSystem";
import { detectSynergies } from "@/expansion/roguelite/SynergyChecker";
import { metaBonuses } from "@/expansion/roguelite/MetaProgression";
import { InputManager } from "@/input/InputManager";
import { aabbOverlap } from "@/physics/SpatialGrid";
import { los, moveWithCollisions, tileAt, tileFriction, tileHazard } from "@/physics/PhysicsSystem";
import { Camera } from "@/rendering/Camera";
import { DamageNumbers } from "@/rendering/DamageNumbers";
import { ParticleSystem } from "@/rendering/Particles";
import { drawLighting, drawMinimap, drawSprite, paintTileCache } from "@/rendering/Renderer";
import { bakeSprites } from "@/rendering/sprites";
import { drawTitleTree } from "@/rendering/titleTree";
import { generateDungeon, roomAt } from "@/world/DungeonGenerator";

let _gid = 1;
const nid = () => _gid++;

export interface Mob {
  id: number;
  kind: "enemy" | "boss";
  typeId: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  w: number;
  h: number;
  ai: string;
  state: string;
  timer: number;
  telegraph: number;
  cd: number;
  color: string;
  accent: string;
  damage: number;
  speed: number;
  detect: number;
  range: number;
  elite: boolean;
  flash: number;
  status: StatusEffectComponent;
  phase: number;
  patternI: number;
  special: number;
  revived: boolean;
  intro: string;
  patterns: string[][];
  phases: number[];
}

interface Proj {
  x: number; y: number; vx: number; vy: number;
  life: number; damage: number; r: number;
  fromPlayer: boolean; element: string | null; pierce: number;
}

interface Pickup {
  x: number; y: number; kind: "gold" | "hp" | "item" | "essence";
  value: number; itemId?: string; life: number;
}

interface Hitbox {
  x: number; y: number; w: number; h: number;
  damage: number; life: number; fromPlayer: boolean;
  element: string | null; knock: number; finisher: boolean;
  hit: Set<number>;
}

interface Interactable {
  x: number; y: number; kind: "chest" | "fountain" | "shop" | "portal" | "npc" | "pond" | "craft";
  id?: string; used?: boolean;
}

export class Game {
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  world = new World();
  input = new InputManager();
  camera = new Camera();
  particles = new ParticleSystem();
  numbers = new DamageNumbers();
  state: GameState = GameState.LOADING;
  prevState: GameState = GameState.MAIN_MENU;
  time = 0;
  gameSpeed = 1;
  hitstop = 0;
  paused = false;
  save: GameSaveData = defaultSave();
  settings: Settings = loadSettings();
  rng = new SeededRandom(1);

  player = this.freshPlayer();
  mods: StatMods = {};
  dungeon: DungeonMap | null = null;
  region: RegionData | null = null;
  run: RunData | null = null;
  tileCache: HTMLCanvasElement | null = null;
  mobs: Mob[] = [];
  projs: Proj[] = [];
  pickups: Pickup[] = [];
  hits: Hitbox[] = [];
  interacts: Interactable[] = [];
  currentRoom: Room | null = null;
  lights: { x: number; y: number; r: number }[] = [];
  companion: { x: number; y: number; cd: number } | null = null;

  scale = 3;
  last = 0;
  fps = 60;
  frames = 0;
  fpsT = 0;
  autoSaveAt = 0;
  bannerT = 0;
  banner = "";
  flash = 0;
  fishing: { on: boolean; t: number } | null = null;
  pendingBlessings: BlessingData[] = [];
  pendingCurses: CurseData[] = [];
  dialogue: { tree: string; i: number; state: string; typed: number; line: string } | null = null;
  overlay: string | null = null;
  stats = { perfectParries: 0, bought: 0, comboMax: 0, fish: 0, flawless: false, roomDmg: 0 };

  start(): void {
    this.canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    bakeSprites();
    this.input.attach(this.canvas);
    this.bindUI();
    this.applySettings();
    window.addEventListener("resize", () => this.resize());
    this.resize();
    this.boot();
    this.last = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  private async boot(): Promise<void> {
    const fill = document.getElementById("loading-fill");
    const txt = document.getElementById("loading-text");
    const steps = ["Remembering names…", "Waking wardens…", "Binding roots…", "Ready."];
    for (let i = 0; i < steps.length; i++) {
      if (txt) txt.textContent = steps[i];
      if (fill) fill.style.width = `${((i + 1) / steps.length) * 100}%`;
      await new Promise((r) => setTimeout(r, 180));
    }
    const existing = loadSave();
    if (existing) this.save = existing;
    this.goMenu();
  }

  resize(): void {
    const ww = window.innerWidth;
    const hh = window.innerHeight;
    this.scale = Math.max(2, Math.min(5, Math.floor(Math.min(ww / 320, hh / 180))));
    const vw = Math.ceil(ww / this.scale);
    const vh = Math.ceil(hh / this.scale);
    this.canvas.width = vw;
    this.canvas.height = vh;
    this.canvas.style.width = `${vw * this.scale}px`;
    this.canvas.style.height = `${vh * this.scale}px`;
    this.ctx.imageSmoothingEnabled = false;
    this.camera.resize(vw, vh);
  }

  loop(now: number): void {
    requestAnimationFrame((t) => this.loop(t));
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > MAX_DT) dt = MAX_DT;
    this.frames++;
    this.fpsT += dt;
    if (this.fpsT >= 0.5) {
      this.fps = this.frames / this.fpsT;
      this.frames = 0;
      this.fpsT = 0;
    }
    this.input.beginFrame();
    this.update(dt);
    this.render();
    this.input.endFrame();
  }

  update(dt: number): void {
    this.time += dt;
    this.save.playTime += dt;
    this.save.meta.playTime += dt;
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      dt *= 0.08;
    }
    dt *= this.gameSpeed;
    this.camera.update(dt);
    this.particles.update(dt);
    this.numbers.update(dt);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 4);
    if (this.bannerT > 0) this.bannerT -= dt;

    if (this.input.uiPressed("pause")) {
      if (this.overlay) this.closeOverlays();
      else if (this.state === GameState.DUNGEON_ROOM || this.state === GameState.HUB_VILLAGE || this.state === GameState.BOSS_ARENA)
        this.openOverlay("pause");
    }

    if (this.overlay) {
      this.updateOverlay();
      return;
    }
    if (this.dialogue) {
      this.updateDialogue(dt);
      return;
    }
    if (this.fishing) {
      this.updateFishing(dt);
      return;
    }

    if (this.state === GameState.MAIN_MENU) {
      if (this.time % 0.2 < dt) this.particles.ambientEmber(this.camera.w * 0.5 + randRange(-80, 80), this.camera.h * 0.4);
    } else if (this.state === GameState.HUB_VILLAGE) this.updateHub(dt);
    else if (this.state === GameState.DUNGEON_ROOM || this.state === GameState.BOSS_ARENA) this.updateDungeon(dt);

    if (this.time * 1000 > this.autoSaveAt) {
      this.persist();
      this.autoSaveAt = this.time * 1000 + AUTO_SAVE_MS;
    }
  }

  render(): void {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === GameState.LOADING || this.state === GameState.MAIN_MENU) {
      drawTitleTree(ctx, this.canvas.width, this.canvas.height, this.time);
      this.particles.render(ctx);
    } else if (this.state === GameState.HUB_VILLAGE) this.renderWorld(true);
    else if (this.state === GameState.DUNGEON_ROOM || this.state === GameState.BOSS_ARENA) this.renderWorld(false);
    else if (this.state === GameState.DEATH_SCREEN) {
      ctx.fillStyle = "#100000";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (this.state === GameState.ENDING) {
      drawTitleTree(ctx, this.canvas.width, this.canvas.height, this.time * 0.4);
    }

    const flash = document.getElementById("flash-overlay");
    if (flash) {
      flash.style.opacity = this.settings.reduceFlash ? "0" : String(Math.min(0.6, this.flash));
      flash.style.background = this.player.hp / this.player.maxHp < 0.3 ? "#e94560" : "#fff";
    }
    const vig = document.getElementById("vignette");
    if (vig) vig.style.opacity = this.player.hp / this.player.maxHp < 0.35 ? "1" : "0.7";
  }

  /* ---------- flow ---------- */
  goMenu(): void {
    this.state = GameState.MAIN_MENU;
    this.show("screen-menu");
    this.hide("screen-loading");
    this.hide("hud");
    this.closeOverlays();
    const btn = document.getElementById("btn-continue") as HTMLButtonElement | null;
    if (btn) btn.disabled = !loadSave();
    audio.playMusic("menu");
  }

  newGame(): void {
    const meta = this.save.meta;
    this.save = defaultSave();
    this.save.meta = meta;
    this.save.meta.totalRuns++;
    this.player = this.freshPlayer();
    this.applyMetaToPlayer();
    this.persist();
    this.goHub();
    this.toast("The village remembers a new walker.");
  }

  continueGame(): void {
    const s = loadSave();
    if (s) this.save = s;
    this.playerFromSave();
    if (this.save.run && this.save.run.regionId) this.startRun(this.save.run.regionId, this.save.run.mode, this.save.run.seed, true);
    else this.goHub();
  }

  goHub(): void {
    this.state = GameState.HUB_VILLAGE;
    this.dungeon = this.makeHubMap();
    this.region = {
      id: "hub",
      name: "Ashbrook",
      theme: "forest",
      music: "hub",
      hazards: [],
      enemyPool: [],
      bossId: "",
      difficulty: 0,
      unlockAfter: null,
      floor: "#1b3a24",
      wall: "#0d2214",
      accent: "#c4a35a",
      fog: "#0a1a10",
      ambient: "#17301f",
      lore: "A village planted, not built.",
    };
    this.tileCache = paintTileCache(this.dungeon, this.region);
    this.mobs = [];
    this.projs = [];
    this.pickups = [];
    this.hits = [];
    this.player.x = 16 * TILE;
    this.player.y = 12 * TILE;
    this.player.hp = Math.max(this.player.hp, this.player.maxHp * 0.4);
    this.camera.snap(this.player.x, this.player.y);
    this.interacts = NPCS.map((n) => ({
      x: n.x * TILE + 8,
      y: n.y * TILE + 8,
      kind: "npc" as const,
      id: n.id,
    }));
    this.interacts.push({ x: 16 * TILE, y: 4 * TILE, kind: "portal" });
    this.interacts.push({ x: 6 * TILE + 8, y: 18 * TILE + 8, kind: "pond" });
    this.lights = this.interacts.map((i) => ({ x: i.x, y: i.y, r: 40 }));
    this.showHud();
    this.hideScreens();
    audio.playMusic("hub");
    this.roomBanner("Ashbrook Village");
    if (this.save.flags.pet) this.companion = { x: this.player.x - 12, y: this.player.y, cd: 0 };
  }

  startRun(regionId: string, mode: RunData["mode"] = "story", seed?: number, resume = false): void {
    const region = REGION_BY_ID[regionId] ?? REGIONS[0];
    this.region = region;
    const s = seed ?? (mode === "daily" ? dateSeed() : (Math.random() * 1e9) | 0);
    this.rng = new SeededRandom(s);
    if (!resume) {
      this.run = {
        regionId,
        seed: s,
        floor: 1,
        room: 0,
        roomsCleared: 0,
        blessings: [],
        curses: [],
        synergies: [],
        gold: 0,
        essence: 0,
        kills: 0,
        damageTaken: 0,
        damageDealt: 0,
        startTime: this.time,
        mode,
      };
      this.save.run = this.run;
    } else this.run = this.save.run;
    this.dungeon = generateDungeon(s + (this.run?.floor ?? 1) * 13);
    this.decorateDungeon();
    this.tileCache = paintTileCache(this.dungeon, region);
    this.mobs = [];
    this.projs = [];
    this.pickups = [];
    this.hits = [];
    this.player.x = this.dungeon.entrance.x;
    this.player.y = this.dungeon.entrance.y;
    this.player.state = "idle";
    this.camera.snap(this.player.x, this.player.y);
    this.state = GameState.DUNGEON_ROOM;
    this.showHud();
    this.hideScreens();
    this.closeOverlays();
    audio.playMusic(region.music === "boss" ? "boss" : "dungeon");
    this.roomBanner(region.name);
    this.recalc();
    events.emit("regionEntered", { regionId });
    events.emit("dungeonGenerated", { regionId, rooms: this.dungeon.rooms.length });
    this.persist();
  }

  /* ---------- player ---------- */
  freshPlayer() {
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      hp: 100, maxHp: 100, stamina: STAMINA_MAX, maxStamina: STAMINA_MAX,
      facingX: 1, facingY: 0, aimX: 1, aimY: 0,
      state: "idle" as PlayerStateComponent["state"],
      stateTime: 0, combo: 0, comboT: 0, attackI: 0, buffered: false,
      charge: 0, charging: false, iFrames: 0, attackLock: 0, parryT: 0,
      level: 1, xp: 0, gold: 25, mastery: 0, shield: 0, power: 4, defense: 2,
      damage: 8, crit: 0.05, critMul: 2, speed: PLAYER_SPEED, atkSpd: 1,
      lifesteal: 0, flash: 0, dead: false, invuln: 0,
    };
  }

  playerFromSave(): void {
    this.player = this.freshPlayer();
    const p = this.save.player;
    this.player.level = p.level;
    this.player.xp = p.xp;
    this.player.hp = p.hp;
    this.player.maxHp = p.maxHp;
    this.player.gold = p.gold;
    this.player.mastery = p.mastery;
    this.applyMetaToPlayer();
    this.recalc();
  }

  applyMetaToPlayer(): void {
    const b = metaBonuses(this.save.meta);
    this.player.maxHp = 100 + (this.player.level - 1) * 8 + b.hp;
    this.player.hp = Math.min(this.player.hp, this.player.maxHp);
    this.player.shield = b.shield;
  }

  recalc(): void {
    const list: StatMods[] = [];
    const eq = this.save.player.equipment;
    for (const slot of Object.keys(eq)) {
      const id = eq[slot];
      if (id && ITEM_BY_ID[id]) {
        list.push(ITEM_BY_ID[id].mods);
        this.player.damage = 8 + ITEM_BY_ID[id].damage * 0.15;
        this.player.power = 4 + ITEM_BY_ID[id].powerBonus;
      }
    }
    for (const sid of this.save.player.skills) {
      const sk = SKILL_BY_ID[sid];
      if (sk) list.push(sk.mods);
    }
    if (this.run) {
      for (const bid of this.run.blessings) {
        const b = BLESSING_BY_ID[bid];
        if (b) list.push(b.mods);
      }
      const syn = detectSynergies(this.run.blessings);
      this.run.synergies = syn.map((s) => s.id);
      for (const s of syn) list.push(s.mods);
      for (const cid of this.run.curses) {
        const c = CURSES.find((x) => x.id === cid);
        if (c) {
          list.push(c.mods);
          list.push(c.penalty);
        }
      }
    }
    const meta = metaBonuses(this.save.meta);
    list.push({
      damage: meta.damage,
      moveSpeed: meta.speed,
      attackSpeed: meta.attackSpeed,
      luck: meta.luck,
      goldGain: meta.gold,
      xpGain: meta.xp,
    });
    this.mods = sumMods(list);
    const ng = 1 + this.save.meta.ngPlus * 0.15;
    this.player.speed = PLAYER_SPEED * (1 + (this.mods.moveSpeed ?? 0));
    this.player.atkSpd = 1 + (this.mods.attackSpeed ?? 0);
    this.player.crit = 0.05 + (this.mods.critChance ?? 0);
    this.player.critMul = 2 + (this.mods.critDamage ?? 0);
    this.player.lifesteal = this.mods.lifesteal ?? 0;
    this.player.defense = 2 + (this.mods.defense ?? 0);
    this.player.maxHp = Math.max(20, (100 + (this.player.level - 1) * 8 + meta.hp + (this.mods.maxHp ?? 0)) / (ng > 1 && this.run ? 1 : 1));
    this.refreshSynergyHud();
  }

  updatePlayer(dt: number, map: DungeonMap): void {
    const p = this.player;
    if (p.dead) return;
    p.stateTime += dt;
    if (p.iFrames > 0) p.iFrames -= dt;
    if (p.invuln > 0) p.invuln -= dt;
    if (p.attackLock > 0) p.attackLock -= dt;
    if (p.flash > 0) p.flash -= dt;
    if (p.comboT > 0) {
      p.comboT -= dt;
      if (p.comboT <= 0) p.combo = 0;
    }
    const ps = this.playerStatus;
    const tick = tickStatus(ps, dt);
    if (tick.hpDelta) this.heal(tick.hpDelta);
    if (tick.rooted && p.state !== "dodge") {
      p.vx = 0; p.vy = 0;
    }

    const aim = this.camera.screenToWorld(this.input.mouseX, this.input.mouseY);
    const adx = aim.x - p.x;
    const ady = aim.y - p.y;
    if (Math.hypot(adx, ady) > 4) {
      const l = Math.hypot(adx, ady);
      p.aimX = adx / l;
      p.aimY = ady / l;
    }

    if (p.state === "dodge") {
      const m = moveWithCollisions(map, p.x, p.y, p.vx, p.vy, 5, 5, dt);
      p.x = m.x; p.y = m.y;
      this.particles.dodge(p.x, p.y, p.vx, p.vy);
      if (p.stateTime >= DODGE_TIME) {
        p.state = "idle";
        p.vx = 0; p.vy = 0;
      }
      return;
    }

    if (this.input.justPressed("dodge") && p.stamina >= 18 && p.state !== "hurt") {
      const v = this.input.vector();
      let dx = v.x || p.facingX;
      let dy = v.y || p.facingY;
      const l = Math.hypot(dx, dy) || 1;
      dx /= l; dy /= l;
      p.state = "dodge";
      p.stateTime = 0;
      p.vx = dx * DODGE_SPEED;
      p.vy = dy * DODGE_SPEED;
      p.iFrames = IFRAME_DODGE + (this.mods.dodgeIFrames ?? 0);
      p.stamina -= 18;
      audio.play("dodge_roll");
      if (this.run && detectSynergies(this.run.blessings).some((s) => s.specialEffect === "dodge_stealth"))
        applyStatus(ps, "stealth", 1.2, 0);
      return;
    }

    if (this.input.justPressed("parry") && p.stamina >= 8) {
      p.state = "parry";
      p.stateTime = 0;
      p.parryT = 0.22;
      p.stamina -= 8;
      p.attackLock = 0.22;
    }

    if (p.state === "parry") {
      if (p.stateTime > 0.22) p.state = "idle";
    }

    if (this.input.justPressed("heal")) this.useItem("potion");
    if (this.input.justPressed("ult")) this.tryUlt();
    if (this.input.justPressed("inventory")) this.openOverlay("inventory");
    if (this.input.justPressed("skills")) this.openOverlay("skills");
    if (this.input.justPressed("map") && this.state === GameState.HUB_VILLAGE) this.openOverlay("map");

    if (this.input.justPressed("attack") && p.attackLock <= 0) {
      if (p.combo >= 5 && this.save.player.skills.includes("sk_0_3")) this.doFinisher();
      else this.doMelee();
    } else if (this.input.isDown("attack") && p.state !== "attack" && p.state !== "heavy") {
      p.charge += dt;
      p.charging = true;
    } else if (this.input.justReleased("attack") && p.charging) {
      if (p.charge > 0.42 && p.stamina >= 16) this.doHeavy();
      p.charge = 0;
      p.charging = false;
    }

    if (this.input.justPressed("ranged") && p.attackLock <= 0 && p.stamina >= 10) this.doRanged();

    const v = this.input.vector();
    let speed = p.speed * tick.speedMul;
    const tile = tileAt(map, p.x, p.y);
    speed *= tileFriction(tile);
    const lock = p.state === "attack" || p.state === "heavy" || p.state === "parry" ? 0.35 : 1;
    if (!tick.rooted) {
      p.vx = v.x * speed * lock;
      p.vy = v.y * speed * lock;
    }
    if (v.x || v.y) {
      p.facingX = v.x || p.facingX;
      p.facingY = v.y || p.facingY;
      if (p.state === "idle") p.state = "walk";
    } else if (p.state === "walk") p.state = "idle";

    const moved = moveWithCollisions(map, p.x, p.y, p.vx, p.vy, 5, 6, dt);
    p.x = moved.x; p.y = moved.y;

    const hz = tileHazard(tile);
    if (hz && hz.dps && p.iFrames <= 0) this.hurtPlayer(hz.dps * dt, "hazard");

    if (p.state !== "attack" && p.state !== "heavy") {
      p.stamina = Math.min(p.maxStamina, p.stamina + STAMINA_REGEN * (1 + (this.mods.staminaRegen ?? 0)) * dt);
    }

    if (this.input.justPressed("interact")) this.tryInteract();

    this.syncComboHud();
  }

  playerStatus: StatusEffectComponent = makeStatus();

  doMelee(): void {
    const p = this.player;
    p.state = "attack";
    p.stateTime = 0;
    p.attackI = (p.attackI + 1) % 3;
    const dur = (0.22 - p.attackI * 0.02) / p.atkSpd;
    p.attackLock = dur;
    const dirx = p.aimX || p.facingX;
    const diry = p.aimY || p.facingY;
    const reach = 20 + (this.mods.area ?? 0) * 10;
    const dmgMul = 1 + p.attackI * 0.15;
    this.hits.push({
      x: p.x + dirx * 14,
      y: p.y + diry * 14,
      w: reach,
      h: 16 + p.attackI * 4,
      damage: this.playerDamage() * dmgMul,
      life: 0.1,
      fromPlayer: true,
      element: this.weaponElement(),
      knock: 40 + p.attackI * 20,
      finisher: false,
      hit: new Set(),
    });
    audio.play("sword_swing");
    this.particles.emit(p.x + dirx * 12, p.y + diry * 8, 4, ["#fff", "#ffd700"], { speed: 40, life: 0.2, gravity: 0 });
  }

  doHeavy(): void {
    const p = this.player;
    p.state = "heavy";
    p.stateTime = 0;
    p.stamina -= 16;
    p.attackLock = 0.38;
    p.charging = false;
    p.charge = 0;
    const dirx = p.aimX || p.facingX;
    const diry = p.aimY || p.facingY;
    this.hits.push({
      x: p.x + dirx * 16,
      y: p.y + diry * 16,
      w: 28,
      h: 24,
      damage: this.playerDamage() * 1.8,
      life: 0.12,
      fromPlayer: true,
      element: this.weaponElement() ?? "fire",
      knock: 90,
      finisher: false,
      hit: new Set(),
    });
    audio.play("sword_swing", 0.8);
    this.camera.addTrauma(0.25);
  }

  doRanged(): void {
    const p = this.player;
    p.stamina -= 10;
    p.attackLock = 0.28 / p.atkSpd;
    p.state = "ranged";
    p.stateTime = 0;
    const extra = this.mods.projectile ?? 0;
    const n = 1 + extra;
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2) * 0.18;
      const a = Math.atan2(p.aimY, p.aimX) + spread;
      this.projs.push({
        x: p.x, y: p.y - 6,
        vx: Math.cos(a) * 180,
        vy: Math.sin(a) * 180,
        life: 1.2,
        damage: this.playerDamage() * 0.75,
        r: 3,
        fromPlayer: true,
        element: this.weaponElement() ?? "lightning",
        pierce: extra > 0 ? 1 : 0,
      });
    }
    audio.play("arrow_shoot");
  }

  doFinisher(): void {
    const p = this.player;
    p.state = "finisher";
    p.stateTime = 0;
    p.attackLock = 0.4;
    p.combo = 0;
    this.hits.push({
      x: p.x, y: p.y, w: 46, h: 46,
      damage: this.playerDamage() * 2.4,
      life: 0.14,
      fromPlayer: true,
      element: "fire",
      knock: 120,
      finisher: true,
      hit: new Set(),
    });
    this.camera.addTrauma(0.4);
    this.camera.punch(0.15);
    this.hitstop = 0.08;
    audio.play("finisher");
  }

  tryUlt(): void {
    const skills = this.save.player.skills;
    const p = this.player;
    if (p.stamina < 40) return;
    if (skills.includes("sk_0_5")) {
      applyStatus(this.playerStatus, "berserk", 5, 0);
      p.stamina -= 40;
      this.toast("BERSERKER");
    } else if (skills.includes("sk_1_5")) {
      p.shield += 40;
      this.hits.push({ x: p.x, y: p.y, w: 70, h: 70, damage: this.playerDamage(), life: 0.2, fromPlayer: true, element: null, knock: 40, finisher: false, hit: new Set() });
      p.stamina -= 40;
      this.toast("GUARDIAN AEGIS");
    } else if (skills.includes("sk_2_5")) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        this.projs.push({ x: p.x, y: p.y, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, life: 0.8, damage: this.playerDamage(), r: 3, fromPlayer: true, element: "lightning", pierce: 2 });
      }
      p.stamina -= 40;
      this.toast("ARCHMAGE SURGE");
    } else if (skills.includes("sk_3_5")) {
      p.iFrames = 0.6;
      p.state = "dodge";
      p.vx = p.aimX * 260;
      p.vy = p.aimY * 260;
      p.stamina -= 40;
      this.toast("PHANTOM DASH");
    } else this.toast("No ultimate unlocked");
  }

  playerDamage(): number {
    const bless = 1 + (this.mods.damage ?? 0);
    return (this.player.damage + this.player.power) * bless;
  }

  weaponElement(): string | null {
    const w = this.save.player.equipment.weapon;
    return (w && ITEM_BY_ID[w]?.element) || null;
  }

  hurtPlayer(amount: number, src: string): void {
    const p = this.player;
    if (p.dead || p.iFrames > 0 || p.invuln > 0) return;
    if (p.state === "parry") {
      const perfect = p.stateTime <= 0.08;
      audio.play("parry");
      this.toast(perfect ? "PERFECT PARRY" : "PARRY");
      this.camera.addTrauma(0.2);
      if (perfect) this.stats.perfectParries++;
      events.emit("parry", { perfect });
      const reflect = amount * (perfect ? 0.5 : 0.25);
      const near = this.mobs.find((m) => Math.hypot(m.x - p.x, m.y - p.y) < 40);
      if (near) this.hurtMob(near, reflect, false, null);
      if (perfect) applyStatus(near?.status ?? makeStatus(), "stun", 0.8, 0);
      p.iFrames = 0.15;
      return;
    }
    let dmg = amount * (hasStatus(this.playerStatus, "vulnerable") ? 1.25 : 1);
    if (p.shield > 0) {
      const s = Math.min(p.shield, dmg);
      p.shield -= s;
      dmg -= s;
    }
    p.hp -= dmg;
    p.flash = 0.15;
    p.iFrames = 0.35;
    p.state = "hurt";
    p.stateTime = 0;
    this.flash = 0.45;
    this.camera.addTrauma(0.35);
    audio.play("player_hurt");
    this.numbers.spawn(dmg, p.x, p.y - 8, false, "#e94560");
    if (this.run) this.run.damageTaken += dmg;
    this.stats.roomDmg += dmg;
    events.emit("playerHurt", { amount: dmg, x: p.x, y: p.y });
    if (p.hp <= 0) this.killPlayer(src);
  }

  heal(n: number): void {
    if (n === 0) return;
    const p = this.player;
    if (n > 0) {
      p.hp = Math.min(p.maxHp, p.hp + n);
      if (n >= 2) this.particles.heal(p.x, p.y);
    } else {
      p.hp = Math.max(0, p.hp + n);
      if (p.hp <= 0) this.killPlayer("status");
    }
  }

  killPlayer(src: string): void {
    const p = this.player;
    if (p.dead) return;
    p.dead = true;
    p.hp = 0;
    p.state = "dead";
    this.save.meta.deaths++;
    this.grantAchievement("death_1");
    this.grantAchievement("first_run");
    events.emit("playerDied", { killer: src });
    audio.playMusic("gameover");
    const runSnap = this.run;
    this.endRun(false);
    const el = document.getElementById("death-stats");
    if (el && runSnap) {
      el.textContent = `Kills ${runSnap.kills}  ·  Gold ${this.player.gold}  ·  Time ${Math.floor(this.time - runSnap.startTime)}s | Fallen to ${src}`;
    }
    this.state = GameState.DEATH_SCREEN;
    this.show("death-screen");
    this.hide("hud");
  }

  endRun(survived: boolean): void {
    if (!this.run) return;
    const essence = Math.max(1, Math.floor(this.run.kills * 0.4 + this.run.roomsCleared * 2 + (survived ? 12 : 0)));
    this.save.meta.essence += essence;
    this.save.player.gold = this.player.gold;
    this.save.player.hp = Math.max(1, this.player.hp);
    this.save.player.level = this.player.level;
    this.save.player.xp = this.player.xp;
    this.save.player.mastery = this.player.mastery;
    events.emit("runEnded", { run: this.run, survived });
    this.run = null;
    this.save.run = null;
    this.persist();
    this.toast(`Essence +${essence}`);
  }

  /* ---------- dungeon ---------- */
  decorateDungeon(): void {
    if (!this.dungeon || !this.region) return;
    const map = this.dungeon;
    this.interacts = [];
    this.lights = [];
    for (const r of map.rooms) {
      this.lights.push({ x: (r.x + 2) * TILE, y: (r.y + 2) * TILE, r: 36 });
      if (r.type === RoomType.Treasure || r.type === RoomType.Secret)
        this.interacts.push({ x: r.cx * TILE, y: r.cy * TILE, kind: "chest" });
      if (r.type === RoomType.Healing)
        this.interacts.push({ x: r.cx * TILE, y: r.cy * TILE, kind: "fountain" });
      if (r.type === RoomType.Shop)
        this.interacts.push({ x: r.cx * TILE, y: r.cy * TILE, kind: "shop" });
      if (r.type === RoomType.Entrance)
        this.interacts.push({ x: r.cx * TILE, y: (r.y + 2) * TILE, kind: "portal" });
      // hazards
      if (this.region.hazards.includes("lava") || this.region.theme === "volcano") {
        this.sprinkle(r, Tile.Lava, 0.04);
      }
      if (this.region.hazards.includes("ice") || this.region.theme === "ice") {
        this.sprinkle(r, Tile.Ice, 0.25);
      }
      if (this.region.hazards.includes("water") || this.region.theme === "water") {
        this.sprinkle(r, Tile.Water, 0.08);
      }
    }
  }

  sprinkle(r: Room, tile: number, chance: number): void {
    if (!this.dungeon) return;
    for (let y = r.y + 2; y < r.y + r.h - 2; y++) {
      for (let x = r.x + 2; x < r.x + r.w - 2; x++) {
        if (this.rng.next() < chance) {
          const i = y * this.dungeon.width + x;
          if (this.dungeon.tiles[i] === Tile.Floor) this.dungeon.tiles[i] = tile;
        }
      }
    }
  }

  updateDungeon(dt: number): void {
    if (!this.dungeon) return;
    this.updatePlayer(dt, this.dungeon);
    this.updateMobs(dt);
    this.updateProjs(dt);
    this.updateHits(dt);
    this.updatePickups(dt);
    this.updateCompanion(dt);
    this.camera.follow(this.player.x, this.player.y - 8, dt, {
      w: this.dungeon.width * TILE,
      h: this.dungeon.height * TILE,
    });
    const room = roomAt(this.dungeon, this.player.x, this.player.y);
    if (room && room !== this.currentRoom) this.enterRoom(room);
    if (this.currentRoom && !this.currentRoom.cleared && this.mobs.length === 0 && this.currentRoom.type !== RoomType.Entrance) {
      this.clearRoom(this.currentRoom);
    }
    this.refreshHUD();
    const mm = document.getElementById("minimap") as HTMLCanvasElement | null;
    if (mm) drawMinimap(mm, this.dungeon, this.player.x, this.player.y);
  }

  enterRoom(room: Room): void {
    this.currentRoom = room;
    room.discovered = true;
    this.stats.roomDmg = 0;
    this.stats.flawless = true;
    if (room.cleared) return;
    if (room.type === RoomType.Combat || room.type === RoomType.Challenge) {
      this.spawnEnemies(room, room.type === RoomType.Challenge ? 1.6 : 1);
      this.roomBanner(room.type === RoomType.Challenge ? "CHALLENGE" : "FIGHT");
    } else if (room.type === RoomType.Boss) {
      this.spawnBoss(room);
      this.state = GameState.BOSS_ARENA;
      audio.playMusic("boss");
      audio.play("boss_entrance");
      this.camera.addTrauma(0.5);
    } else {
      this.roomBanner(room.type.toUpperCase());
    }
  }

  spawnEnemies(room: Room, mul = 1): void {
    if (!this.region) return;
    const diff = this.region.difficulty + (this.save.meta.ngPlus || 0) + ((this.run?.floor ?? 1) - 1) * 0.15;
    const n = Math.round((2 + diff + this.rng.int(0, 2)) * mul);
    const crowded = this.run?.curses.includes("crowded_fate");
    const count = crowded ? n + 2 : n;
    for (let i = 0; i < count; i++) {
      const id = this.rng.pick(this.region.enemyPool);
      const d = ENEMY_BY_ID[id];
      if (!d) continue;
      const elite = this.rng.chance(0.08 + diff * 0.02);
      const m = this.mobFromData(d, elite, diff);
      m.x = (room.x + this.rng.int(2, room.w - 3)) * TILE;
      m.y = (room.y + this.rng.int(2, room.h - 3)) * TILE;
      this.mobs.push(m);
    }
  }

  mobFromData(d: (typeof ENEMIES)[0], elite: boolean, diff: number): Mob {
    const hp = Math.round(d.hp * (1 + diff * 0.18) * (elite ? 1.8 : 1));
    return {
      id: nid(), kind: "enemy", typeId: d.id, name: (elite ? "Elite " : "") + d.name,
      x: 0, y: 0, vx: 0, vy: 0, hp, maxHp: hp, w: d.w, h: d.h, ai: d.aiType,
      state: "idle", timer: this.rng.range(0, 1), telegraph: 0, cd: 0,
      color: d.color, accent: d.accent, damage: Math.round(d.damage * (1 + diff * 0.1) * (elite ? 1.3 : 1)),
      speed: d.speed * (elite ? 1.15 : 1), detect: d.detectionRange, range: d.attackRange,
      elite, flash: 0, status: makeStatus(), phase: 0, patternI: 0, special: 0, revived: false,
      intro: "", patterns: [], phases: [],
    };
  }

  spawnBoss(room: Room): void {
    if (!this.region) return;
    const b = BOSS_BY_ID[this.region.bossId] ?? BOSS_BY_ID.forest_spirit;
    const diff = 1 + this.save.meta.ngPlus * 0.25;
    const hp = Math.round(b.hp * diff);
    const m: Mob = {
      id: nid(), kind: "boss", typeId: b.id, name: b.name,
      x: room.cx * TILE, y: room.cy * TILE, vx: 0, vy: 0,
      hp, maxHp: hp, w: b.w, h: b.h, ai: "boss",
      state: "intro", timer: 1.2, telegraph: 0, cd: 0,
      color: b.color, accent: b.accent, damage: Math.round(b.damage * diff),
      speed: b.speed, detect: 200, range: 28, elite: true, flash: 0,
      status: makeStatus(), phase: 0, patternI: 0, special: 0, revived: false,
      intro: b.intro, patterns: b.patterns, phases: b.phases,
    };
    this.mobs.push(m);
    this.roomBanner(b.name);
    this.toast(b.intro);
    const wrap = document.getElementById("boss-wrap");
    if (wrap) wrap.classList.remove("hidden");
    const nm = document.getElementById("boss-name");
    if (nm) nm.textContent = b.name;
  }

  clearRoom(room: Room): void {
    room.cleared = true;
    if (this.run) this.run.roomsCleared++;
    events.emit("roomCleared", { type: room.type });
    if (this.stats.roomDmg <= 0) this.grantAchievement("untouched");
    if (room.type === RoomType.Boss) {
      this.onBossDead();
      return;
    }
    if (this.run && this.run.roomsCleared > 0 && this.run.roomsCleared % 3 === 0) this.offerBlessing();
    this.player.gold += 4;
  }

  onBossDead(): void {
    if (!this.region || !this.run) return;
    audio.play("boss_death");
    audio.playMusic("victory");
    this.save.meta.bossesDefeated = [...new Set([...this.save.meta.bossesDefeated, this.region.bossId])];
    this.unlockNextRegion(this.region.id);
    this.grantAchievement("woods_cleared");
    if (this.region.bossId === "forest_spirit") this.grantAchievement("woods_cleared");
    if (this.region.bossId === "crystal_golem") this.grantAchievement("mines_cleared");
    if (this.region.bossId === "emberheart_titan") this.grantAchievement("peak_cleared");
    if (this.region.bossId === "the_emberroot") {
      this.grantAchievement("final_wake");
      this.showEnding();
      return;
    }
    this.progressQuestBoss(this.region.bossId);
    this.offerBlessing();
    this.toast(`${this.region.name} remembered your victory.`);
    setTimeout(() => {
      this.endRun(true);
      this.goHub();
    }, 1400);
  }

  unlockNextRegion(id: string): void {
    const next = REGIONS.find((r) => r.unlockAfter === id);
    if (next && !this.save.meta.unlockedRegions.includes(next.id)) {
      this.save.meta.unlockedRegions.push(next.id);
      this.toast(`Unlocked ${next.name}`);
    }
    if (this.save.meta.unlockedRegions.length >= 9) this.grantAchievement("all_regions");
  }

  /* ---------- AI ---------- */
  updateMobs(dt: number): void {
    if (!this.dungeon) return;
    const p = this.player;
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const m = this.mobs[i];
      if (m.flash > 0) m.flash -= dt;
      const tick = tickStatus(m.status, dt);
      if (tick.hpDelta < 0) {
        m.hp += tick.hpDelta;
        this.numbers.spawn(-tick.hpDelta, m.x, m.y, false, "#88ff44");
        if (m.hp <= 0) { this.killMob(m); continue; }
      }
      if (tick.rooted) { m.timer -= dt; continue; }
      if (m.kind === "boss") { this.updateBoss(m, dt); continue; }

      const dx = p.x - m.x;
      const dy = p.y - m.y;
      const dist = Math.hypot(dx, dy);
      m.cd = Math.max(0, m.cd - dt);
      m.timer -= dt;

      if (m.state === "idle") {
        if (dist < m.detect && los(this.dungeon, m.x, m.y, p.x, p.y) && !hasStatus(this.playerStatus, "stealth")) {
          m.state = "chase";
        } else if (m.timer <= 0) {
          m.vx = randRange(-1, 1) * m.speed * 0.4;
          m.vy = randRange(-1, 1) * m.speed * 0.4;
          m.timer = this.rng.range(0.6, 1.6);
        }
      } else if (m.state === "chase") {
        this.steer(m, dx, dy, dist, 1);
        if (dist < m.range) {
          m.state = "telegraph";
          m.telegraph = ENEMY_BY_ID[m.typeId]?.telegraph ?? 0.3;
        }
        if (dist > m.detect * 1.6) m.state = "idle";
      } else if (m.state === "telegraph") {
        m.vx *= 0.8; m.vy *= 0.8;
        m.telegraph -= dt;
        if (m.telegraph <= 0) {
          this.enemyAttack(m);
          m.state = "chase";
          m.cd = ENEMY_BY_ID[m.typeId]?.attackCd ?? 1;
        }
      }

      if (m.ai === "erratic" || m.ai === "swooper") {
        m.vx += Math.sin(this.time * 6 + m.id) * 20 * dt;
        m.vy += Math.cos(this.time * 5 + m.id) * 20 * dt;
      }
      const moved = moveWithCollisions(this.dungeon, m.x, m.y, m.vx * tick.speedMul, m.vy * tick.speedMul, m.w / 3, m.h / 3, dt);
      m.x = moved.x; m.y = moved.y;

      if (dist < (m.w + 10) / 2 && m.cd <= 0 && m.ai !== "archer" && m.ai !== "mage") {
        this.hurtPlayer(m.damage, m.name);
        m.cd = 0.7;
      }
    }
  }

  steer(m: Mob, dx: number, dy: number, dist: number, sign: number): void {
    if (dist < 1) return;
    const sp = m.speed * sign;
    m.vx = (dx / dist) * sp;
    m.vy = (dy / dist) * sp;
  }

  enemyAttack(m: Mob): void {
    const p = this.player;
    if (m.ai === "archer" || m.ai === "mage" || m.ai === "storm" || m.ai === "bloodmage") {
      const a = Math.atan2(p.y - m.y, p.x - m.x);
      this.projs.push({
        x: m.x, y: m.y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110,
        life: 2, damage: m.damage, r: 3, fromPlayer: false,
        element: ENEMY_BY_ID[m.typeId]?.element ?? null, pierce: 0,
      });
      audio.play("magic_cast");
    } else if (m.ai === "assassin") {
      m.x = p.x - p.facingX * 18;
      m.y = p.y - p.facingY * 18;
      this.hurtPlayer(m.damage * 1.2, m.name);
    } else if (m.ai === "burner") {
      this.hurtPlayer(m.damage, m.name);
      applyStatus(this.playerStatus, "burn", 2.5, m.id);
    } else if (m.ai === "freezer") {
      this.hurtPlayer(m.damage, m.name);
      applyStatus(this.playerStatus, "slow", 2, m.id);
    } else if (m.ai === "poisoner") {
      this.hurtPlayer(m.damage, m.name);
      applyStatus(this.playerStatus, "poison", 3, m.id);
    } else if (m.ai === "grabber") {
      this.hurtPlayer(m.damage, m.name);
      applyStatus(this.playerStatus, "slow", 1.2, m.id);
    } else {
      this.hurtPlayer(m.damage, m.name);
    }
  }

  updateBoss(m: Mob, dt: number): void {
    const p = this.player;
    const dx = p.x - m.x;
    const dy = p.y - m.y;
    const dist = Math.hypot(dx, dy);
    m.timer -= dt;
    m.cd = Math.max(0, m.cd - dt);
    const hp01 = m.hp / m.maxHp;
    let phase = 0;
    for (let i = 0; i < m.phases.length; i++) if (hp01 <= m.phases[i]) phase = i + 1;
    if (phase !== m.phase) {
      m.phase = phase;
      m.state = "intro";
      m.timer = 0.8;
      this.toast(`PHASE ${phase + 1}`);
      this.camera.addTrauma(0.4);
    }
    const fill = document.getElementById("boss-hp-fill");
    if (fill) fill.style.width = `${Math.max(0, hp01 * 100)}%`;
    const ph = document.getElementById("boss-phase");
    if (ph) ph.textContent = `Phase ${m.phase + 1}`;

    if (m.state === "intro") {
      if (m.timer <= 0) m.state = "think";
      return;
    }
    if (m.state === "think") {
      const pats = m.patterns[Math.min(m.phase, m.patterns.length - 1)] ?? ["chase"];
      m.state = pats[m.patternI % pats.length];
      m.patternI++;
      m.timer = 1.4;
      m.telegraph = 0.35;
      return;
    }
    if (m.telegraph > 0) {
      m.telegraph -= dt;
      return;
    }
    switch (m.state) {
      case "chase":
        this.steer(m, dx, dy, dist, 1);
        if (dist < 20) this.hurtPlayer(m.damage, m.name);
        break;
      case "slam":
      case "root_slam":
      case "cleave":
        this.hits.push({ x: m.x, y: m.y + 10, w: 50, h: 28, damage: m.damage * 1.3, life: 0.16, fromPlayer: false, element: null, knock: 80, finisher: false, hit: new Set() });
        this.camera.addTrauma(0.3);
        m.state = "think";
        break;
      case "leaf_shot":
      case "shard_ring":
      case "water_shot":
      case "orb": {
        const n = 8;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + this.time;
          this.projs.push({ x: m.x, y: m.y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, life: 2.2, damage: m.damage * 0.6, r: 3, fromPlayer: false, element: "void", pierce: 0 });
        }
        m.state = "think";
        break;
      }
      case "charge":
      case "pounce":
      case "dash_combo":
        this.steer(m, dx, dy, dist, 2.2);
        if (dist < 18) { this.hurtPlayer(m.damage * 1.2, m.name); m.state = "think"; }
        if (m.timer <= 0) m.state = "think";
        break;
      case "summon":
        if (this.region && this.mobs.length < 6) {
          const e = ENEMY_BY_ID[this.rng.pick(this.region.enemyPool)];
          if (e) {
            const min = this.mobFromData(e, false, this.region.difficulty);
            min.x = m.x + randRange(-30, 30);
            min.y = m.y + randRange(-30, 30);
            this.mobs.push(min);
          }
        }
        m.state = "think";
        break;
      case "nova":
      case "tidal":
      case "howl":
      case "fear_aura":
        this.hits.push({ x: m.x, y: m.y, w: 90, h: 90, damage: m.damage, life: 0.2, fromPlayer: false, element: "void", knock: 100, finisher: false, hit: new Set() });
        if (m.state === "fear_aura") applyStatus(this.playerStatus, "slow", 2, m.id);
        m.state = "think";
        break;
      case "beam":
      case "void_beam": {
        const a = Math.atan2(dy, dx);
        this.projs.push({ x: m.x, y: m.y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, life: 0.8, damage: m.damage * 1.4, r: 4, fromPlayer: false, element: "void", pierce: 3 });
        m.state = "think";
        break;
      }
      case "meteor":
      case "fire_pool":
        this.hits.push({ x: p.x, y: p.y, w: 36, h: 36, damage: m.damage, life: 0.4, fromPlayer: false, element: "fire", knock: 40, finisher: false, hit: new Set() });
        m.state = "think";
        break;
      case "gravity":
        p.x = lerp(p.x, m.x, dt * 1.5);
        p.y = lerp(p.y, m.y, dt * 1.5);
        if (m.timer <= 0) m.state = "think";
        break;
      default:
        this.steer(m, dx, dy, dist, 1);
        if (m.timer <= 0) m.state = "think";
    }
    if (this.dungeon) {
      const moved = moveWithCollisions(this.dungeon, m.x, m.y, m.vx, m.vy, m.w / 3, m.h / 3, dt);
      m.x = moved.x; m.y = moved.y;
    }
  }

  updateProjs(dt: number): void {
    for (let i = this.projs.length - 1; i >= 0; i--) {
      const q = this.projs[i];
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.life -= dt;
      if (this.dungeon && tileAt(this.dungeon, q.x, q.y) === Tile.Wall) {
        this.projs.splice(i, 1);
        continue;
      }
      if (q.life <= 0) { this.projs.splice(i, 1); continue; }
      if (q.fromPlayer) {
        let gone = false;
        for (const m of this.mobs) {
          if (Math.hypot(m.x - q.x, m.y - q.y) < m.w / 2 + q.r) {
            this.hurtMob(m, q.damage, false, q.element);
            if (q.pierce > 0) q.pierce--;
            else { this.projs.splice(i, 1); gone = true; }
            break;
          }
        }
        if (gone) continue;
      } else if (Math.hypot(this.player.x - q.x, this.player.y - q.y) < 8 + q.r) {
        this.hurtPlayer(q.damage, "projectile");
        this.projs.splice(i, 1);
      }
    }
  }

  updateHits(dt: number): void {
    for (let i = this.hits.length - 1; i >= 0; i--) {
      const h = this.hits[i];
      h.life -= dt;
      if (h.fromPlayer) {
        for (const m of this.mobs) {
          if (aabbOverlap(h.x, h.y, h.w, h.h, m.x, m.y, m.w, m.h)) {
            this.hurtMob(m, h.damage, false, h.element, h.knock, h.finisher);
          }
        }
      } else if (aabbOverlap(h.x, h.y, h.w, h.h, this.player.x, this.player.y, 10, 12)) {
        this.hurtPlayer(h.damage, "slam");
      }
      if (h.life <= 0) this.hits.splice(i, 1);
    }
  }

  hurtMob(m: Mob, raw: number, _c: boolean, element: string | null, knock = 40, _fin = false): void {
    if (m.hp <= 0) return;
    const ctx = computeDamage({
      baseDamage: raw,
      power: 0,
      skillMult: 1,
      blessingMult: 1,
      synergyMult: 1 + (this.run?.synergies.length ?? 0) * 0.04,
      comboCount: this.player.combo,
      critChance: this.player.crit,
      critMultiplier: this.player.critMul,
      defense: m.kind === "boss" ? 12 : 4,
      vulnerable: hasStatus(m.status, "vulnerable"),
    });
    m.hp -= ctx.dmg;
    m.flash = 0.12;
    this.player.combo++;
    this.player.comboT = 2.2;
    this.stats.comboMax = Math.max(this.stats.comboMax, this.player.combo);
    if (this.player.combo >= 20) this.grantAchievement("combo_20");
    if (this.player.combo >= 50) this.grantAchievement("combo_50");
    this.hitstop = ctx.crit ? 0.06 : 0.03;
    this.camera.addTrauma(ctx.crit ? 0.28 : 0.12);
    if (ctx.crit) this.camera.punch(0.08);
    this.particles.hitSpark(m.x, m.y, element);
    this.numbers.spawn(ctx.dmg, m.x, m.y - 8, ctx.crit);
    audio.play(ctx.crit ? "critical_hit" : "sword_hit");
    if (this.run) this.run.damageDealt += ctx.dmg;
    if (this.player.lifesteal) this.heal(ctx.dmg * this.player.lifesteal);
    const st = this.mods.onHitStatus;
    if (st && Math.random() < (this.mods.onHitChance ?? 0.12)) {
      const rx = tryReaction(m.status, st);
      applyStatus(m.status, st, 2.4, 0);
      if (rx) {
        m.hp -= rx.dmg;
        this.numbers.spawnText(rx.name, m.x, m.y - 18, "#ffd700");
        if (rx.aoe) {
          for (const o of this.mobs) if (o !== m && Math.hypot(o.x - m.x, o.y - m.y) < rx.aoe) o.hp -= rx.dmg * 0.5;
        }
      }
    }
    const ang = Math.atan2(m.y - this.player.y, m.x - this.player.x);
    m.x += Math.cos(ang) * knock * 0.04;
    m.y += Math.sin(ang) * knock * 0.04;
    events.emit("hit", { x: m.x, y: m.y, dmg: ctx.dmg, crit: ctx.crit, element });
    if (m.hp <= 0) this.killMob(m);
  }

  killMob(m: Mob): void {
    if (m.ai === "revenant" && !m.revived) {
      m.revived = true;
      m.hp = m.maxHp * 0.45;
      this.toast("It rises…");
      return;
    }
    this.mobs = this.mobs.filter((x) => x !== m);
    this.particles.kill(m.x, m.y, m.color);
    this.gameSpeed = 0.35;
    setTimeout(() => { if (this.gameSpeed < 1) this.gameSpeed = 1; }, 180);
    audio.play("enemy_death");
    const d = ENEMY_BY_ID[m.typeId];
    const goldMul = 1 + (this.mods.goldGain ?? 0);
    const xpMul = 1 + (this.mods.xpGain ?? 0);
    const gold = Math.round(((d?.deathGold ?? 6) * (m.elite ? 2 : 1) * goldMul) || 3);
    const xp = Math.round(((d?.deathXP ?? 8) * (m.elite ? 2 : 1) * xpMul) || 6);
    this.player.gold += gold;
    this.grantXp(xp);
    this.pickups.push({ x: m.x, y: m.y, kind: "gold", value: gold, life: 8 });
    if (this.rng.chance(0.08 + (this.mods.luck ?? 0))) {
      const it = this.rng.pick(ITEMS.filter((i) => i.type === "consumable")).id;
      this.pickups.push({ x: m.x + 6, y: m.y, kind: "item", value: 1, itemId: it, life: 10 });
    }
    if (this.run) this.run.kills++;
    this.save.meta.totalKills++;
    this.save.meta.bestiary[m.typeId] = (this.save.meta.bestiary[m.typeId] ?? 0) + 1;
    this.progressQuestKill(m.typeId);
    events.emit("enemyKilled", { enemyId: m.typeId, x: m.x, y: m.y, elite: m.elite });
    this.grantAchievement("first_blood");
    if (this.save.meta.totalKills >= 100) this.grantAchievement("centurion");
    if (m.kind === "boss") {
      events.emit("bossDefeated", { bossId: m.typeId, x: m.x, y: m.y });
      document.getElementById("boss-wrap")?.classList.add("hidden");
    }
  }

  grantXp(n: number): void {
    this.player.xp += n;
    while (this.player.level < 20 && this.player.xp >= xpForLevel(this.player.level)) {
      this.player.xp -= xpForLevel(this.player.level);
      this.player.level++;
      this.player.mastery++;
      this.save.player.mastery = this.player.mastery;
      this.player.maxHp += 8;
      this.player.hp = this.player.maxHp;
      this.particles.levelUp(this.player.x, this.player.y);
      audio.play("level_up");
      this.showEl("levelup-toast");
      setTimeout(() => this.hide("levelup-toast"), 900);
      events.emit("levelUp", { newLevel: this.player.level });
      if (this.player.level >= 10) this.grantAchievement("level_10");
      if (this.player.level >= 20) this.grantAchievement("level_20");
    }
  }

  updatePickups(dt: number): void {
    const p = this.player;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const u = this.pickups[i];
      u.life -= dt;
      const dx = p.x - u.x;
      const dy = p.y - u.y;
      const d = Math.hypot(dx, dy);
      if (d < 40) {
        u.x += dx * dt * 4;
        u.y += dy * dt * 4;
      }
      if (d < 10) {
        if (u.kind === "gold") { audio.play("gold_pickup"); }
        if (u.kind === "item" && u.itemId) this.addItem(u.itemId, 1);
        if (u.kind === "hp") this.heal(u.value);
        if (u.kind === "essence") this.save.meta.essence += u.value;
        this.pickups.splice(i, 1);
      } else if (u.life <= 0) this.pickups.splice(i, 1);
    }
  }

  updateCompanion(dt: number): void {
    if (!this.companion || !this.save.flags.pet) return;
    const c = this.companion;
    const p = this.player;
    const dx = p.x - 14 - c.x;
    const dy = p.y - c.y;
    c.x += dx * dt * 4;
    c.y += dy * dt * 4;
    c.cd -= dt;
    const foe = this.mobs[0];
    if (foe && c.cd <= 0 && Math.hypot(foe.x - c.x, foe.y - c.y) < 28) {
      this.hurtMob(foe, 6 + this.player.level, false, "fire");
      c.cd = 0.7;
    }
  }

  /* ---------- hub ---------- */
  makeHubMap(): DungeonMap {
    const w = 30, h = 22;
    const tiles = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      tiles[y * w + x] = edge ? Tile.Wall : Tile.Grass;
    }
    for (let x = 4; x < 8; x++) for (let y = 16; y < 20; y++) tiles[y * w + x] = Tile.Water;
    return {
      width: w, height: h, tiles,
      rooms: [{ id: 0, x: 1, y: 1, w: w - 2, h: h - 2, type: RoomType.Entrance, cleared: true, connections: [], discovered: true, cx: 15, cy: 11 }],
      entrance: { x: 16 * TILE, y: 12 * TILE },
      bossRoomId: -1,
      seed: 1,
    };
  }

  updateHub(dt: number): void {
    if (!this.dungeon) return;
    this.updatePlayer(dt, this.dungeon);
    this.updatePickups(dt);
    this.updateCompanion(dt);
    this.camera.follow(this.player.x, this.player.y - 8, dt, { w: this.dungeon.width * TILE, h: this.dungeon.height * TILE });
    this.refreshHUD();
  }

  tryInteract(): void {
    const p = this.player;
    let best: Interactable | null = null;
    let bd = 22;
    for (const it of this.interacts) {
      const d = Math.hypot(it.x - p.x, it.y - p.y);
      if (d < bd) { bd = d; best = it; }
    }
    if (!best) return;
    if (best.kind === "npc" && best.id) this.talk(best.id);
    else if (best.kind === "portal") {
      if (this.state === GameState.HUB_VILLAGE) this.openOverlay("map");
      else { this.endRun(false); this.goHub(); }
    } else if (best.kind === "chest" && !best.used) {
      best.used = true;
      audio.play("chest_open");
      this.player.gold += 15 + this.rng.int(0, 20);
      if (this.rng.chance(0.5)) this.addItem(this.rng.pick(SHOP_POOL), 1);
      this.toast("Chest opened");
      this.offerBlessing();
    } else if (best.kind === "fountain") {
      this.heal(40);
      audio.play("heal");
      this.toast("The spring remembers you.");
    } else if (best.kind === "shop") this.openOverlay("shop");
    else if (best.kind === "pond") this.startFishing();
  }

  talk(npcId: string): void {
    const tree = DIALOGUES.find((d) => d.npc === npcId);
    if (!tree) return;
    let st = "default";
    if (npcId === "mira" && this.save.meta.unlockedRegions.includes("frosthollow")) st = "late";
    if (!tree.states[st]) st = "default";
    this.dialogue = { tree: tree.id, i: 0, state: st, typed: 0, line: tree.states[st][0]?.text ?? "" };
    this.show("dialogue-box");
    this.renderDialogue();
  }

  updateDialogue(dt: number): void {
    if (!this.dialogue) return;
    this.dialogue.typed += dt * 48;
    const box = document.getElementById("dialogue-text");
    if (box) box.textContent = this.dialogue.line.slice(0, this.dialogue.typed | 0);
    if (this.input.uiPressed("attack") || this.input.uiPressed("interact")) {
      if (this.dialogue.typed < this.dialogue.line.length) this.dialogue.typed = 999;
      else this.advanceDialogue();
    }
  }

  renderDialogue(): void {
    if (!this.dialogue) return;
    const tree = DIALOGUES.find((d) => d.id === this.dialogue!.tree);
    if (!tree) return;
    const lines = tree.states[this.dialogue.state];
    const line = lines[this.dialogue.i];
    if (!line) { this.closeDialogue(); return; }
    this.dialogue.line = line.text;
    this.dialogue.typed = 0;
    const sp = document.getElementById("dialogue-speaker");
    if (sp) sp.textContent = line.speaker;
    const ch = document.getElementById("dialogue-choices");
    if (ch) {
      ch.innerHTML = "";
      (line.choices ?? []).forEach((c) => {
        const b = document.createElement("button");
        b.className = "dialogue-choice";
        b.textContent = c.text;
        b.onclick = () => this.choose(c.next, c.karma ?? 0, c.flag);
        ch.appendChild(b);
      });
    }
  }

  choose(next: string | null, karma: number, flag?: string): void {
    this.save.karma += karma;
    if (flag) this.applyFlag(flag);
    events.emit("choiceRecorded", { choiceId: flag ?? "choice", karmaDelta: karma });
    if (!this.dialogue) return;
    if (!next) { this.closeDialogue(); return; }
    this.dialogue.state = next;
    this.dialogue.i = 0;
    this.renderDialogue();
  }

  advanceDialogue(): void {
    if (!this.dialogue) return;
    const tree = DIALOGUES.find((d) => d.id === this.dialogue!.tree);
    if (!tree) return;
    const lines = tree.states[this.dialogue.state];
    const line = lines[this.dialogue.i];
    if (line?.choices?.length) return;
    this.dialogue.i++;
    if (this.dialogue.i >= lines.length) this.closeDialogue();
    else this.renderDialogue();
  }

  closeDialogue(): void {
    this.dialogue = null;
    this.hide("dialogue-box");
  }

  applyFlag(flag: string): void {
    this.save.flags[flag] = true;
    if (flag.startsWith("quest_")) {
      const id = flag.replace("quest_", "q_");
      const q = QUEST_BY_ID[id] ?? QUESTS.find((x) => x.id.includes(flag.replace("quest_", "")));
      const qq = QUEST_BY_ID["q_" + flag.replace("quest_", "")] ?? QUEST_BY_ID[flag.replace("quest_", "q_")];
      const quest = qq ?? QUESTS.find((x) => x.giver && flag.includes(x.id.replace("q_", "")));
      if (flag === "quest_awaken") this.acceptQuest("q_awaken");
      if (flag === "quest_mines") this.acceptQuest("q_mines");
      if (flag === "quest_peak") this.acceptQuest("q_peak");
      if (flag === "quest_cull") this.acceptQuest("q_cull");
      if (flag === "quest_fish") this.acceptQuest("q_fish");
      if (flag === "quest_depths") this.acceptQuest("q_depths");
      void q; void quest;
    }
    if (flag === "open_shop") this.openOverlay("shop");
    if (flag === "heal") { this.player.hp = this.player.maxHp; audio.play("heal"); }
    if (flag === "recruit_pet") {
      this.save.flags.pet = true;
      this.companion = { x: this.player.x, y: this.player.y, cd: 0 };
      this.grantAchievement("pet_friend");
    }
    if (flag === "open_craft") this.toast("Kett sharpens your blade. +2 damage.");
  }

  acceptQuest(id: string): void {
    if (this.save.activeQuests.some((q) => q.id === id) || this.save.completedQuests.includes(id)) return;
    const q = QUEST_BY_ID[id];
    if (!q) return;
    this.save.activeQuests.push(JSON.parse(JSON.stringify(q)) as QuestData);
    this.toast(`Quest: ${q.name}`);
  }

  progressQuestKill(enemyId: string): void {
    for (const q of this.save.activeQuests) {
      for (const o of q.objectives) {
        if (o.type === "kill" && o.target === enemyId) o.progress++;
      }
      this.checkQuest(q);
    }
  }

  progressQuestBoss(id: string): void {
    for (const q of this.save.activeQuests) {
      for (const o of q.objectives) {
        if (o.type === "boss" && o.target === id) o.progress++;
      }
      this.checkQuest(q);
    }
  }

  checkQuest(q: QuestData): void {
    if (q.objectives.every((o) => o.progress >= o.count)) {
      this.save.activeQuests = this.save.activeQuests.filter((x) => x.id !== q.id);
      this.save.completedQuests.push(q.id);
      this.player.gold += q.rewards.gold;
      this.grantXp(q.rewards.xp);
      this.save.meta.essence += q.rewards.essence;
      if (q.rewards.item) this.addItem(q.rewards.item, 1);
      audio.play("quest_complete");
      this.toast(`Completed: ${q.name}`);
      events.emit("questCompleted", { questId: q.id });
    }
  }

  /* ---------- blessings ---------- */
  offerBlessing(): void {
    if (!this.run) return;
    this.pendingBlessings = rollBlessings(this.run.blessings, (Math.random() * 1e9) | 0, 3);
    const row = document.getElementById("blessing-cards");
    if (!row) return;
    row.innerHTML = "";
    this.pendingBlessings.forEach((b) => {
      const el = document.createElement("div");
      el.className = `blessing-card rarity-${b.rarity}`;
      el.innerHTML = `<div>${b.icon}</div><h3>${b.name}</h3><p>${b.description}</p><p class="muted">${b.warden} · ${b.rarity}</p>`;
      el.onclick = () => this.takeBlessing(b);
      row.appendChild(el);
    });
    this.show("blessing-overlay");
    this.overlay = "blessing";
    this.input.locked = true;
  }

  takeBlessing(b: BlessingData): void {
    if (!this.run) return;
    this.run.blessings.push(b.id);
    this.save.meta.unlockedBlessings = [...new Set([...this.save.meta.unlockedBlessings, b.id])];
    events.emit("blessingAcquired", { blessing: b });
    const syn = detectSynergies(this.run.blessings);
    for (const s of syn) {
      if (!this.run.synergies.includes(s.id)) {
        events.emit("synergyDetected", { synergy: s });
        this.toast(`Synergy: ${s.name}`);
      }
    }
    if (b.rarity === "legendary") this.grantAchievement("legendary_blessing");
    if (this.run.blessings.length >= 8) this.grantAchievement("blessed");
    this.recalc();
    this.hide("blessing-overlay");
    this.overlay = null;
    this.input.locked = false;
    if (this.rng.chance(0.22)) this.offerCurse();
  }

  offerCurse(): void {
    this.pendingCurses = this.rng.shuffle([...CURSES]).slice(0, 2);
    const row = document.getElementById("curse-cards");
    if (!row) return;
    row.innerHTML = "";
    this.pendingCurses.forEach((c) => {
      const el = document.createElement("div");
      el.className = "blessing-card rarity-epic";
      el.innerHTML = `<h3>${c.name}</h3><p>${c.description}</p>`;
      el.onclick = () => this.takeCurse(c);
      row.appendChild(el);
    });
    this.show("curse-overlay");
    this.overlay = "curse";
    this.input.locked = true;
  }

  takeCurse(c: CurseData): void {
    this.run?.curses.push(c.id);
    events.emit("curseApplied", { curse: c });
    this.recalc();
    this.hide("curse-overlay");
    this.overlay = null;
    this.input.locked = false;
    this.toast(`Cursed: ${c.name}`);
  }

  /* ---------- inventory / items ---------- */
  addItem(id: string, qty: number): void {
    const inv = this.save.player.inventory;
    const s = inv.find((x) => x.id === id);
    if (s) s.qty += qty;
    else inv.push({ id, qty });
    events.emit("itemPickup", { itemId: id });
    audio.play("item_pickup");
  }

  useItem(id: string): boolean {
    const s = this.save.player.inventory.find((x) => x.id === id);
    if (!s || s.qty <= 0) { this.toast("None left"); return false; }
    s.qty--;
    if (id === "potion" || id === "fish") this.heal(id === "fish" ? 20 : 40);
    if (id === "stamina_tea") this.player.stamina = this.player.maxStamina;
    if (id === "antidote") clearHarmful(this.playerStatus);
    if (id === "bomb") {
      this.hits.push({ x: this.player.x + this.player.aimX * 20, y: this.player.y + this.player.aimY * 20, w: 40, h: 40, damage: 30, life: 0.2, fromPlayer: true, element: "fire", knock: 50, finisher: false, hit: new Set() });
    }
    if (id === "whetstone") this.mods.damage = (this.mods.damage ?? 0) + 0.2;
    return true;
  }

  startFishing(): void {
    this.fishing = { on: true, t: 0 };
    this.toast("Fishing — press E when the spark is bright");
  }

  updateFishing(dt: number): void {
    if (!this.fishing) return;
    this.fishing.t += dt;
    const pulse = Math.abs(Math.sin(this.fishing.t * 4));
    if (this.input.justPressed("interact") || this.input.justPressed("attack")) {
      if (pulse > 0.72) {
        this.addItem("fish", 1);
        this.stats.fish++;
        this.grantAchievement("fisher");
        for (const q of this.save.activeQuests) {
          for (const o of q.objectives) if (o.type === "collect" && o.target === "fish") o.progress++;
          this.checkQuest(q);
        }
        this.toast("A silverfin!");
      } else this.toast("It got away.");
      this.fishing = null;
    }
    if (this.fishing && this.fishing.t > 8) { this.toast("The pond grows bored."); this.fishing = null; }
  }

  /* ---------- render world ---------- */
  renderWorld(hub: boolean): void {
    const ctx = this.ctx;
    this.camera.apply(ctx);
    if (this.tileCache) ctx.drawImage(this.tileCache, 0, 0);
    for (const it of this.interacts) {
      if (it.kind === "chest") drawSprite(ctx, it.used ? "chest_open" : "chest", it.x, it.y);
      else if (it.kind === "portal") drawSprite(ctx, "portal", it.x, it.y);
      else if (it.kind === "fountain") {
        ctx.fillStyle = "#4ecdc4";
        ctx.fillRect(it.x - 4, it.y - 6, 8, 8);
      } else if (it.kind === "npc" && it.id) drawSprite(ctx, "npc_" + it.id, it.x, it.y);
      else if (it.kind === "pond") { /* water tiles */ }
      else if (it.kind === "shop") drawSprite(ctx, "chest", it.x, it.y);
    }
    const actors: { y: number; draw: () => void }[] = [];
    actors.push({
      y: this.player.y,
      draw: () => {
        drawSprite(ctx, "shadow", this.player.x, this.player.y + 2);
        const bob = this.player.state === "walk" ? Math.sin(this.time * 12) * 1 : 0;
        const key = this.player.state === "walk" && ((this.time * 8) | 0) % 2 ? "player_walk" : "player";
        drawSprite(ctx, key, this.player.x, this.player.y + bob, {
          flipX: this.player.facingX < 0,
          flash: this.player.flash,
          alpha: this.player.iFrames > 0 && ((this.time * 20) | 0) % 2 ? 0.5 : 1,
        });
        if (this.player.state === "attack" || this.player.state === "heavy" || this.player.state === "finisher")
          drawSprite(ctx, "slash", this.player.x + this.player.aimX * 12, this.player.y + this.player.aimY * 8, { flipX: this.player.aimX < 0 });
      },
    });
    if (this.companion) {
      const c = this.companion;
      actors.push({ y: c.y, draw: () => drawSprite(ctx, "fox", c.x, c.y) });
    }
    for (const m of this.mobs) {
      actors.push({
        y: m.y,
        draw: () => {
          drawSprite(ctx, "shadow", m.x, m.y + 2, { scale: m.kind === "boss" ? 2 : 1 });
          drawSprite(ctx, m.typeId, m.x, m.y, { flash: m.flash, flipX: m.vx < 0 });
          if (m.state === "telegraph" || (m.kind === "boss" && m.telegraph > 0)) {
            ctx.strokeStyle = "rgba(233,69,96,0.8)";
            ctx.strokeRect(m.x - m.w / 2, m.y - m.h, m.w, m.h);
          }
          const bw = m.w;
          ctx.fillStyle = "#300";
          ctx.fillRect(m.x - bw / 2, m.y - m.h - 4, bw, 2);
          ctx.fillStyle = m.kind === "boss" ? "#e94560" : "#4ecdc4";
          ctx.fillRect(m.x - bw / 2, m.y - m.h - 4, bw * Math.max(0, m.hp / m.maxHp), 2);
        },
      });
    }
    actors.sort((a, b) => a.y - b.y);
    for (const a of actors) a.draw();
    for (const q of this.projs) {
      ctx.fillStyle = q.fromPlayer ? "#ffd700" : "#e94560";
      ctx.fillRect(q.x - 2, q.y - 2, 4, 4);
    }
    for (const u of this.pickups) drawSprite(ctx, u.kind === "gold" ? "coin" : "heart", u.x, u.y);
    this.particles.render(ctx);
    this.numbers.render(ctx);

    const lights = [{ x: this.player.x, y: this.player.y, r: this.run?.curses.includes("ashen_sight") ? LIGHT_RADIUS * 0.5 : LIGHT_RADIUS }, ...this.lights];
    if (!hub) drawLighting(ctx, this.camera, lights, this.region?.theme === "shadow" || this.region?.theme === "dream" ? 0.78 : 0.55);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawInteractPrompt();
    if (this.bannerT > 0) {
      const b = document.getElementById("room-banner");
      if (b) {
        b.textContent = this.banner;
        b.classList.remove("hidden");
      }
    } else document.getElementById("room-banner")?.classList.add("hidden");
  }

  drawInteractPrompt(): void {
    const p = this.player;
    const el = document.getElementById("interact-prompt");
    if (!el) return;
    const hit = this.interacts.find((i) => Math.hypot(i.x - p.x, i.y - p.y) < 20);
    if (hit) {
      el.textContent =
        hit.kind === "npc" ? `[E] Talk` :
        hit.kind === "chest" ? `[E] Open` :
        hit.kind === "portal" ? `[E] ${this.state === GameState.HUB_VILLAGE ? "World Map" : "Return"}` :
        hit.kind === "fountain" ? `[E] Drink` :
        hit.kind === "pond" ? `[E] Fish` :
        `[E] Use`;
      el.classList.remove("hidden");
    } else el.classList.add("hidden");
  }

  /* ---------- UI ---------- */
  bindUI(): void {
    document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", () => {
        audio.unlock();
        audio.play("menu_click");
        this.handleAction((el as HTMLElement).dataset.action ?? "");
      });
    });
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        this.fillCompendium((b as HTMLElement).dataset.tab ?? "bestiary");
      });
    });
    const bindVol = (id: string, bus: "master" | "music" | "sfx") => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (!el) return;
      el.addEventListener("input", () => {
        const v = Number(el.value) / 100;
        if (bus === "master") this.settings.master = v;
        if (bus === "music") this.settings.music = v;
        if (bus === "sfx") this.settings.sfx = v;
        this.applySettings();
      });
    };
    bindVol("vol-master", "master");
    bindVol("vol-music", "music");
    bindVol("vol-sfx", "sfx");
    const shake = document.getElementById("shake-amt") as HTMLInputElement | null;
    shake?.addEventListener("input", () => {
      this.settings.shake = Number(shake.value) / 100;
      this.camera.shakeMul = this.settings.shake;
      saveSettings(this.settings);
    });
    const rf = document.getElementById("reduce-flash") as HTMLInputElement | null;
    rf?.addEventListener("change", () => { this.settings.reduceFlash = rf.checked; saveSettings(this.settings); });
    const sd = document.getElementById("show-dmg") as HTMLInputElement | null;
    sd?.addEventListener("change", () => { this.settings.showDmg = sd.checked; this.numbers.enabled = sd.checked; saveSettings(this.settings); });
    const aa = document.getElementById("autoaim") as HTMLInputElement | null;
    aa?.addEventListener("change", () => { this.settings.autoaim = aa.checked; this.input.aimAssist = aa.checked; saveSettings(this.settings); });
    window.addEventListener("pointerdown", () => audio.unlock(), { once: true });
  }

  handleAction(a: string): void {
    switch (a) {
      case "new-game": audio.play("menu_confirm"); this.newGame(); break;
      case "continue": this.continueGame(); break;
      case "challenges": this.openOverlay("challenge"); break;
      case "compendium": this.openOverlay("compendium"); break;
      case "settings": this.openOverlay("settings"); break;
      case "resume": this.closeOverlays(); break;
      case "inventory": this.openOverlay("inventory"); break;
      case "skills": this.openOverlay("skills"); break;
      case "quests": this.openOverlay("quests"); break;
      case "save": this.persist(); this.toast("Saved."); break;
      case "to-menu": this.closeOverlays(); this.goMenu(); break;
      case "close-settings":
      case "close-panel": this.closeOverlays(); if (this.state === GameState.MAIN_MENU) this.show("screen-menu"); break;
      case "retry": this.hide("death-screen"); this.goHub(); this.player.dead = false; this.player.hp = this.player.maxHp; break;
      case "skip-curse": this.hide("curse-overlay"); this.overlay = null; this.input.locked = false; break;
      case "daily": this.closeOverlays(); this.startRun("whispering_woods", "daily"); break;
      case "endless": this.closeOverlays(); this.startRun("whispering_woods", "endless"); break;
      case "boss-rush": this.closeOverlays(); this.startBossRush(); break;
      case "ngplus":
        this.save.meta.ngPlus++;
        this.grantAchievement("ngplus");
        this.toast(`NG+${this.save.meta.ngPlus}`);
        this.closeOverlays();
        this.newGame();
        break;
      case "export-save": exportSave(this.save); break;
      case "import-save": {
        const inp = document.createElement("input");
        inp.type = "file";
        inp.accept = "application/json";
        inp.onchange = async () => {
          const f = inp.files?.[0];
          if (!f) return;
          this.save = JSON.parse(await f.text());
          this.persist();
          this.toast("Imported.");
        };
        inp.click();
        break;
      }
    }
  }

  startBossRush(): void {
    this.startRun("whispering_woods", "bossrush");
    if (this.dungeon) {
      const bossRoom = this.dungeon.rooms.find((r) => r.type === RoomType.Boss);
      if (bossRoom) {
        this.player.x = bossRoom.cx * TILE;
        this.player.y = bossRoom.cy * TILE;
        this.enterRoom(bossRoom);
      }
    }
  }

  openOverlay(name: string): void {
    this.closeOverlays();
    this.overlay = name;
    this.input.locked = name !== "hud";
    const map: Record<string, string> = {
      pause: "pause-overlay",
      settings: "settings-overlay",
      inventory: "inventory-overlay",
      skills: "skills-overlay",
      quests: "quests-overlay",
      shop: "shop-overlay",
      map: "map-overlay",
      compendium: "compendium-overlay",
      challenge: "challenge-overlay",
      saveload: "saveload-overlay",
    };
    const id = map[name];
    if (id) this.show(id);
    if (name === "inventory") this.fillInventory();
    if (name === "skills") this.fillSkills();
    if (name === "quests") this.fillQuests();
    if (name === "shop") this.fillShop();
    if (name === "map") this.fillMap();
    if (name === "compendium") this.fillCompendium("bestiary");
    if (name === "settings") this.show("settings-overlay");
  }

  closeOverlays(): void {
    [
      "pause-overlay", "settings-overlay", "inventory-overlay", "skills-overlay",
      "quests-overlay", "shop-overlay", "map-overlay", "compendium-overlay",
      "challenge-overlay", "saveload-overlay", "blessing-overlay", "curse-overlay",
    ].forEach((id) => this.hide(id));
    this.overlay = null;
    this.input.locked = false;
  }

  updateOverlay(): void {
    if (this.input.uiPressed("pause") || this.input.uiPressed("inventory")) this.closeOverlays();
  }

  fillInventory(): void {
    const grid = document.getElementById("inv-grid");
    const eq = document.getElementById("equip-slots");
    const det = document.getElementById("inv-detail");
    if (!grid || !eq) return;
    grid.innerHTML = "";
    eq.innerHTML = "";
    const slots = this.save.player.equipment;
    for (const k of Object.keys(slots)) {
      const d = document.createElement("div");
      d.className = "equip-slot" + (slots[k] ? " filled" : "");
      const it = slots[k] ? ITEM_BY_ID[slots[k]!] : null;
      d.textContent = it ? it.icon : k[0]!.toUpperCase();
      d.title = k;
      eq.appendChild(d);
    }
    for (const s of this.save.player.inventory) {
      const it = ITEM_BY_ID[s.id];
      const d = document.createElement("div");
      d.className = "inv-slot";
      d.textContent = (it?.icon ?? "?") + (s.qty > 1 ? s.qty : "");
      d.onclick = () => {
        if (det && it) det.textContent = `${it.name}\n${it.description}`;
        if (it?.type === "consumable") this.useItem(it.id);
        else if (it?.slot) {
          this.save.player.equipment[it.slot] = it.id;
          this.recalc();
          this.fillInventory();
        }
      };
      grid.appendChild(d);
    }
  }

  fillSkills(): void {
    const root = document.getElementById("skill-tree");
    const mp = document.getElementById("mastery-points");
    if (mp) mp.textContent = `Mastery ${this.player.mastery}`;
    if (!root) return;
    root.innerHTML = "";
    for (let b = 0; b < 5; b++) {
      const col = document.createElement("div");
      col.className = "skill-branch";
      const title = document.createElement("div");
      title.className = "branch-name";
      title.textContent = SKILL_BRANCHES[b];
      col.appendChild(title);
      SKILLS.filter((s) => s.branch === b).forEach((s) => {
        const btn = document.createElement("button");
        const unlocked = this.save.player.skills.includes(s.id);
        const prereq = !s.prerequisite || this.save.player.skills.includes(s.prerequisite);
        btn.className = "skill-node " + (unlocked ? "unlocked" : prereq ? "available" : "locked");
        btn.textContent = s.icon;
        btn.title = `${s.name} (${s.masteryCost})\n${s.description}`;
        btn.onclick = () => {
          if (unlocked || !prereq) return;
          if (this.player.mastery < s.masteryCost) { this.toast("Need more mastery"); return; }
          this.player.mastery -= s.masteryCost;
          this.save.player.skills.push(s.id);
          this.save.player.mastery = this.player.mastery;
          events.emit("skillUnlocked", { skillId: s.id });
          this.recalc();
          this.fillSkills();
        };
        col.appendChild(btn);
      });
      root.appendChild(col);
    }
  }

  fillQuests(): void {
    const list = document.getElementById("quest-list");
    if (!list) return;
    const rows = this.save.activeQuests.length
      ? this.save.activeQuests.map((q) => `<div class="quest-item"><b>${q.name}</b><br>${q.description}<br>${q.objectives.map((o) => `${o.type} ${o.target} ${o.progress}/${o.count}`).join(" · ")}</div>`).join("")
      : `<div class="muted">No active quests. Speak with Quill.</div>`;
    list.innerHTML = rows;
  }

  fillShop(): void {
    const grid = document.getElementById("shop-grid");
    const g = document.getElementById("shop-gold");
    if (g) g.textContent = `◆ ${this.player.gold}`;
    if (!grid) return;
    grid.innerHTML = "";
    const stock = SHOP_POOL.slice(0, 8);
    stock.forEach((id) => {
      const it = ITEM_BY_ID[id];
      if (!it) return;
      const d = document.createElement("div");
      d.className = "inv-slot";
      d.textContent = it.icon;
      d.title = `${it.name} — ${it.buyPrice}g`;
      d.onclick = () => {
        if (this.player.gold < it.buyPrice) { this.toast("Not enough gold"); return; }
        this.player.gold -= it.buyPrice;
        this.addItem(it.id, 1);
        this.stats.bought++;
        this.fillShop();
      };
      grid.appendChild(d);
    });
    // meta upgrades
    META_UPGRADES.forEach((u) => {
      const rank = this.save.meta.upgrades[u.id] ?? 0;
      const d = document.createElement("div");
      d.className = "inv-slot";
      d.textContent = `${u.name[0]}${rank}`;
      d.title = `${u.name} ${rank}/20 — ${metaCost(rank)} essence. ${u.desc}`;
      d.onclick = () => {
        const cost = metaCost(rank);
        if (this.save.meta.essence < cost || rank >= 20) { this.toast("Need essence"); return; }
        this.save.meta.essence -= cost;
        this.save.meta.upgrades[u.id] = rank + 1;
        this.applyMetaToPlayer();
        this.recalc();
        this.fillShop();
        this.toast(`${u.name} → ${rank + 1}`);
      };
      grid.appendChild(d);
    });
  }

  fillMap(): void {
    const root = document.getElementById("region-map");
    if (!root) return;
    root.innerHTML = "";
    REGIONS.forEach((r) => {
      const locked = !this.save.meta.unlockedRegions.includes(r.id);
      const el = document.createElement("div");
      el.className = "region-node" + (locked ? " locked" : "") + (this.save.meta.bossesDefeated.includes(r.bossId) ? " cleared" : "");
      el.innerHTML = `<b>${r.name}</b><br><span class="muted">${r.theme}</span>`;
      el.onclick = () => {
        if (locked) { this.toast("The roots refuse you still."); return; }
        this.closeOverlays();
        this.startRun(r.id);
      };
      root.appendChild(el);
    });
  }

  fillCompendium(tab: string): void {
    const body = document.getElementById("compendium-body");
    if (!body) return;
    if (tab === "bestiary") {
      body.innerHTML = ENEMIES.map((e) => {
        const n = this.save.meta.bestiary[e.id] ?? 0;
        return `<div class="comp-item">${n ? e.name : "???"} — ${n ? e.description : "Unknown"} (${n})</div>`;
      }).join("");
    } else if (tab === "achievements") {
      body.innerHTML = ACHIEVEMENTS.map((a) => {
        const got = this.save.meta.achievements.includes(a.id);
        return `<div class="comp-item">${got ? "★" : "☆"} ${a.hidden && !got ? "???" : a.name} — ${got || !a.hidden ? a.description : "Hidden"}</div>`;
      }).join("");
    } else if (tab === "lore") {
      body.innerHTML = LORE.map((l, i) => {
        const known = this.save.meta.lore.includes(l.id) || i < 3;
        return `<div class="comp-item"><b>${known ? l.title : "???"}</b><br>${known ? l.text : "The page is charred."}</div>`;
      }).join("");
    } else {
      body.innerHTML = `<div class="comp-item">Runs ${this.save.meta.totalRuns} · Kills ${this.save.meta.totalKills} · Deaths ${this.save.meta.deaths}<br>Essence ${this.save.meta.essence} · Karma ${this.save.karma} · NG+ ${this.save.meta.ngPlus}<br>Playtime ${Math.floor(this.save.playTime / 60)}m</div>`;
    }
  }

  refreshHUD(): void {
    const p = this.player;
    const hp = document.getElementById("hp-fill");
    const hpt = document.getElementById("hp-text");
    const st = document.getElementById("stamina-fill");
    const sh = document.getElementById("hp-shield");
    if (hp) hp.style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
    if (hpt) hpt.textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
    if (st) st.style.width = `${Math.max(0, (p.stamina / p.maxStamina) * 100)}%`;
    if (sh) sh.style.width = `${Math.min(100, (p.shield / p.maxHp) * 100)}%`;
    const g = document.getElementById("gold-text");
    const e = document.getElementById("essence-text");
    const f = document.getElementById("floor-text");
    if (g) g.textContent = `◆ ${p.gold}`;
    if (e) e.textContent = `✦ ${this.save.meta.essence}`;
    if (f) f.textContent = this.region ? this.region.name.split(" ")[0]! : "Hub";
    const icons = document.getElementById("status-icons");
    if (icons) {
      icons.innerHTML = "";
      for (const [k, v] of this.playerStatus.effects) {
        const d = document.createElement("div");
        d.className = "status-icon";
        d.style.borderColor = "#fff";
        d.textContent = k[0]!.toUpperCase();
        d.title = `${k} ${v.stacks}`;
        icons.appendChild(d);
      }
    }
    const strip = document.getElementById("blessing-strip");
    if (strip && this.run) {
      strip.innerHTML = this.run.blessings.slice(-12).map((id) => {
        const b = BLESSING_BY_ID[id];
        return `<div class="blessing-chip" title="${b?.name ?? id}">${b?.icon ?? "?"}</div>`;
      }).join("");
    }
  }

  syncComboHud(): void {
    const el = document.getElementById("combo-counter");
    if (!el) return;
    if (this.player.combo >= 2) {
      el.textContent = `${this.player.combo} HIT`;
      el.classList.remove("hidden");
    } else el.classList.add("hidden");
  }

  refreshSynergyHud(): void {
    const el = document.getElementById("synergy-hud");
    if (!el || !this.run) return;
    const syn = detectSynergies(this.run.blessings);
    el.innerHTML = syn.map((s) => `<div>${s.name}</div>`).join("");
  }

  showEnding(): void {
    const k = this.save.karma;
    const key = k >= 50 ? "merciful" : k <= -50 ? "ruthless" : "balanced";
    const e = ENDING_TEXT[key];
    this.grantAchievement(key);
    this.endRun(true);
    this.state = GameState.ENDING;
    this.hide("hud");
    const t = document.getElementById("ending-title");
    const b = document.getElementById("ending-text");
    if (t) t.textContent = e.title;
    if (b) b.textContent = e.body;
    this.show("ending-screen");
    audio.playMusic("victory");
  }

  grantAchievement(id: string): void {
    if (this.save.meta.achievements.includes(id)) return;
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    this.save.meta.achievements.push(id);
    events.emit("achievementUnlocked", { id });
    this.toast(`★ ${a.name}`);
  }

  toast(msg: string): void {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const d = document.createElement("div");
    d.className = "toast";
    d.textContent = msg;
    stack.appendChild(d);
    setTimeout(() => d.remove(), 2400);
  }

  roomBanner(t: string): void {
    this.banner = t;
    this.bannerT = 2.2;
  }

  persist(): void {
    this.save.player.hp = this.player.hp;
    this.save.player.maxHp = this.player.maxHp;
    this.save.player.gold = this.player.gold;
    this.save.player.level = this.player.level;
    this.save.player.xp = this.player.xp;
    this.save.player.mastery = this.player.mastery;
    writeSave(this.save);
  }

  applySettings(): void {
    audio.setVolume("master", this.settings.master);
    audio.setVolume("music", this.settings.music);
    audio.setVolume("sfx", this.settings.sfx);
    this.camera.shakeMul = this.settings.shake;
    this.numbers.enabled = this.settings.showDmg;
    this.input.aimAssist = this.settings.autoaim;
    saveSettings(this.settings);
  }

  show(id: string): void { document.getElementById(id)?.classList.remove("hidden"); }
  hide(id: string): void { document.getElementById(id)?.classList.add("hidden"); }
  showEl = this.show;
  hideScreens(): void {
    ["screen-menu", "screen-loading", "death-screen", "ending-screen"].forEach((id) => this.hide(id));
  }
  showHud(): void { this.show("hud"); }
}

export const gameRef: { g: Game | null } = { g: null };
