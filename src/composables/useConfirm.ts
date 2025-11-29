import { useUiStore } from '@/stores/ui';

/**
 * useConfirm Composable
 * 提供簡化的確認對話框 API,封裝 UI store 的確認對話框邏輯
 * 回傳 Promise 以支援 async/await 語法
 */
export function useConfirm() {
  const uiStore = useUiStore();

  /**
   * 顯示確認對話框並等待使用者回應
   * @param message - 對話框訊息
   * @param options - 可選的對話框選項 (title, confirmText, cancelText)
   * @returns Promise<void> - 確認時 resolve,取消時 reject
   *
   * @example
   * ```ts
   * const { confirm } = useConfirm();
   *
   * try {
   *   await confirm('確定要刪除此待辦事項嗎?');
   *   // 使用者點擊確認
   *   deleteTodo(id);
   * } catch {
   *   // 使用者點擊取消
   *   console.log('取消刪除');
   * }
   * ```
   */
  function confirm(
    message: string,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
    },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      uiStore.showConfirm({
        message,
        title: options?.title,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        onConfirm: () => {
          uiStore.hideConfirm();
          resolve();
        },
        onCancel: () => {
          uiStore.hideConfirm();
          reject();
        },
      });
    });
  }

  return {
    confirm,
  };
}
