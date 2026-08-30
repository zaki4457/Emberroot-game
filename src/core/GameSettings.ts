import { SETTINGS_KEY } from "@/engine/Constants";

export interface Settings {
  master: number;
  music: number;
  sfx: number;
  shake: number;
  reduceFlash: boolean;
  showDmg: boolean;
  autoaim: boolean;
}

export const defaultSettings = (): Settings => ({
  master: 0.8,
  music: 0.6,
  sfx: 0.8,
  shake: 1,
  reduceFlash: false,
  showDmg: true,
  autoaim: false,
});

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
