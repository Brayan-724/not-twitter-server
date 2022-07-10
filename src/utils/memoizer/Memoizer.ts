export class Memoizer<R> {
  private cache: Map<string, R> = new Map();

  get(key: string): R | undefined;
  get(key: any[]): R | undefined;
  get(key: string | any[]): R | undefined {
    if (typeof key === 'string') {
      return this.cache.get(key);
    }

    const keyString = JSON.stringify(key);

    return this.cache.get(keyString);
  }

  set(key: string, value: R): void;
  set(key: any[], value: R): void;
  set(key: string | any[], value: R): void {
    if (typeof key === 'string') {
      this.cache.set(key, value);
    } else {
      const keyString = JSON.stringify(key);

      this.cache.set(keyString, value);
    }
  }

  has(key: string): boolean;
  has(key: any[]): boolean;
  has(key: string | any[]): boolean {
    if (typeof key === 'string') {
      return this.cache.has(key);
    }

    const keyString = JSON.stringify(key);

    return this.cache.has(keyString);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  memoize<R>(fn: (...args: any[]) => R): (...args: any[]) => R {
    return Memoizer.memoize(fn);
  }

  static memoize<R>(fn: (...args: any[]) => R): (...args: any[]) => R {
    const memoizer = new Memoizer<R>();

    return (...args: any[]): R => {
      const key = JSON.stringify(args);

      if (memoizer.has(key)) {
        return memoizer.get(key);
      }

      const result = fn(...args);

      memoizer.set(key, result);

      return result;
    };
  }
}
