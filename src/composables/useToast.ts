import { useUiStore } from '@/stores/ui';
import type { ToastType } from '@/types/ui';

/**
 * useToast Composable
 * 提供簡化的 Toast 通知 API,封裝 UI store 的 Toast 邏輯
 * 支援 success, error, warning, info 四種類型的通知
 */
export function useToast() {
  const uiStore = useUiStore();

  /**
   * 顯示 Toast 通知
   * @param type - Toast 類型 (success, error, warning, info)
   * @param message - 顯示訊息
   * @param duration - 顯示時間(毫秒),預設 3000ms,0 表示不自動消失
   * @returns Toast ID
   *
   * @example
   * ```ts
   * const { toast } = useToast();
   * toast('success', '新增成功');
   * ```
   */
  function toast(
    type: ToastType,
    message: string,
    duration: number = 3000
  ): string {
    return uiStore.addToast(type, message, duration);
  }

  /**
   * 顯示成功訊息
   * @param message - 顯示訊息
   * @param duration - 顯示時間(毫秒),預設 3000ms
   * @returns Toast ID
   *
   * @example
   * ```ts
   * const { success } = useToast();
   * success('待辦事項新增成功');
   * ```
   */
  function success(message: string, duration: number = 3000): string {
    return toast('success', message, duration);
  }

  /**
   * 顯示錯誤訊息
   * @param message - 顯示訊息
   * @param duration - 顯示時間(毫秒),預設 3000ms
   * @returns Toast ID
   *
   * @example
   * ```ts
   * const { error } = useToast();
   * error('儲存失敗,請稍後再試');
   * ```
   */
  function error(message: string, duration: number = 3000): string {
    return toast('error', message, duration);
  }

  /**
   * 顯示警告訊息
   * @param message - 顯示訊息
   * @param duration - 顯示時間(毫秒),預設 3000ms
   * @returns Toast ID
   *
   * @example
   * ```ts
   * const { warning } = useToast();
   * warning('請輸入待辦事項內容');
   * ```
   */
  function warning(message: string, duration: number = 3000): string {
    return toast('warning', message, duration);
  }

  /**
   * 顯示資訊訊息
   * @param message - 顯示訊息
   * @param duration - 顯示時間(毫秒),預設 3000ms
   * @returns Toast ID
   *
   * @example
   * ```ts
   * const { info } = useToast();
   * info('目前沒有待辦事項');
   * ```
   */
  function info(message: string, duration: number = 3000): string {
    return toast('info', message, duration);
  }

  /**
   * 移除指定的 Toast 通知
   * @param id - Toast ID
   *
   * @example
   * ```ts
   * const { success, remove } = useToast();
   * const id = success('操作成功');
   * // 需要時可以手動移除
   * remove(id);
   * ```
   */
  function remove(id: string): void {
    uiStore.removeToast(id);
  }

  /**
   * 清除所有 Toast 通知
   *
   * @example
   * ```ts
   * const { clear } = useToast();
   * clear(); // 清除所有通知
   * ```
   */
  function clear(): void {
    uiStore.clearToasts();
  }

  return {
    toast,
    success,
    error,
    warning,
    info,
    remove,
    clear,
  };
}
