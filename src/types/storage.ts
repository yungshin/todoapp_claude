import type { TodoItem } from './todo';

/**
 * localStorage 儲存資料結構
 * Key: 'todos-app-data'
 */
export interface StorageData {
  /**
   * 待辦事項陣列
   */
  todos: TodoItem[];

  /**
   * 資料格式版本號
   * 用於未來資料遷移
   * 當前版本: '1.0'
   */
  version: string;

  /**
   * 最後同步時間戳記 (保留欄位,目前未使用)
   * 未來用於多裝置同步功能
   */
  lastSyncedAt?: string | null;
}
