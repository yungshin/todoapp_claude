/**
 * E2E 測試: User Story 3 - 編輯待辦事項
 *
 * 測試範圍：
 * - 進入編輯模式
 * - 修改並儲存待辦事項
 * - 取消編輯
 * - 空白文字驗證
 * - 鍵盤快捷鍵 (Enter, ESC)
 * - 資料持久化
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import App from '@/App.vue';
import { useTodosStore } from '@/stores/todos';

describe('User Story 3 - 編輯待辦事項', () => {
  beforeEach(() => {
    // 建立新的 Pinia 實例
    setActivePinia(createPinia());

    // 清空 localStorage
    localStorage.clear();
  });

  /**
   * Acceptance Scenario 1:
   * Given 清單中有待辦事項
   * When 使用者點擊該事項的文字
   * Then 該事項進入編輯模式，顯示可編輯的輸入框並預先填入原有文字
   */
  describe('進入編輯模式', () => {
    it('should enter edit mode when clicking on todo text', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();

      // 新增一個待辦事項
      store.addTodo('測試待辦事項');
      await wrapper.vm.$nextTick();

      // 找到待辦事項文字並點擊
      const todoText = wrapper.find('[data-testid="todo-text"]');
      expect(todoText.exists()).toBe(true);

      await todoText.trigger('click');
      await wrapper.vm.$nextTick();

      // 應該顯示編輯輸入框
      const editInput = wrapper.find('[data-testid="edit-input"]');
      expect(editInput.exists()).toBe(true);

      // 輸入框應該預先填入原有文字
      expect((editInput.element as HTMLInputElement).value).toBe('測試待辦事項');
    });

    it('should show save and cancel buttons in edit mode', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('測試待辦事項');
      await wrapper.vm.$nextTick();

      // 進入編輯模式
      const todoText = wrapper.find('[data-testid="todo-text"]');
      await todoText.trigger('click');
      await wrapper.vm.$nextTick();

      // 應該顯示儲存和取消按鈕
      const saveButton = wrapper.find('[data-testid="save-button"]');
      const cancelButton = wrapper.find('[data-testid="cancel-button"]');

      expect(saveButton.exists()).toBe(true);
      expect(cancelButton.exists()).toBe(true);
      expect(saveButton.text()).toContain('儲存');
      expect(cancelButton.text()).toContain('取消');
    });
  });

  /**
   * Acceptance Scenario 2:
   * Given 待辦事項處於編輯模式
   * When 使用者修改文字並按下儲存(或 Enter 鍵)
   * Then 事項以新文字更新並退出編輯模式
   */
  describe('修改並儲存待辦事項', () => {
    it('should save changes when clicking save button', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('原始文字');
      await wrapper.vm.$nextTick();

      // 進入編輯模式
      const todoText = wrapper.find('[data-testid="todo-text"]');
      await todoText.trigger('click');
      await wrapper.vm.$nextTick();

      // 修改文字
      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('更新後的文字');

      // 點擊儲存按鈕
      const saveButton = wrapper.find('[data-testid="save-button"]');
      await saveButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 應該退出編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false);

      // 待辦事項文字應該已更新
      const updatedTodoText = wrapper.find('[data-testid="todo-text"]');
      expect(updatedTodoText.text()).toBe('更新後的文字');

      // Store 中的資料也應該更新
      expect(store.todos[0].text).toBe('更新後的文字');
    });

    it('should save changes when pressing Enter key', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('原始文字');
      await wrapper.vm.$nextTick();

      // 進入編輯模式
      const todoText = wrapper.find('[data-testid="todo-text"]');
      await todoText.trigger('click');
      await wrapper.vm.$nextTick();

      // 修改文字
      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('按Enter儲存');

      // 按下 Enter 鍵
      await editInput.trigger('keydown', { key: 'Enter' });
      await wrapper.vm.$nextTick();

      // 應該退出編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false);

      // 待辦事項文字應該已更新
      expect(wrapper.find('[data-testid="todo-text"]').text()).toBe('按Enter儲存');
    });

    it('should trim whitespace when saving', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('原始文字');
      await wrapper.vm.$nextTick();

      // 進入編輯模式
      await wrapper.find('[data-testid="todo-text"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 修改文字（包含空白）
      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('  修剪後的文字  ');

      // 儲存
      await wrapper.find('[data-testid="save-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 應該移除前後空白
      expect(store.todos[0].text).toBe('修剪後的文字');
    });
  });

  /**
   * Acceptance Scenario 3:
   * Given 待辦事項處於編輯模式
   * When 使用者按下取消(或 ESC 鍵)
   * Then 事項保持原有文字並退出編輯模式
   */
  describe('取消編輯', () => {
    it('should cancel edit and restore original text when clicking cancel button', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('原始文字');
      await wrapper.vm.$nextTick();

      // 進入編輯模式
      await wrapper.find('[data-testid="todo-text"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 修改文字（但不儲存）
      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('這些變更應該被取消');

      // 點擊取消按鈕
      const cancelButton = wrapper.find('[data-testid="cancel-button"]');
      await cancelButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 應該退出編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false);

      // 待辦事項文字應該保持原樣
      const todoText = wrapper.find('[data-testid="todo-text"]');
      expect(todoText.text()).toBe('原始文字');

      // Store 中的資料也應該保持原樣
      expect(store.todos[0].text).toBe('原始文字');
    });

    it('should cancel edit when pressing ESC key', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('原始文字');
      await wrapper.vm.$nextTick();

      // 進入編輯模式
      await wrapper.find('[data-testid="todo-text"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 修改文字（但不儲存）
      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('這些變更應該被取消');

      // 按下 ESC 鍵
      await editInput.trigger('keydown', { key: 'Escape' });
      await wrapper.vm.$nextTick();

      // 應該退出編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false);

      // 待辦事項文字應該保持原樣
      expect(wrapper.find('[data-testid="todo-text"]').text()).toBe('原始文字');
      expect(store.todos[0].text).toBe('原始文字');
    });
  });

  /**
   * Acceptance Scenario 4:
   * Given 待辦事項處於編輯模式
   * When 使用者清空文字並嘗試儲存
   * Then 顯示錯誤提示訊息「請輸入待辦事項內容」，不允許儲存空白內容
   */
  describe('空白文字驗證', () => {
    it('should show error when trying to save empty text', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('原始文字');
      await wrapper.vm.$nextTick();

      // 進入編輯模式
      await wrapper.find('[data-testid="todo-text"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 清空文字
      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('');

      // 嘗試儲存
      await wrapper.find('[data-testid="save-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 應該顯示錯誤訊息
      expect(wrapper.text()).toContain('請輸入待辦事項內容');

      // 應該保持在編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(true);

      // Store 中的資料應該保持原樣
      expect(store.todos[0].text).toBe('原始文字');
    });

    it('should show error when trying to save whitespace-only text', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('原始文字');
      await wrapper.vm.$nextTick();

      // 進入編輯模式
      await wrapper.find('[data-testid="todo-text"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 輸入只有空白的文字
      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('   ');

      // 嘗試儲存
      await wrapper.find('[data-testid="save-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 應該顯示錯誤訊息
      expect(wrapper.text()).toContain('請輸入待辦事項內容');

      // 應該保持在編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(true);

      // Store 中的資料應該保持原樣
      expect(store.todos[0].text).toBe('原始文字');
    });

    it('should clear error message when user starts typing again', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('原始文字');
      await wrapper.vm.$nextTick();

      // 進入編輯模式
      await wrapper.find('[data-testid="todo-text"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 清空文字並嘗試儲存
      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('');
      await wrapper.find('[data-testid="save-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 確認有錯誤訊息
      expect(wrapper.text()).toContain('請輸入待辦事項內容');

      // 重新輸入文字
      await editInput.setValue('新文字');
      await wrapper.vm.$nextTick();

      // 錯誤訊息應該消失
      expect(wrapper.text()).not.toContain('請輸入待辦事項內容');
    });
  });

  /**
   * 測試編輯功能的資料持久化
   */
  describe('資料持久化', () => {
    it('should persist edited todo to localStorage', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      store.addTodo('原始文字');
      await wrapper.vm.$nextTick();

      // 進入編輯模式並修改文字
      await wrapper.find('[data-testid="todo-text"]').trigger('click');
      await wrapper.vm.$nextTick();

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('已編輯的文字');
      await wrapper.find('[data-testid="save-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證 localStorage 中的資料
      const savedData = localStorage.getItem('todo-app-data');
      expect(savedData).toBeTruthy();

      const parsed = JSON.parse(savedData!);
      expect(parsed.todos[0].text).toBe('已編輯的文字');
    });

    it('should reload edited todo from localStorage', async () => {
      // 第一個應用實例：新增並編輯待辦事項
      const wrapper1 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store1 = useTodosStore();
      store1.addTodo('原始文字');
      await wrapper1.vm.$nextTick();

      // 編輯待辦事項
      await wrapper1.find('[data-testid="todo-text"]').trigger('click');
      await wrapper1.vm.$nextTick();

      const editInput = wrapper1.find('[data-testid="edit-input"]');
      await editInput.setValue('已編輯的文字');
      await wrapper1.find('[data-testid="save-button"]').trigger('click');
      await wrapper1.vm.$nextTick();

      wrapper1.unmount();

      // 第二個應用實例：重新載入
      setActivePinia(createPinia());
      const wrapper2 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store2 = useTodosStore();
      store2.loadTodos();
      await wrapper2.vm.$nextTick();

      // 驗證編輯後的文字已正確載入
      expect(store2.todos.length).toBe(1);
      expect(store2.todos[0].text).toBe('已編輯的文字');

      const todoText = wrapper2.find('[data-testid="todo-text"]');
      expect(todoText.text()).toBe('已編輯的文字');

      wrapper2.unmount();
    });
  });

  /**
   * 測試編輯已完成的待辦事項
   */
  describe('編輯已完成的待辦事項', () => {
    it('should allow editing completed todos', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      const todo = store.addTodo('已完成的待辦事項');
      store.toggleTodo(todo.id); // 標記為完成
      await wrapper.vm.$nextTick();

      // 應該能點擊進入編輯模式
      const todoText = wrapper.find('[data-testid="todo-text"]');
      await todoText.trigger('click');
      await wrapper.vm.$nextTick();

      // 應該顯示編輯輸入框
      const editInput = wrapper.find('[data-testid="edit-input"]');
      expect(editInput.exists()).toBe(true);
      expect((editInput.element as HTMLInputElement).value).toBe('已完成的待辦事項');
    });

    it('should maintain completed status after editing', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      const store = useTodosStore();
      const todo = store.addTodo('已完成的待辦事項');
      store.toggleTodo(todo.id); // 標記為完成
      await wrapper.vm.$nextTick();

      // 進入編輯模式並修改文字
      await wrapper.find('[data-testid="todo-text"]').trigger('click');
      await wrapper.vm.$nextTick();

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('更新完成項目的文字');
      await wrapper.find('[data-testid="save-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證文字已更新且完成狀態不變
      const updatedTodo = store.todos.find((t) => t.id === todo.id);
      expect(updatedTodo).toBeDefined();
      expect(updatedTodo!.text).toBe('更新完成項目的文字');
      expect(updatedTodo!.completed).toBe(true);
    });
  });
});
