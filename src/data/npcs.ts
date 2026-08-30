import type { NPCData } from "./types";

export const NPCS: NPCData[] = [
  { id: "bramble", name: "Bramble", role: "shop", x: 12, y: 10, color: "#c4a35a" },
  { id: "sora", name: "Sora", role: "healer", x: 20, y: 8, color: "#4ecdc4" },
  { id: "kett", name: "Kett", role: "blacksmith", x: 8, y: 14, color: "#ff6b35" },
  { id: "quill", name: "Quill", role: "quest", x: 16, y: 16, color: "#ffd700" },
  { id: "ash", name: "Ash", role: "mystery", x: 24, y: 14, color: "#9b59b6" },
  { id: "luma", name: "Luma", role: "companion", x: 18, y: 6, color: "#e94560" },
  { id: "niall", name: "Niall", role: "fisher", x: 6, y: 18, color: "#5b8def" },
  { id: "mira", name: "Mira", role: "lore", x: 22, y: 18, color: "#ce93d8" },
];

export const NPC_BY_ID: Record<string, NPCData> = Object.fromEntries(
  NPCS.map((n) => [n.id, n])
);
