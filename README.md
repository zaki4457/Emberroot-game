# EMBERROOT

**The World Remembers.**

A top-down roguelite action RPG in the browser. TypeScript, HTML5 Canvas 2D, Web Audio — zero runtime dependencies.

## Play

```bash
npm install
npm run dev
```

Then open the local URL. New Game → Ashbrook village → World Map → Whispering Woods.

## Controls

| Action | Key | Gamepad |
|--------|-----|---------|
| Move | WASD / Arrows | Left stick |
| Melee combo | J / Left click | A / X |
| Ranged | K / Right click | B / Y |
| Dodge | Space / Shift | B / Circle |
| Parry | L | LB |
| Interact | E / Enter | A |
| Heal (tonic) | Q | D-pad up |
| Ultimate | R | — |
| Inventory | I / Tab | Select |
| Skill tree | T | — |
| Map (hub) | M | — |
| Pause | Esc | Start |

Touch: virtual stick + four action buttons on coarse pointers.

## Loop

1. **Ashbrook** — talk, shop, heal, fish, recruit Luma the ember-fox.
2. **Nine regions** — Kruskal-MST dungeons, locked doors of memory, room types (combat, challenge, treasure, shop, healing, boss, secret).
3. **Combat** — 3-hit melee, charged heavy, ranged, dodge i-frames, parry (perfect 80ms), 5-hit finisher, four ultimates via the skill tree.
4. **Wardens** — 140 blessings (4×7×5), 39 synergies, 10 curses, 13 statuses, 7 elemental reactions.
5. **Karma** — choices in dialogue. Merciful / Balanced / Ruthless endings at the Emberroot.

## Stack

- TypeScript 5 + Vite 5
- Canvas 2D (`imageSmoothingEnabled = false`)
- DOM overlay UI
- Custom AABB + tile collision
- Procedural chiptune (Web Audio)

```bash
npm test        # vitest
npm run build   # production
npm run typecheck
```
