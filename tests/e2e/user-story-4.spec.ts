/**
 * E2E 測試: User Story 4 - 刪除待辦事項
 *
 * 測試範圍：
 * - 點擊刪除按鈕觸發確認對話框
 * - 確認刪除功能
 * - 取消刪除功能  
 * - 資料持久化
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import App from '@/App.vue';
import { useTodosStore } from '@/stores/todos';
import { useUiStore } from '@/stores/ui';

describe('User Story 4 - 刪除待辦事項', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  /**
   * Scenario 1: 點擊刪除按鈕顯示確認對話框
   */
  describe('顯示確認對話框', () => {
    it('should show confirm dialog when clicking delete button', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      const uiStore = useUiStore();

      store.addTodo('測試待辦事項');
      await wrapper.vm.$nextTick();

      // 點擊刪除按鈕
      const deleteButton = wrapper.find('[data-testid="delete-button"]');
      await deleteButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 應該顯示確認對話框
      expect(uiStore.confirmDialog.visible).toBe(true);
      expect(uiStore.confirmDialog.message).toBe('確定要刪除此待辦事項嗎?');
      expect(uiStore.confirmDialog.title).toBe('刪除確認');
      expect(uiStore.confirmDialog.confirmText).toBe('刪除');
      expect(uiStore.confirmDialog.cancelText).toBe('取消');

      wrapper.unmount();
    });
  });

  /**
   * Scenario 2: 確認刪除
   */
  describe('確認刪除', () => {
    it('should delete todo when confirming', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      const uiStore = useUiStore();

      store.addTodo('待刪除的待辦事項');
      await wrapper.vm.$nextTick();

      expect(store.todos.length).toBe(1);

      // 點擊刪除按鈕
      await wrapper.find('[data-testid="delete-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 模擬使用者點擊確認按鈕
      if (uiStore.confirmDialog.onConfirm) {
        uiStore.confirmDialog.onConfirm();
      }
      await wrapper.vm.$nextTick();

      // 待辦事項應該被刪除
      expect(store.todos.length).toBe(0);
      expect(uiStore.confirmDialog.visible).toBe(false);

      wrapper.unmount();
    });

    it('should remove todo from DOM after deletion', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      const uiStore = useUiStore();

      store.addTodo('待刪除的待辦事項');
      await wrapper.vm.$nextTick();

      // 驗證待辦事項存在於 DOM
      expect(wrapper.find('[data-testid="todo-text"]').exists()).toBe(true);

      // 刪除待辦事項
      await wrapper.find('[data-testid="delete-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      if (uiStore.confirmDialog.onConfirm) {
        uiStore.confirmDialog.onConfirm();
      }
      await wrapper.vm.$nextTick();
      // 再等待一次以確保 DOM 完全更新
      await wrapper.vm.$nextTick();

      // 待辦事項應該不存在於 DOM
      expect(wrapper.find('[data-testid="todo-text"]').exists()).toBe(false);

      wrapper.unmount();
    });
  });

  /**
   * Scenario 3: 取消刪除
   */
  describe('取消刪除', () => {
    it('should keep todo when cancelling deletion', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      const uiStore = useUiStore();

      store.addTodo('不會被刪除的待辦事項');
      await wrapper.vm.$nextTick();

      const originalTodoCount = store.todos.length;

      // 點擊刪除按鈕
      await wrapper.find('[data-testid="delete-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 模擬使用者點擊取消按鈕
      if (uiStore.confirmDialog.onCancel) {
        uiStore.confirmDialog.onCancel();
      }
      await wrapper.vm.$nextTick();

      // 待辦事項應該保留
      expect(store.todos.length).toBe(originalTodoCount);
      expect(store.todos[0].text).toBe('不會被刪除的待辦事項');
      expect(uiStore.confirmDialog.visible).toBe(false);

      wrapper.unmount();
    });
  });

  /**
   * Scenario 4: 資料持久化
   */
  describe('資料持久化', () => {
    it('should persist deletion to localStorage', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();

      const todo1 = store.addTodo('待刪除的待辦事項');
      store.addTodo('保留的待辦事項');
      await wrapper.vm.$nextTick();

      expect(store.todos.length).toBe(2);

      // 直接從 store 刪除指定的待辦事項
      store.deleteTodo(todo1.id);
      await wrapper.vm.$nextTick();

      // 驗證 localStorage
      const savedData = localStorage.getItem('todo-app-data');
      expect(savedData).toBeTruthy();

      const parsed = JSON.parse(savedData!);
      expect(parsed.todos.length).toBe(1);
      expect(parsed.todos[0].text).toBe('保留的待辦事項');

      wrapper.unmount();
    });

    it('should not reload deleted todo from localStorage', async () => {
      // 第一個應用實例
      const wrapper1 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store1 = useTodosStore();

      const todo1 = store1.addTodo('待刪除的待辦事項');
      store1.addTodo('保留的待辦事項');
      await wrapper1.vm.$nextTick();

      // 直接從 store 刪除指定的待辦事項
      store1.deleteTodo(todo1.id);
      await wrapper1.vm.$nextTick();

      wrapper1.unmount();

      // 第二個應用實例
      setActivePinia(createPinia());
      const wrapper2 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store2 = useTodosStore();
      store2.loadTodos();
      await wrapper2.vm.$nextTick();

      // 驗證只剩下保留的待辦事項
      expect(store2.todos.length).toBe(1);
      expect(store2.todos[0].text).toBe('保留的待辦事項');

      wrapper2.unmount();
    });
  });

  /**
   * 測試刪除已完成的待辦事項
   */
  describe('刪除已完成的待辦事項', () => {
    it('should allow deleting completed todos', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      const uiStore = useUiStore();

      const todo = store.addTodo('已完成的待辦事項');
      store.toggleTodo(todo.id);
      await wrapper.vm.$nextTick();

      expect(store.completedTodos.length).toBe(1);

      // 刪除
      const deleteButton = wrapper.find('[data-testid="delete-button"]');
      await deleteButton.trigger('click');
      await wrapper.vm.$nextTick();

      if (uiStore.confirmDialog.onConfirm) {
        uiStore.confirmDialog.onConfirm();
      }
      await wrapper.vm.$nextTick();

      expect(store.todos.length).toBe(0);
      expect(store.completedTodos.length).toBe(0);

      wrapper.unmount();
    });
  });

  /**
   * 測試刪除多個待辦事項
   */
  describe('刪除多個待辦事項', () => {
    it('should delete correct todo when multiple todos exist', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      const uiStore = useUiStore();

      store.addTodo('待辦事項 1');
      store.addTodo('待辦事項 2');
      store.addTodo('待辦事項 3');
      await wrapper.vm.$nextTick();

      // 刪除中間的待辦事項
      const deleteButtons = wrapper.findAll('[data-testid="delete-button"]');
      await deleteButtons[1].trigger('click');
      await wrapper.vm.$nextTick();

      if (uiStore.confirmDialog.onConfirm) {
        uiStore.confirmDialog.onConfirm();
      }
      await wrapper.vm.$nextTick();

      // 驗證正確的待辦事項被刪除
      expect(store.todos.length).toBe(2);

      wrapper.unmount();
    });
  });
});
