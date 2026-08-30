export type Entity = number;

export class World {
  private nextId = 1;
  private alive = new Set<number>();
  private store = new Map<string, Map<number, unknown>>();
  private toDestroy: number[] = [];

  create(): Entity {
    const id = this.nextId++;
    this.alive.add(id);
    return id;
  }

  destroy(id: Entity): void {
    this.toDestroy.push(id);
  }

  isAlive(id: Entity): boolean {
    return this.alive.has(id);
  }

  flush(): void {
    for (const id of this.toDestroy) {
      this.alive.delete(id);
      for (const map of this.store.values()) map.delete(id);
    }
    this.toDestroy.length = 0;
  }

  add<T>(id: Entity, type: string, data: T): T {
    let m = this.store.get(type);
    if (!m) {
      m = new Map();
      this.store.set(type, m);
    }
    m.set(id, data);
    return data;
  }

  get<T>(id: Entity, type: string): T | undefined {
    return this.store.get(type)?.get(id) as T | undefined;
  }

  require<T>(id: Entity, type: string): T {
    const v = this.get<T>(id, type);
    if (!v) throw new Error(`Missing component ${type} on ${id}`);
    return v;
  }

  has(id: Entity, type: string): boolean {
    return this.store.get(type)?.has(id) ?? false;
  }

  remove(id: Entity, type: string): void {
    this.store.get(type)?.delete(id);
  }

  query(...types: string[]): Entity[] {
    if (types.length === 0) return [...this.alive];
    const maps = types.map((t) => this.store.get(t));
    if (maps.some((m) => !m)) return [];
    const [first, ...rest] = maps as Map<number, unknown>[];
    const out: Entity[] = [];
    for (const id of first.keys()) {
      if (!this.alive.has(id)) continue;
      if (rest.every((m) => m.has(id))) out.push(id);
    }
    return out;
  }

  each<T>(type: string, fn: (id: Entity, c: T) => void): void {
    const m = this.store.get(type);
    if (!m) return;
    for (const [id, c] of m) {
      if (this.alive.has(id)) fn(id, c as T);
    }
  }

  count(): number {
    return this.alive.size;
  }

  clear(): void {
    this.alive.clear();
    this.store.clear();
    this.toDestroy.length = 0;
    this.nextId = 1;
  }
}
