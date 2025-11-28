/**
 * Vitest 測試環境設定檔案
 * 用於設定測試環境的全域配置與 mocks
 */

import { beforeEach } from 'vitest';

// Mock localStorage
class LocalStorageMock {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map();
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }
}

// 設定 global localStorage
global.localStorage = new LocalStorageMock() as Storage;

// 每個測試前清空 localStorage
beforeEach(() => {
  global.localStorage.clear();
});
