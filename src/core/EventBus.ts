import type { GameEventMap } from "@/data/types";

type Handler<T> = (data: T) => void;

export class EventBus {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof GameEventMap>(
    event: K,
    handler: Handler<GameEventMap[K]>
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler);
    return () => set!.delete(handler);
  }

  emit<K extends keyof GameEventMap>(event: K, data: GameEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const h of set) {
      try {
        (h as Handler<GameEventMap[K]>)(data);
      } catch (err) {
        console.error(`[EventBus] ${event}`, err);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const events = new EventBus();
