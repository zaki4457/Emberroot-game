import { SAVE_KEY } from "@/engine/Constants";
import type { GameSaveData, MetaProgression } from "@/data/types";

export const META_UPGRADES = [
  { id: "vigor", name: "Vigor", desc: "+4 max HP per rank" },
  { id: "steel", name: "Steel", desc: "+3% damage per rank" },
  { id: "haste", name: "Haste", desc: "+2% move and attack speed per rank" },
  { id: "fortune", name: "Fortune", desc: "+4% gold and luck per rank" },
  { id: "memory", name: "Memory", desc: "+2% XP and starting shield per rank" },
];

export function emptyMeta(): MetaProgression {
  return {
    essence: 0,
    upgrades: { vigor: 0, steel: 0, haste: 0, fortune: 0, memory: 0 },
    unlockedRegions: ["whispering_woods"],
    unlockedBlessings: [],
    bestiary: {},
    achievements: [],
    lore: [],
    totalRuns: 0,
    totalKills: 0,
    deaths: 0,
    highestFloor: 0,
    bossesDefeated: [],
    playTime: 0,
    ngPlus: 0,
  };
}

export function defaultSave(): GameSaveData {
  return {
    version: 1,
    timestamp: Date.now(),
    playTime: 0,
    player: {
      level: 1,
      xp: 0,
      hp: 100,
      maxHp: 100,
      gold: 25,
      mastery: 0,
      skills: [],
      inventory: [
        { id: "rusty_sword", qty: 1 },
        { id: "potion", qty: 2 },
      ],
      equipment: {
        weapon: "rusty_sword",
        offhand: null,
        head: null,
        body: "travel_cloak",
        boots: "worn_boots",
        ring: null,
      },
    },
    karma: 0,
    flags: {},
    storyPhase: "early",
    completedQuests: [],
    activeQuests: [],
    meta: emptyMeta(),
    run: null,
    hubStage: 0,
  };
}

export function loadSave(): GameSaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GameSaveData;
    if (!data || data.version < 1) return migrate(data);
    return data;
  } catch {
    return null;
  }
}

export function writeSave(data: GameSaveData): void {
  data.timestamp = Date.now();
  const json = JSON.stringify(data);
  try {
    localStorage.setItem(SAVE_KEY, json);
  } catch {
    void persistIndexedDb(json);
  }
}

export function exportSave(data: GameSaveData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "emberroot-save.json";
  a.click();
}

export function metaCost(rank: number): number {
  return Math.round(5 * Math.pow(1.5, rank));
}

function migrate(data: GameSaveData): GameSaveData {
  const d = defaultSave();
  return { ...d, ...data, version: 1 };
}

async function persistIndexedDb(json: string): Promise<void> {
  try {
    const req = indexedDB.open("emberroot", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("saves");
    req.onsuccess = () => {
      const tx = req.result.transaction("saves", "readwrite");
      tx.objectStore("saves").put(json, "primary");
    };
  } catch {
    /* ignore */
  }
}
