/**
 * useLocalStorage composable
 * 封裝 localStorage 操作，提供型別安全的讀取、儲存、清除功能
 */

/**
 * localStorage 操作 composable
 * @param key - localStorage 的鍵名
 * @param defaultValue - 預設值 (當 localStorage 為空或讀取失敗時使用)
 * @returns 包含 load, save, clear 方法的物件
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  /**
   * 讀取資料
   * @returns 讀取的資料，失敗時返回預設值
   */
  function load(): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return defaultValue;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      console.error('localStorage read error:', error);
      return defaultValue;
    }
  }

  /**
   * 儲存資料
   * @param value - 要儲存的資料
   * @returns 是否成功儲存
   */
  function save(value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('localStorage write error:', error);
      return false;
    }
  }

  /**
   * 清空資料
   */
  function clear(): void {
    localStorage.removeItem(key);
  }

  return {
    load,
    save,
    clear,
  };
}
