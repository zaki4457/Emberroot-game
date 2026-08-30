export class ObjectPool<T> {
  private free: T[] = [];
  private all: T[] = [];

  constructor(
    private factory: () => T,
    private reset: (item: T) => void,
    initial = 0
  ) {
    for (let i = 0; i < initial; i++) {
      const item = factory();
      this.free.push(item);
      this.all.push(item);
    }
  }

  acquire(): T {
    const item = this.free.pop() ?? this.factory();
    if (!this.all.includes(item)) this.all.push(item);
    return item;
  }

  release(item: T): void {
    this.reset(item);
    this.free.push(item);
  }

  get activeCount(): number {
    return this.all.length - this.free.length;
  }
}
