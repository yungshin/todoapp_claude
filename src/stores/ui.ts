import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ConfirmDialog } from '@/types/ui';

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

  return {
    // State
    confirmDialog,

    // Actions
    showConfirm,
    hideConfirm,
  };
});
