import { afterEach } from 'vitest';

/**
 * In-memory localStorage shim for tests.
 *
 * Some modules (Valtio stores wrapped with `persistStore`) read /
 * write `localStorage` at module load. Tests run in Node where
 * `localStorage` is undefined, so we install a minimal shim
 * globally before any module imports.
 *
 * The shim is also reset between tests via the `afterEach` hook at
 * the bottom so test files cannot pollute each other.
 */
class LocalStorageShim {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
  get length(): number {
    return Object.keys(this.store).length;
  }
  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new LocalStorageShim(),
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  globalThis.localStorage.clear();
});
