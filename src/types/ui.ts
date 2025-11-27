/**
 * UI 相關型別定義
 * 用於管理應用程式的 UI 狀態,包含 Toast 通知、確認對話框與載入狀態
 */

/**
 * Toast 通知訊息型別
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast 通知介面
 */
export interface Toast {
  /**
   * 唯一識別碼
   * 使用 crypto.randomUUID() 生成
   */
  id: string;

  /**
   * Toast 類型
   * success: 成功 (綠色)
   * error: 錯誤 (紅色)
   * warning: 警告 (黃色)
   * info: 資訊 (藍色)
   */
  type: ToastType;

  /**
   * 顯示訊息
   */
  message: string;

  /**
   * 顯示時間 (毫秒)
   * 預設 3000ms (3秒)
   * 0 表示不自動消失
   */
  duration?: number;

  /**
   * 建立時間戳記
   * Unix milliseconds (Date.now())
   */
  createdAt: number;
}

/**
 * 確認對話框介面
 */
export interface ConfirmDialog {
  /**
   * 是否顯示對話框
   */
  visible: boolean;

  /**
   * 對話框標題
   * 預設為 '確認'
   */
  title?: string;

  /**
   * 對話框訊息內容
   */
  message: string;

  /**
   * 確認按鈕文字
   * 預設為 '確認'
   */
  confirmText?: string;

  /**
   * 取消按鈕文字
   * 預設為 '取消'
   */
  cancelText?: string;

  /**
   * 確認回調函式
   * 使用者點擊確認按鈕時執行
   */
  onConfirm?: () => void;

  /**
   * 取消回調函式
   * 使用者點擊取消按鈕或按 ESC 時執行
   */
  onCancel?: () => void;
}

/**
 * 載入狀態介面
 */
export interface LoadingState {
  /**
   * 是否正在載入
   */
  isLoading: boolean;

  /**
   * 載入訊息 (可選)
   * 例如: '載入中...', '儲存中...'
   */
  message?: string;
}
