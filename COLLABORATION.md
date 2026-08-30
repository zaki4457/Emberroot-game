# EMBERROOT — Dual-Agent Collaboration Brief

**The World Remembers. Two walkers, one tree.**

This file is the contract between AI workers on `arena/01a0528a-emberroot-game`.
Read it before touching code. Update the **Status Board** when you finish a slice.

| | |
|---|---|
| Branch (fixed) | `arena/01a0528a-emberroot-game` |
| Never | Switch / create / push any other branch |
| Runtime npm deps | **None** (Vite + TypeScript + Vitest are dev-only) |
| Stack | TS 5, Canvas 2D, DOM overlay UI, custom AABB, Web Audio |
| God object | `src/core/Game.ts` (~2,280 lines) — **do not both edit this file** |
| Asset root | `Assets/` — **do not both rewrite this tree** |

---

## 1. Role assignments and responsibilities

Two agents. Names are for the handshake, not ego.

### Agent Ember — Web runtime (engine, combat, feel)

**Owns (exclusive write):**

| Path | Why |
|------|-----|
| `src/engine/` | ECS, math, RNG, pools, coroutines |
| `src/rendering/` | Camera, sprites, particles, lighting, title tree |
| `src/physics/` | Tiles, AABB, spatial hash, LOS |
| `src/input/` | Keyboard, mouse, gamepad, touch |
| `src/audio/` | Web Audio buses; **consumes** files from `Assets/Audio/` |
| `src/combat/` | Damage pipeline, statuses, reactions, juice |
| `src/player/` | **To be extracted** from `Game.ts` |
| `src/enemy/` | **To be extracted** from `Game.ts` |
| `src/core/Game.ts` | Loop + combat/player until extracted (claim first) |
| `vite.config.ts`, `tsconfig.json`, `package.json` | Web toolchain |

**Responsibilities**

- 60fps frame budget, hitstop / shake / particles / damage numbers
- Player controller: 8-dir move, 3-hit melee, heavy, ranged, dodge i-frames, parry, finisher, ultimates
- Enemy / boss AI (data-driven switch today; split later)
- Canvas sprite atlas, lighting, tile cache, camera
- Wire authored `Assets/Audio/*.mp3` and sprite sheets into the web boot
- Combat math tests (`tests/combat.test.ts`, `tests/status.test.ts`)

**Does not** dump new Unity `.cs` / Editor generators, or overwrite `Assets/` JPEGs.

### Agent Ash — Content, assets, meta, UI, narrative

**Owns (exclusive write):**

| Path | Why |
|------|-----|
| `Assets/` | Authored art, music, SFX, Unity editor helpers, input actions |
| `src/data/` | Enemies, blessings, synergies, skills, items, quests, dialogue, lore |
| `src/expansion/` | Blessings, synergies, curses, meta |
| `src/world/DungeonGenerator.ts` | Kruskal MST, room types |
| `src/hub/` | **To be extracted** from `Game.makeHubMap` |
| `src/narrative/` | **To be extracted** from dialogue / karma / quests |
| `src/ui/` | **To be extracted** from `index.html` + overlay methods |
| `src/inventory/`, `src/collection/` | Equipment, bestiary, fashion |
| `index.html`, `src/styles.css` | DOM screens and theme |
| `src/core/SaveSystem.ts` | Persistence schema |
| `tests/blessings.test.ts`, `tests/dungeon.test.ts`, `tests/save.test.ts` | Content tests |

**Responsibilities**

- Keep `Assets/` named, de-duplicated, and web-usable (prefer PNG sprite sheets over huge JPEGs when possible)
- 140 blessings / 39 synergies / 9 regions / 24 enemies / 11 bosses stay data-complete
- Dialogue, karma, endings, quests, village memory
- HUD / menus / blessing cards / skill tree / shop / map / compendium
- Unity editor scripts stay isolated under `Assets/Editor/` (web build must not import `.cs`)

**Does not** retune hitboxes, physics constants, or the rAF loop without a Status Board `NEED:`.

### Shared / locked files

| File | Rule |
|------|------|
| `src/core/Game.ts` | **One agent at a time.** Ember extracts player/enemy; Ash extracts UI/hub. |
| `src/core/EventBus.ts`, `src/data/types.ts`, `src/data/enums.ts` | Additive only. Never rename an existing event or save field without a migrator. |
| `src/main.ts` | Tiny. Only change if a new manager must boot. |
| `COLLABORATION.md` | Both update Status Board. Don't rewrite the other role. |
| `Assets/Audio/**` | Ash adds files. Ember only **reads** them from `AudioManager`. |

### Handshake

1. Claim a slice in **§6 Status Board** (`CLAIMED Ember` / `CLAIMED Ash`) before editing.
2. One slice in flight per agent.
3. `npx tsc --noEmit && npx vitest run` green before push (Ember always; Ash when touching `src/` or `tests/`).
4. Unclaim + mark `DONE` in the same commit or Status Board edit.
5. If you need a file you don't own: leave a `NEED:` note — don't silently edit.
6. **Never force-push** this branch. `git pull --rebase origin arena/01a0528a-emberroot-game` then push.

---

## 2. Complete feature parity checklist

Legend: `[x]` shipped in the web build · `[~]` partial · `[ ]` missing.

### Core systems

- [x] GameManager singleton (`Game` + `gameRef`)
- [x] EventBus (typed `GameEventMap`)
- [~] Scene state machine (`GameState` enum; still methods on `Game`, not scene classes)
- [~] Game flow (menu → hub → map → dungeon → boss → hub / death / ending)
- [x] Save / load (`localStorage`)
- [x] Auto-save (5 min)
- [x] Settings persistence
- [~] Stats tracker (meta counters; no analytics UI)
- [ ] Difficulty manager (NG+ scalar only)

### Player

- [x] 8-directional movement
- [x] Melee combo (3-hit)
- [x] Heavy attack (charged)
- [x] Ranged projectile
- [x] Dodge / dash with i-frames
- [x] Parry (perfect 0.08s + regular 0.22s)
- [x] Finisher (5-hit, skill `sk_0_3`)
- [x] 4 Ultimates (Berserker / Aegis / Archmage / Phantom Dash)
- [x] HP + stamina
- [x] Leveling 1–20 + mastery
- [x] Skill tree (5×6 = 30)
- [~] Weapon switching (equip slot)
- [x] Equipment (6 slots)
- [ ] Transmog

### Combat feel

- [x] Hit stop, kill slow-mo, trauma shake, zoom punch
- [x] Hit particles, damage numbers, combo HUD
- [x] Crit visual + audio, dodge trail, level-up flourish

### Status (13) and reactions (7)

- [x] Burn, Freeze, Shock, Poison, Bleed, Slow, Stun, Vulnerable, Shield, Haste, Regen, Stealth, Berserk
- [x] Melt, Overload, Electro-Charged, Frozen, Corrosion, Superconduct, Bloodstorm

### Enemies (24) and bosses (11)

- [x] All 24 enemy ids in `src/data/enemies.ts` with AI flavors
- [~] Not yet 21 unique AI classes under `src/enemy/ai/`
- [x] 11 bosses with phase pattern lists
- [~] Boss Rush = jump to woods boss, not a full gauntlet

### Roguelite

- [x] 140 blessings, 3-card UI, 39 synergies, 10 curses
- [x] Meta essence, 5 upgrades × 20 ranks
- [~] Daily (date seed), Endless (no per-floor scaler yet), NG+

### World

- [x] Ashbrook hub + 9 regions, Kruskal MST dungeons
- [~] Lava / ice / water tiles; no fear / oxygen / gravity systems
- [ ] Combat-room door locks

### Narrative / hub

- [x] Karma, 3 endings, 8 NPC trees, 8 quests, 30 lore, 50 achievements (some unwired)
- [~] Blacksmith is a toast; no village visual stages
- [~] Luma companion only (not 5 pets)
- [x] Fishing timing minigame
- [ ] Fashion, photo mode, crafting recipes

### Audio / art pipeline

- [x] Procedural Web Audio SFX + chiptune beds (current web playback)
- [~] **Authored bank on disk:** `Assets/Audio/Music/` (7) + `Assets/Audio/SFX/` (~36 mp3)
- [ ] Wire those mp3s into `AudioManager` (Ember) using Ash's filenames
- [~] Sprite JPEGs landing in `Assets/` (batches in progress) — not yet an atlas the Canvas renderer reads
- [ ] Convert sheets to PNG + JSON frame metadata for `src/rendering/sprites.ts`

### Input / tech / deploy

- [x] Keyboard, mouse, gamepad, touch
- [ ] Rebind UI
- [x] Vitest 26 tests
- [ ] Playwright smoke
- [ ] itch.io / GitHub Pages workflow

---

## 3. Repository structure map

```
Emberroot-game/
├── COLLABORATION.md
├── README.md
├── package.json / vite.config.ts / tsconfig.json
├── index.html
├── Assets/                          ← Ash (Unity + authored media)
│   ├── Audio/Music/*.mp3
│   ├── Audio/SFX/{Combat,Magic,Status,UI,World}/*.mp3
│   ├── Editor/*.cs                  ← Unity-only; web ignores
│   ├── Settings/InputActions.inputactions
│   └── *.jpeg                       ← inbound sprite batches
├── src/                             ← Ember + Ash as table above
│   ├── main.ts
│   ├── styles.css
│   ├── audio/ combat/ core/ data/ engine/
│   ├── expansion/roguelite/ input/ physics/ rendering/ world/
│   └── core/Game.ts                 ← extract target
└── tests/
```

### Import convention (web)

```ts
import { TILE } from "@/engine/Constants";
import type { BlessingData } from "@/data/types";
```

Vite must **not** bundle `Assets/Editor/**/*.cs`. Static media should be referenced as `/Assets/Audio/...` or copied into `public/` by a later slice.

### Where logic lives today

Gameplay after boot is methods on `Game`. Content is under `src/data/`. Authored bytes are under `Assets/`. Extraction + asset wiring are the collaboration wins.

Suggested ping-pong:

1. Ember: `src/player/*` from `updatePlayer` / attacks
2. Ash: `src/ui/UIManager.ts` from overlays / HUD
3. Ember: `AudioManager` loads `Assets/Audio` mp3s
4. Ash: sprite PNG atlas + JSON; Ember draws it
5. Ember: `src/enemy/EnemySystem.ts` + `BossAI.ts`
6. Ash: `src/hub/HubWorld.ts` + `src/narrative/DialogueSystem.ts`
7. Both: `Game.ts` becomes loop + wiring

---

## 4. Development workflow

### Branch (non-negotiable)

```
arena/01a0528a-emberroot-game
```

```bash
git pull --rebase origin arena/01a0528a-emberroot-game
# ... work ...
npx tsc --noEmit && npx vitest run    # if you touched src/ or tests/
git push origin arena/01a0528a-emberroot-game
```

### Commands (web)

```bash
npm install
npm run dev          # 0.0.0.0:5173
npm test
npm run typecheck
npm run build
```

Bind `0.0.0.0`. Never call `localhost` from browser JS.

### Definition of done

1. Typecheck + tests green if `src/` or `tests/` changed
2. Menu → New Game → hub walk → woods still works
3. Status Board updated
4. No new runtime npm dependencies
5. Don't commit `node_modules/` or Unity `Library/`

### Commit style

```
<area>: <imperative summary>

Ash: add combat SFX pack
Ember: play authored sword_hit mp3
```

Areas: `engine`, `combat`, `player`, `enemy`, `data`, `ui`, `hub`, `narrative`, `world`, `audio`, `assets`, `save`, `test`, `collab`.

### Conflict protocol

- `Game.ts`: keep both method sets; extract rather than delete.
- `Assets/`: never regenerate a JPEG the other agent just added; add a new name.
- Binary merge conflicts: `git checkout --ours/--theirs` only after agreeing on Status Board.

### Save compatibility

`GameSaveData.version === 1`. Additive fields optional or defaulted. Bump + migrate on breaking changes.

---

## 5. Future enhancement ideas

Don't start until the current Status Board wave is green.

### Near-term

- Extract `Game.ts`
- Play authored mp3s (map `play("sword_hit")` → `Assets/Audio/SFX/Combat/sfx_sword_hit.mp3`)
- Sprite atlas from Ash's sheets (PNG, `imageSmoothingEnabled = false`)
- Combat-room door locks
- Endless floor scaler, sequential Boss Rush
- Zone mechanics, village memory stages
- Playwright: menu → new game → hub → woods

### Mid-term

- 5 companions, crafting recipes, fashion, photo mode, death analytics
- Adaptive music using Ash's combat_01 / combat_02 beds
- Deduplicate JPEG pairs (`*_202608252032` vs `*_202608291257`)

### Later / out of scope

- itch.io + Pages Action
- WebGL only if Canvas misses 60fps
- **No** multiplayer, Steam, or console targets for the web build
- Unity Editor scripts are optional tooling, not a second shipping game unless Ash documents otherwise

---

## 6. Status Board

Newest at the top of each wave.

### Wave 0 — Playable vertical slice

| Slice | Agent | State |
|-------|-------|-------|
| Engine loop, canvas, camera | Ember | DONE |
| Input kb/mouse/pad/touch | Ember | DONE |
| Player combat + juice | Ember | DONE |
| Kruskal dungeon + 9 regions | Ember* | DONE |
| 140 blessings / 39 synergies / 10 curses | Ember* | DONE |
| Hub + dialogue + quests + endings | Ember* | DONE |
| Save / settings / meta | Ember* | DONE |
| Vitest 26 | Ember | DONE |
| Authored music + SFX under `Assets/Audio` | Ash | DONE |
| Unity Editor generators + InputActions | Ash | DONE |
| Sprite JPEG batch 1–2/6 | Ash | DONE (in flight for remaining batches) |
| `COLLABORATION.md` | Ember | DONE |

\*Shipped in the original web conversion commit; Ash should treat `src/data` as theirs going forward.

### Wave 1 — Extract + wire assets (NEXT)

| Slice | Agent | State |
|-------|-------|-------|
| Remaining sprite batches 3–6 | Ash | OPEN |
| Dedup JPEG names; prefer PNG sheets | Ash | OPEN |
| `AudioManager` fetch/decode `Assets/Audio/**/*.mp3` | Ember | OPEN |
| `src/player/*` extract | Ember | OPEN |
| `src/ui/UIManager.ts` extract | Ash | OPEN |
| `src/enemy/*` extract | Ember | OPEN |
| Atlas JSON + Canvas draw of authored player/enemy | both | OPEN |

### Wave 2 — Parity holes

| Slice | Agent | State |
|-------|-------|-------|
| Combat-room door locks | Ember | OPEN |
| Endless scaler + Boss Rush sequence | Ember | OPEN |
| Zone mechanics | Ember | OPEN |
| Village memory visuals | Ash | OPEN |
| Achievement condition wiring | Ash | OPEN |
| Playwright smoke | Ash | OPEN |

### Need / blockers

- Ember **NEED:** a stable filename map for SFX (`sword_hit` → `Assets/Audio/SFX/Combat/sfx_sword_hit.mp3` already matches). Don't rename without a table in this file.
- Ash **NEED:** tell Ember when a sprite sheet is final (grid size, frame order) so atlas code can land.

### Notes for the other agent

- Hitboxes use `Set<number>` so a swing hits each mob once — don't "simplify" that away.
- Blessing ids: `ember_strike_rare`. Synergy `required` values are **prefixes**. `detectSynergies` uses `startsWith`.
- Blessing overlay pauses the sim by returning early from `Game.update` — keep that if you extract UI.
- Web ignores `Assets/Editor/*.cs`. Safe to keep for Unity tooling.

---

## 7. Quick playtest (every web push)

1. `npm run dev` → title tree + **EMBERROOT**
2. New Game → Ashbrook, WASD, talk to Quill
3. Portal / **M** → Whispering Woods
4. J melee, Space dodge, K ranged, damage numbers
5. Refresh → Continue still loads

If any of those fail, the slice is not done.

---

*Emberroot dual-agent brief · August 2026 · branch `arena/01a0528a-emberroot-game`*
