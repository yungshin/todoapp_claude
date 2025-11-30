import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ConfirmDialog, Toast, ToastType, LoadingState } from '@/types/ui';
import { generateId } from '@/utils/helpers';

/**
 * UI Store
 * 管理應用程式的 UI 狀態,包含確認對話框、Toast 通知與載入狀態
 */
export const useUiStore = defineStore('ui', () => {
  // State: 確認對話框
  const confirmDialog = ref<ConfirmDialog>({
    visible: false,
    message: '',
    title: '確認',
    confirmText: '確認',
    cancelText: '取消',
  });

  // State: Toast 通知清單
  const toasts = ref<Toast[]>([]);

  // State: 載入狀態
  const loadingState = ref<LoadingState>({
    isLoading: false,
    message: undefined,
  });

  // Actions
  /**
   * 顯示確認對話框
   * @param options - 對話框選項
   * @returns void
   */
  function showConfirm(options: {
    message: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }): void {
    confirmDialog.value = {
      visible: true,
      message: options.message,
      title: options.title || '確認',
      confirmText: options.confirmText || '確認',
      cancelText: options.cancelText || '取消',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    };
  }

  /**
   * 隱藏確認對話框
   */
  function hideConfirm(): void {
    confirmDialog.value = {
      visible: false,
      message: '',
      title: '確認',
      confirmText: '確認',
      cancelText: '取消',
    };
  }

  /**
   * 新增 Toast 通知
   * @param type - Toast 類型 (success, error, warning, info)
   * @param message - 顯示訊息
   * @param duration - 顯示時間(毫秒),預設 3000ms,0 表示不自動消失
   * @returns Toast ID
   */
  function addToast(
    type: ToastType,
    message: string,
    duration: number = 3000
  ): string {
    const toast: Toast = {
      id: generateId(),
      type,
      message,
      duration,
      createdAt: Date.now(),
    };

    toasts.value.push(toast);

    // 如果設定了 duration,自動移除
    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast.id);
      }, duration);
    }

    return toast.id;
  }

  /**
   * 移除 Toast 通知
   * @param id - Toast ID
   */
  function removeToast(id: string): void {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }

  /**
   * 清除所有 Toast 通知
   */
  function clearToasts(): void {
    toasts.value = [];
  }

  /**
   * 設定載入狀態
   * @param isLoading - 是否正在載入
   * @param message - 載入訊息(可選)
   */
  function setLoading(isLoading: boolean, message?: string): void {
    loadingState.value = {
      isLoading,
      message,
    };
  }

  return {
    // State
    confirmDialog,
    toasts,
    loadingState,

    // Actions
    showConfirm,
    hideConfirm,
    addToast,
    removeToast,
    clearToasts,
    setLoading,
  };
});
