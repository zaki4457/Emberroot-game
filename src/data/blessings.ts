import {
  BehaviorType,
  RARITY_MULT,
  RarityType,
  WardenType,
  type StatusEffectType,
} from "./enums";
import type { BlessingData, StatMods } from "./types";

const WARDENS: WardenType[] = ["ember", "frost", "storm", "void"];
const BEHAVIORS: BehaviorType[] = [
  "strike",
  "ward",
  "surge",
  "bloom",
  "grasp",
  "pulse",
  "echo",
];
const RARITIES: RarityType[] = ["common", "uncommon", "rare", "epic", "legendary"];

const NAMES: Record<WardenType, Record<BehaviorType, string[]>> = {
  ember: {
    strike: ["Spark Blade", "Cinder Cut", "Flame Edge", "Inferno Fang", "Heartfire"],
    ward: ["Warm Shell", "Cinder Plate", "Ashguard", "Magma Aegis", "Phoenix Veil"],
    surge: ["Quick Spark", "Kindling", "Wildfire Step", "Solar Rush", "Dawnbreak"],
    bloom: ["Ember Salve", "Hearthglow", "Living Coal", "Phoenix Bloom", "Rebirth"],
    grasp: ["Soot Snare", "Cinder Bind", "Molten Grasp", "Lava Coil", "Worldbrand"],
    pulse: ["Heat Ripple", "Burst Coal", "Firestorm", "Eruption", "Sunheart Nova"],
    echo: ["Afterburn", "Searing Memory", "Flame Echo", "Immolant", "Eternal Cinder"],
  },
  frost: {
    strike: ["Rime Edge", "Ice Bit", "Glacier Fang", "Hoarfrost", "Winter's Verdict"],
    ward: ["Rimecoat", "Iceglass", "Permafrost", "Glacial Bulwark", "Stillheart"],
    surge: ["Cold Snap", "Sleetstep", "Blizzard Pace", "Arctic Flow", "Timeless Ice"],
    bloom: ["Snowmelt", "Frostbloom", "Aurora Rest", "Hibernal", "Thaw of Ages"],
    grasp: ["Rime Lock", "Ice Shackle", "Frostbind", "Glacier Grip", "Worldfreeze"],
    pulse: ["Chill Ring", "Hailburst", "Whiteout", "Ice Age", "Absolute Zero"],
    echo: ["Afterchill", "Crystal Memory", "Echoflake", "Frozen Hour", "Neverthaw"],
  },
  storm: {
    strike: ["Static Edge", "Spark Thorn", "Thunderbite", "Stormfang", "Skyfall"],
    ward: ["Ozone Veil", "Cloudmail", "Tempest Aegis", "Lightning Cage", "Skyshield"],
    surge: ["Zephyr", "Tailwind", "Gale Step", "Thunderdash", "Godspeed"],
    bloom: ["Rainkiss", "Ozone Bloom", "Stormgrace", "Fulgur Heal", "Skyborn"],
    grasp: ["Static Cling", "Chain Snare", "Stormfetter", "Thunderhold", "Skytyrant"],
    pulse: ["Spark Ring", "Arc Burst", "Thunderclap", "Tempest", "Worldbolt"],
    echo: ["Aftershock", "Resonance", "Chain Memory", "Living Arc", "Foreverstorm"],
  },
  void: {
    strike: ["Umbral Cut", "Night Thorn", "Void Edge", "Eclipse Fang", "Unmaking"],
    ward: ["Shade Cloak", "Duskplate", "Eventide", "Null Aegis", "Unbeing"],
    surge: ["Slip", "Nightstep", "Voidstride", "Eclipse Dash", "Unbound"],
    bloom: ["Leechglow", "Umbral Gift", "Blood Moon", "Nihil Bloom", "The Remembering"],
    grasp: ["Fear Tether", "Shade Bind", "Voidcoil", "Event Horizon", "Worldend"],
    pulse: ["Dark Ripple", "Null Burst", "Singularity", "Cataclysm", "The Forgetting"],
    echo: ["Afterdark", "Echo of None", "Residual Void", "Living Shadow", "Always Was"],
  },
};

const ICONS: Record<WardenType, string> = {
  ember: "▲",
  frost: "◆",
  storm: "⚡",
  void: "●",
};

function modsFor(
  w: WardenType,
  b: BehaviorType,
  r: RarityType,
  i: number
): { mods: StatMods; effect: StatusEffectType | null; desc: string } {
  const m = RARITY_MULT[r];
  const t = (n: number) => Math.round(n * m * 100) / 100;
  const p = (n: number) => Math.round(n * m * 1000) / 1000;
  switch (b) {
    case "strike":
      return {
        mods: {
          damage: t(0.08 + i * 0.02),
          critChance: w === "void" ? p(0.03 + i * 0.01) : p(0.01),
          critDamage: w === "ember" ? t(0.1 + i * 0.04) : 0,
        },
        effect: w === "ember" ? "burn" : w === "frost" ? "bleed" : null,
        desc: `Melee and skill damage +${Math.round(t(8 + i * 2))}%`,
      };
    case "ward":
      return {
        mods: {
          defense: t(4 + i * 2),
          maxHp: t(8 + i * 4),
        },
        effect: "shield",
        desc: `Defense +${Math.round(t(4 + i * 2))}, max HP +${Math.round(t(8 + i * 4))}`,
      };
    case "surge":
      return {
        mods: {
          attackSpeed: t(0.06 + i * 0.03),
          moveSpeed: t(0.05 + i * 0.02),
          dodgeIFrames: w === "storm" ? p(0.02 + i * 0.01) : 0,
        },
        effect: "haste",
        desc: `Attack speed +${Math.round(t(6 + i * 3))}%, move +${Math.round(t(5 + i * 2))}%`,
      };
    case "bloom":
      return {
        mods: {
          lifesteal: w === "void" ? p(0.03 + i * 0.015) : p(0.01 + i * 0.005),
          staminaRegen: t(0.08 + i * 0.04),
          xpGain: t(0.05 + i * 0.03),
        },
        effect: "regen",
        desc: `Sustain and recovery swell with the ${w} warden.`,
      };
    case "grasp":
      return {
        mods: {
          cooldown: t(0.05 + i * 0.03),
          onHitChance: p(0.12 + i * 0.04),
          onHitStatus:
            w === "frost" ? "slow" : w === "storm" ? "shock" : w === "ember" ? "burn" : "vulnerable",
        },
        effect:
          w === "frost" ? "freeze" : w === "storm" ? "stun" : w === "ember" ? "burn" : "vulnerable",
        desc: `Hits may afflict foes with ${w} control.`,
      };
    case "pulse":
      return {
        mods: {
          area: t(0.1 + i * 0.06),
          damage: t(0.04 + i * 0.02),
          projectile: w === "storm" ? 1 : 0,
        },
        effect: null,
        desc: `Area of effect +${Math.round(t(10 + i * 6))}%`,
      };
    case "echo":
      return {
        mods: {
          damage: t(0.03 + i * 0.02),
          critChance: p(0.02 + i * 0.01),
          luck: t(0.05 + i * 0.04),
          goldGain: t(0.06 + i * 0.04),
        },
        effect: w === "void" ? "stealth" : w === "ember" ? "berserk" : null,
        desc: `On-hit echoes and fortune favor you.`,
      };
  }
}

function build(): BlessingData[] {
  const out: BlessingData[] = [];
  for (const w of WARDENS) {
    for (const b of BEHAVIORS) {
      NAMES[w][b].forEach((name, i) => {
        const rarity = RARITIES[i];
        const { mods, effect, desc } = modsFor(w, b, rarity, i);
        const id = `${w}_${b}_${rarity}`;
        out.push({
          id,
          name,
          warden: w,
          behavior: b,
          rarity,
          icon: ICONS[w],
          description: desc,
          damageMultiplier: 1 + (mods.damage ?? 0),
          cooldownReduction: mods.cooldown ?? 0,
          grantedEffect: effect,
          mods,
        });
      });
    }
  }
  return out;
}

export const BLESSINGS: BlessingData[] = build();
export const BLESSING_BY_ID: Record<string, BlessingData> = Object.fromEntries(
  BLESSINGS.map((b) => [b.id, b])
);
