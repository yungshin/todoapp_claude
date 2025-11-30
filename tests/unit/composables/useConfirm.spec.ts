import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useConfirm } from '@/composables/useConfirm';
import { useUiStore } from '@/stores/ui';

describe('useConfirm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('confirm', () => {
    it('should show confirm dialog with message', () => {
      const { confirm } = useConfirm();
      const uiStore = useUiStore();

      const message = '確定要刪除此待辦事項嗎?';
      confirm(message);

      expect(uiStore.confirmDialog.visible).toBe(true);
      expect(uiStore.confirmDialog.message).toBe(message);
    });

    it('should use default title and button texts', () => {
      const { confirm } = useConfirm();
      const uiStore = useUiStore();

      confirm('測試訊息');

      expect(uiStore.confirmDialog.title).toBe('確認');
      expect(uiStore.confirmDialog.confirmText).toBe('確認');
      expect(uiStore.confirmDialog.cancelText).toBe('取消');
    });

    it('should allow custom title and button texts', () => {
      const { confirm } = useConfirm();
      const uiStore = useUiStore();

      confirm('測試訊息', {
        title: '刪除確認',
        confirmText: '刪除',
        cancelText: '保留',
      });

      expect(uiStore.confirmDialog.title).toBe('刪除確認');
      expect(uiStore.confirmDialog.confirmText).toBe('刪除');
      expect(uiStore.confirmDialog.cancelText).toBe('保留');
    });

    it('should return a Promise that resolves when confirmed', async () => {
      const { confirm } = useConfirm();
      const uiStore = useUiStore();

      const promise = confirm('測試訊息');

      // 模擬使用者點擊確認
      if (uiStore.confirmDialog.onConfirm) {
        uiStore.confirmDialog.onConfirm();
      }

      await expect(promise).resolves.toBeUndefined();
      expect(uiStore.confirmDialog.visible).toBe(false);
    });

    it('should return a Promise that rejects when cancelled', async () => {
      const { confirm } = useConfirm();
      const uiStore = useUiStore();

      const promise = confirm('測試訊息');

      // 模擬使用者點擊取消
      if (uiStore.confirmDialog.onCancel) {
        uiStore.confirmDialog.onCancel();
      }

      await expect(promise).rejects.toBeUndefined();
      expect(uiStore.confirmDialog.visible).toBe(false);
    });

    it('should handle multiple sequential confirms', async () => {
      const { confirm } = useConfirm();
      const uiStore = useUiStore();

      // 第一次確認
      const promise1 = confirm('訊息 1');
      if (uiStore.confirmDialog.onConfirm) {
        uiStore.confirmDialog.onConfirm();
      }
      await promise1;

      // 第二次確認
      const promise2 = confirm('訊息 2');
      expect(uiStore.confirmDialog.visible).toBe(true);
      expect(uiStore.confirmDialog.message).toBe('訊息 2');

      if (uiStore.confirmDialog.onCancel) {
        uiStore.confirmDialog.onCancel();
      }
      await expect(promise2).rejects.toBeUndefined();
    });

    it('should handle empty message', () => {
      const { confirm } = useConfirm();
      const uiStore = useUiStore();

      confirm('');

      expect(uiStore.confirmDialog.visible).toBe(true);
      expect(uiStore.confirmDialog.message).toBe('');
    });
  });

  describe('integration with ui store', () => {
    it('should properly update ui store state', () => {
      const { confirm } = useConfirm();
      const uiStore = useUiStore();

      expect(uiStore.confirmDialog.visible).toBe(false);

      confirm('測試訊息');

      expect(uiStore.confirmDialog.visible).toBe(true);
      expect(uiStore.confirmDialog.message).toBe('測試訊息');
      expect(typeof uiStore.confirmDialog.onConfirm).toBe('function');
      expect(typeof uiStore.confirmDialog.onCancel).toBe('function');
    });
  });
});
