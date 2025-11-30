/**
 * E2E 測試: User Story 2 - 標示完成狀態
 *
 * 測試範圍：
 * - 切換待辦事項從未完成到已完成
 * - 切換待辦事項從已完成到未完成
 * - 完成狀態的視覺回饋（刪除線、顏色變化）
 * - 完成狀態的持久化
 * - 多個待辦事項的獨立切換
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import App from '@/App.vue';
import { useTodosStore } from '@/stores/todos';

describe('User Story 2 - 標示完成狀態', () => {
  beforeEach(() => {
    // 建立新的 Pinia 實例
    setActivePinia(createPinia());

    // 清空 localStorage
    localStorage.clear();
  });

  /**
   * Acceptance Scenario 1:
   * Given 清單中有未完成的待辦事項
   * When 使用者點擊該事項的核取方塊
   * Then 該事項標記為已完成,顯示視覺回饋(如刪除線、變更顏色),並移動到已完成組別(清單下方)
   */
  describe('切換未完成到已完成', () => {
    it('should mark todo as completed when checkbox is clicked', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 新增一個待辦事項
      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      await input.setValue('購買蔬菜');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 找到核取方塊
      const checkbox = wrapper.find('input[type="checkbox"]');
      expect(checkbox.exists()).toBe(true);

      // 驗證初始狀態為未完成
      const store = useTodosStore();
      expect(store.todos[0].completed).toBe(false);

      // 點擊核取方塊
      await checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      // 驗證狀態已改變為完成
      expect(store.todos[0].completed).toBe(true);
    });

    it('should apply visual feedback (line-through) when completed', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 新增一個待辦事項
      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      await input.setValue('購買蔬菜');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 找到待辦事項文字元素（在未完成狀態時）
      let todoText = wrapper.find('span.flex-1');
      expect(todoText.exists()).toBe(true);
      expect(todoText.classes()).not.toContain('line-through');

      // 點擊核取方塊標記為完成
      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      // 驗證視覺樣式（刪除線）
      todoText = wrapper.find('span.flex-1');
      expect(todoText.classes()).toContain('line-through');
      expect(todoText.classes()).toContain('text-gray-500');
    });

    it('should move todo to completed section when marked as completed', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 新增一個待辦事項
      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      await input.setValue('購買蔬菜');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證「已完成」組別不存在
      let completedSection = wrapper.text();
      expect(completedSection).not.toContain('已完成');

      // 點擊核取方塊標記為完成
      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      // 驗證「已完成」組別出現
      completedSection = wrapper.text();
      expect(completedSection).toContain('已完成');

      // 驗證「進行中」組別消失（因為沒有未完成的項目）
      expect(completedSection).not.toContain('進行中');
    });
  });

  /**
   * Acceptance Scenario 2:
   * Given 清單中有已完成的待辦事項
   * When 使用者點擊該事項的核取方塊
   * Then 該事項標記為未完成,移除完成狀態的視覺樣式,並移動到未完成組別(清單上方)
   */
  describe('切換已完成到未完成', () => {
    it('should mark completed todo as uncompleted when checkbox is clicked', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 新增一個待辦事項並標記為完成
      const store = useTodosStore();
      const todo = store.addTodo('購買蔬菜');
      store.toggleTodo(todo.id);
      await wrapper.vm.$nextTick();

      // 驗證待辦事項已完成
      expect(store.todos[0].completed).toBe(true);

      // 找到核取方塊並點擊（切換回未完成）
      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      // 驗證狀態已改變回未完成
      expect(store.todos[0].completed).toBe(false);
    });

    it('should remove visual feedback when toggled back to uncompleted', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 新增一個待辦事項並標記為完成
      const store = useTodosStore();
      const todo = store.addTodo('購買蔬菜');
      store.toggleTodo(todo.id);
      await wrapper.vm.$nextTick();

      // 驗證刪除線樣式存在
      let todoText = wrapper.find('span.flex-1');
      expect(todoText.classes()).toContain('line-through');

      // 點擊核取方塊切換回未完成
      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      // 驗證刪除線樣式已移除
      todoText = wrapper.find('span.flex-1');
      expect(todoText.classes()).not.toContain('line-through');
      expect(todoText.classes()).not.toContain('text-gray-500');
    });

    it('should move todo back to active section when toggled to uncompleted', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 新增一個待辦事項並標記為完成
      const store = useTodosStore();
      const todo = store.addTodo('購買蔬菜');
      store.toggleTodo(todo.id);
      await wrapper.vm.$nextTick();

      // 驗證「已完成」組別存在
      let sections = wrapper.text();
      expect(sections).toContain('已完成');
      expect(sections).not.toContain('進行中');

      // 點擊核取方塊切換回未完成
      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      // 驗證「進行中」組別出現
      sections = wrapper.text();
      expect(sections).toContain('進行中');

      // 驗證「已完成」組別消失（因為沒有已完成的項目）
      expect(sections).not.toContain('已完成');
    });
  });

  /**
   * Acceptance Scenario 3:
   * Given 使用者標記了事項的完成狀態
   * When 使用者重新整理頁面
   * Then 事項的完成狀態與排序位置保持不變
   */
  describe('完成狀態持久化', () => {
    it('should persist completed status after page reload', async () => {
      // 第一個 wrapper: 新增並標記為完成
      const wrapper1 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper1.vm.$nextTick();

      const store1 = useTodosStore();
      const todo = store1.addTodo('購買蔬菜');
      store1.toggleTodo(todo.id);

      // 驗證已儲存到 localStorage
      const savedData = localStorage.getItem('todo-app-data');
      expect(savedData).toBeTruthy();
      const parsed = JSON.parse(savedData!);
      expect(parsed.todos[0].completed).toBe(true);

      // 模擬頁面重新載入: 建立新的 wrapper 與 store
      setActivePinia(createPinia());
      const wrapper2 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper2.vm.$nextTick();

      const store2 = useTodosStore();
      store2.loadTodos();

      // 驗證完成狀態保持不變
      expect(store2.todos).toHaveLength(1);
      expect(store2.todos[0].completed).toBe(true);

      // 驗證 UI 顯示正確
      const sections = wrapper2.text();
      expect(sections).toContain('已完成');
      expect(sections).toContain('購買蔬菜');
    });

    it('should maintain correct section grouping after reload', async () => {
      // 第一個 wrapper: 新增多個待辦事項
      const wrapper1 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper1.vm.$nextTick();

      const store1 = useTodosStore();
      const todo1 = store1.addTodo('任務 1');
      const _todo2 = store1.addTodo('任務 2');
      const todo3 = store1.addTodo('任務 3');

      // 標記部分為完成
      store1.toggleTodo(todo1.id);
      store1.toggleTodo(todo3.id);

      // 模擬頁面重新載入
      setActivePinia(createPinia());
      const wrapper2 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper2.vm.$nextTick();

      const store2 = useTodosStore();
      store2.loadTodos();

      // 驗證分組正確
      expect(store2.activeTodos).toHaveLength(1);
      expect(store2.completedTodos).toHaveLength(2);

      // 驗證 UI 顯示兩個組別
      const sections = wrapper2.text();
      expect(sections).toContain('進行中');
      expect(sections).toContain('已完成');
    });
  });

  /**
   * Acceptance Scenario 4:
   * Given 清單中有多個待辦事項
   * When 使用者切換其中一個事項的完成狀態
   * Then 只有該事項的狀態改變,其他事項不受影響
   */
  describe('獨立切換多個待辦事項', () => {
    it('should only toggle the specific todo without affecting others', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const store = useTodosStore();

      // 直接使用 store 新增待辦事項，並記錄 ID
      const todo1 = store.addTodo('任務 1');
      const todo2 = store.addTodo('任務 2');
      const todo3 = store.addTodo('任務 3');
      await wrapper.vm.$nextTick();

      expect(store.todos).toHaveLength(3);
      expect(store.todos.every((todo) => !todo.completed)).toBe(true);

      // 找到所有核取方塊（順序：任務3, 任務2, 任務1，因為按 createdAt 倒序）
      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      expect(checkboxes).toHaveLength(3);

      // 切換中間的待辦事項（任務 2）
      await checkboxes[1].trigger('change');
      await wrapper.vm.$nextTick();

      // 驗證只有任務 2 的狀態改變
      expect(store.todos.find((t) => t.id === todo1.id)!.completed).toBe(false); // 任務 1: 未完成
      expect(store.todos.find((t) => t.id === todo2.id)!.completed).toBe(true); // 任務 2: 已完成
      expect(store.todos.find((t) => t.id === todo3.id)!.completed).toBe(false); // 任務 3: 未完成
    });

    it('should maintain independent state when toggling multiple todos', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const store = useTodosStore();

      // 預先建立三個待辦事項
      const todo1 = store.addTodo('任務 1');
      const todo2 = store.addTodo('任務 2');
      const todo3 = store.addTodo('任務 3');
      await wrapper.vm.$nextTick();

      // 切換第一個和第三個為完成
      const checkboxes = wrapper.findAll('input[type="checkbox"]');

      await checkboxes[0].trigger('change');
      await wrapper.vm.$nextTick();

      await checkboxes[2].trigger('change');
      await wrapper.vm.$nextTick();

      // 驗證狀態正確
      expect(store.todos.find((t) => t.id === todo1.id)!.completed).toBe(true);
      expect(store.todos.find((t) => t.id === todo2.id)!.completed).toBe(false);
      expect(store.todos.find((t) => t.id === todo3.id)!.completed).toBe(true);

      // 驗證分組正確
      expect(store.activeTodos).toHaveLength(1);
      expect(store.completedTodos).toHaveLength(2);
    });
  });
});
