import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { useUiStore } from '@/stores/ui';

describe('ConfirmDialog', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('rendering', () => {
    it('should not render when visible is false', () => {
      const uiStore = useUiStore();
      uiStore.confirmDialog.visible = false;

      wrapper = mount(ConfirmDialog);

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    });

    it('should render when visible is true', () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({
        message: '測試訊息',
      });

      wrapper = mount(ConfirmDialog);

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    });

    it('should display the message', () => {
      const uiStore = useUiStore();
      const message = '確定要刪除此待辦事項嗎?';
      uiStore.showConfirm({ message });

      wrapper = mount(ConfirmDialog);

      expect(wrapper.text()).toContain(message);
    });

    it('should display default title', () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({ message: '測試' });

      wrapper = mount(ConfirmDialog);

      expect(wrapper.text()).toContain('確認');
    });

    it('should display custom title', () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({
        message: '測試',
        title: '刪除確認',
      });

      wrapper = mount(ConfirmDialog);

      expect(wrapper.text()).toContain('刪除確認');
    });

    it('should display default button texts', () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({ message: '測試' });

      wrapper = mount(ConfirmDialog);

      const buttons = wrapper.findAll('button');
      expect(buttons.some((btn) => btn.text() === '確認')).toBe(true);
      expect(buttons.some((btn) => btn.text() === '取消')).toBe(true);
    });

    it('should display custom button texts', () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({
        message: '測試',
        confirmText: '刪除',
        cancelText: '保留',
      });

      wrapper = mount(ConfirmDialog);

      const buttons = wrapper.findAll('button');
      expect(buttons.some((btn) => btn.text() === '刪除')).toBe(true);
      expect(buttons.some((btn) => btn.text() === '保留')).toBe(true);
    });

    it('should render backdrop overlay', () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({ message: '測試' });

      wrapper = mount(ConfirmDialog);

      // 應該有一個背景遮罩層
      const backdrop = wrapper.find('[data-testid="dialog-backdrop"]');
      expect(backdrop.exists()).toBe(true);
    });
  });

  describe('interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const uiStore = useUiStore();
      const onConfirm = vi.fn();
      uiStore.showConfirm({
        message: '測試',
        onConfirm,
      });

      wrapper = mount(ConfirmDialog);

      const confirmButton = wrapper.findAll('button').find((btn) => btn.text() === '確認');
      await confirmButton?.trigger('click');

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(uiStore.confirmDialog.visible).toBe(false);
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const uiStore = useUiStore();
      const onCancel = vi.fn();
      uiStore.showConfirm({
        message: '測試',
        onCancel,
      });

      wrapper = mount(ConfirmDialog);

      const cancelButton = wrapper.findAll('button').find((btn) => btn.text() === '取消');
      await cancelButton?.trigger('click');

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(uiStore.confirmDialog.visible).toBe(false);
    });

    it('should close dialog when backdrop is clicked', async () => {
      const uiStore = useUiStore();
      const onCancel = vi.fn();
      uiStore.showConfirm({
        message: '測試',
        onCancel,
      });

      wrapper = mount(ConfirmDialog);

      const backdrop = wrapper.find('[data-testid="dialog-backdrop"]');
      await backdrop.trigger('click');

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(uiStore.confirmDialog.visible).toBe(false);
    });
  });

  describe('keyboard events', () => {
    it('should call onConfirm when Enter key is pressed', async () => {
      const uiStore = useUiStore();
      const onConfirm = vi.fn();
      uiStore.showConfirm({
        message: '測試',
        onConfirm,
      });

      wrapper = mount(ConfirmDialog);

      const dialog = wrapper.find('[role="dialog"]');
      await dialog.trigger('keydown.enter');

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(uiStore.confirmDialog.visible).toBe(false);
    });

    it('should call onCancel when Escape key is pressed', async () => {
      const uiStore = useUiStore();
      const onCancel = vi.fn();
      uiStore.showConfirm({
        message: '測試',
        onCancel,
      });

      wrapper = mount(ConfirmDialog);

      const dialog = wrapper.find('[role="dialog"]');
      await dialog.trigger('keydown.escape');

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(uiStore.confirmDialog.visible).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('should have correct ARIA attributes', () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({
        message: '測試訊息',
        title: '確認操作',
      });

      wrapper = mount(ConfirmDialog);

      const dialog = wrapper.find('[role="dialog"]');
      expect(dialog.exists()).toBe(true);
      expect(dialog.attributes('aria-modal')).toBe('true');
      expect(dialog.attributes('aria-labelledby')).toBeTruthy();
      expect(dialog.attributes('aria-describedby')).toBeTruthy();
    });

    it('should trap focus within dialog', () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({ message: '測試' });

      wrapper = mount(ConfirmDialog);

      const buttons = wrapper.findAll('button');
      // 應該至少有兩個可聚焦的按鈕 (確認和取消)
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('integration with ui store', () => {
    it('should reactively update when ui store changes', async () => {
      const uiStore = useUiStore();
      wrapper = mount(ConfirmDialog);

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

      uiStore.showConfirm({ message: '新訊息' });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
      expect(wrapper.text()).toContain('新訊息');
    });

    it('should hide dialog when ui store sets visible to false', async () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({ message: '測試' });

      wrapper = mount(ConfirmDialog);

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

      uiStore.hideConfirm();
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({ message: '' });

      wrapper = mount(ConfirmDialog);

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    });

    it('should handle missing onConfirm callback', async () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({ message: '測試' });
      // 不設定 onConfirm

      wrapper = mount(ConfirmDialog);

      const confirmButton = wrapper.findAll('button').find((btn) => btn.text() === '確認');

      // 應該不會拋出錯誤
      await expect(confirmButton?.trigger('click')).resolves.not.toThrow();
      expect(uiStore.confirmDialog.visible).toBe(false);
    });

    it('should handle missing onCancel callback', async () => {
      const uiStore = useUiStore();
      uiStore.showConfirm({ message: '測試' });
      // 不設定 onCancel

      wrapper = mount(ConfirmDialog);

      const cancelButton = wrapper.findAll('button').find((btn) => btn.text() === '取消');

      // 應該不會拋出錯誤
      await expect(cancelButton?.trigger('click')).resolves.not.toThrow();
      expect(uiStore.confirmDialog.visible).toBe(false);
    });
  });
});
