import type { StatusEffectType } from "@/data/enums";
import { applyStatus, hasStatus } from "./StatusEffects";
import type { StatusEffectComponent } from "@/data/types";

export interface Reaction {
  name: string;
  dmg: number;
  aoe: number;
  status?: StatusEffectType;
}

export function tryReaction(
  c: StatusEffectComponent,
  incoming: StatusEffectType
): Reaction | null {
  const has = (t: StatusEffectType) => hasStatus(c, t);
  if (incoming === "burn" && has("freeze")) {
    c.effects.delete("freeze");
    return { name: "MELT", dmg: 28, aoe: 0 };
  }
  if (incoming === "freeze" && has("burn")) {
    c.effects.delete("burn");
    return { name: "MELT", dmg: 28, aoe: 0 };
  }
  if (incoming === "burn" && has("shock")) {
    return { name: "OVERLOAD", dmg: 18, aoe: 36 };
  }
  if (incoming === "shock" && has("burn")) {
    return { name: "OVERLOAD", dmg: 18, aoe: 36 };
  }
  if (incoming === "shock" && (has("freeze") || has("slow"))) {
    return { name: "ELECTRO-CHARGED", dmg: 10, aoe: 28, status: "shock" };
  }
  if (incoming === "freeze" && has("freeze")) {
    applyStatus(c, "stun", 1.2, 0);
    return { name: "FROZEN", dmg: 8, aoe: 0 };
  }
  if (incoming === "poison" && has("burn")) {
    return { name: "CORROSION", dmg: 14, aoe: 0, status: "vulnerable" };
  }
  if (incoming === "burn" && has("poison")) {
    return { name: "CORROSION", dmg: 14, aoe: 0, status: "vulnerable" };
  }
  if (incoming === "shock" && has("freeze")) {
    applyStatus(c, "vulnerable", 3, 0);
    return { name: "SUPERCONDUCT", dmg: 12, aoe: 20 };
  }
  if (incoming === "bleed" && has("burn")) {
    return { name: "BLOODSTORM", dmg: 22, aoe: 30 };
  }
  if (incoming === "burn" && has("bleed")) {
    return { name: "BLOODSTORM", dmg: 22, aoe: 30 };
  }
  return null;
}
