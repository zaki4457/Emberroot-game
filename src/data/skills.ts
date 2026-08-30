import type { SkillData } from "./types";

const BRANCHES = ["Blade", "Ward", "Arcane", "Shadow", "Vital"];

export const SKILLS: SkillData[] = [];

const defs: Array<{
  name: string;
  desc: string;
  icon: string;
  mods: SkillData["mods"];
  type: "active" | "passive";
}>[] = [
  [
    { name: "Keen Edge", desc: "+8% melee damage", icon: "/", mods: { damage: 0.08 }, type: "passive" },
    { name: "Combo Oil", desc: "Combo window +0.2s", icon: "///", mods: { attackSpeed: 0.06 }, type: "passive" },
    { name: "Heavy Cadence", desc: "Heavy attacks +20%", icon: "▼", mods: { damage: 0.1 }, type: "passive" },
    { name: "Finisher", desc: "5-hit finisher +30%", icon: "★", mods: { critDamage: 0.15 }, type: "passive" },
    { name: "Blade Storm", desc: "Melee hits can cleave", icon: "※", mods: { area: 0.15 }, type: "passive" },
    { name: "Berserker", desc: "Ultimate: huge damage, take more", icon: "!", mods: { damage: 0.25 }, type: "active" },
  ],
  [
    { name: "Iron Skin", desc: "+6 defense", icon: "▣", mods: { defense: 6 }, type: "passive" },
    { name: "Guard Pulse", desc: "Parry window slightly longer", icon: "◇", mods: { defense: 3 }, type: "passive" },
    { name: "Stalwart", desc: "+16 max HP", icon: "♥", mods: { maxHp: 16 }, type: "passive" },
    { name: "Thorns", desc: "Return 10% melee", icon: "↑", mods: { damage: 0.04 }, type: "passive" },
    { name: "Aegis", desc: "Start rooms with a shield", icon: "⬡", mods: { defense: 5 }, type: "passive" },
    { name: "Guardian Aegis", desc: "Ultimate: damage aura", icon: "◉", mods: { area: 0.2 }, type: "active" },
  ],
  [
    { name: "Spark", desc: "Ranged +10% damage", icon: "*", mods: { damage: 0.06 }, type: "passive" },
    { name: "Quick Cast", desc: "Ranged cooldown -15%", icon: "»", mods: { cooldown: 0.15, attackSpeed: 0.05 }, type: "passive" },
    { name: "Elementalist", desc: "On-hit elemental chance", icon: "※", mods: { onHitChance: 0.15, onHitStatus: "burn" }, type: "passive" },
    { name: "Split Shot", desc: "+1 projectile", icon: "∴", mods: { projectile: 1 }, type: "passive" },
    { name: "Overchannel", desc: "Crit chance +8%", icon: "✧", mods: { critChance: 0.08 }, type: "passive" },
    { name: "Archmage Surge", desc: "Ultimate: nova of elements", icon: "✶", mods: { area: 0.3, damage: 0.15 }, type: "active" },
  ],
  [
    { name: "Soft Step", desc: "+6% move speed", icon: "›", mods: { moveSpeed: 0.06 }, type: "passive" },
    { name: "Long Shadow", desc: "Dodge i-frames +0.04s", icon: "∽", mods: { dodgeIFrames: 0.04 }, type: "passive" },
    { name: "Backstab", desc: "Crit from behind +25%", icon: "†", mods: { critDamage: 0.2 }, type: "passive" },
    { name: "Smoke", desc: "Dodge may stealth", icon: "○", mods: { dodgeIFrames: 0.03 }, type: "passive" },
    { name: "Assassinate", desc: "First hit in stealth crits", icon: "♠", mods: { critChance: 0.1 }, type: "passive" },
    { name: "Phantom Dash", desc: "Ultimate: invuln dash + clones", icon: "☽", mods: { moveSpeed: 0.1 }, type: "active" },
  ],
  [
    { name: "Deep Breath", desc: "Stamina regen +12%", icon: "s", mods: { staminaRegen: 0.12 }, type: "passive" },
    { name: "Hardy", desc: "+12 max HP", icon: "♥", mods: { maxHp: 12 }, type: "passive" },
    { name: "Leech", desc: "1% lifesteal", icon: "δ", mods: { lifesteal: 0.02 }, type: "passive" },
    { name: "Second Wind", desc: "Low HP regen", icon: "+", mods: { maxHp: 8 }, type: "passive" },
    { name: "Greed", desc: "+15% gold and XP", icon: "$", mods: { goldGain: 0.15, xpGain: 0.15 }, type: "passive" },
    { name: "Rooted", desc: "All stats slightly up", icon: "♣", mods: { damage: 0.08, defense: 4, maxHp: 10, moveSpeed: 0.04 }, type: "passive" },
  ],
];

for (let b = 0; b < 5; b++) {
  for (let t = 0; t < 6; t++) {
    const d = defs[b][t];
    const id = `sk_${b}_${t}`;
    SKILLS.push({
      id,
      name: d.name,
      branch: b,
      tier: t,
      prerequisite: t === 0 ? null : `sk_${b}_${t - 1}`,
      masteryCost: t + 1,
      type: d.type,
      description: `${BRANCHES[b]}: ${d.desc}`,
      icon: d.icon,
      cooldown: d.type === "active" ? 18 : 0,
      mods: d.mods,
    });
  }
}

export const SKILL_BY_ID: Record<string, SkillData> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s])
);

export const SKILL_BRANCHES = BRANCHES;
