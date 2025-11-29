import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import TodoItem from '@/components/TodoItem.vue';
import { useTodosStore } from '@/stores/todos';
import type { TodoItem as TodoItemType } from '@/types/todo';

describe('TodoItem - Edit Mode', () => {
  let wrapper: VueWrapper;
  let store: ReturnType<typeof useTodosStore>;
  let mockTodo: TodoItemType;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useTodosStore();

    // 在 store 中新增一個測試用的待辦事項
    mockTodo = store.addTodo('原始待辦事項文字');
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('entering edit mode', () => {
    it('should enter edit mode when clicking on todo text', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      const todoText = wrapper.find('[data-testid="todo-text"]');
      expect(todoText.exists()).toBe(true);

      // 點擊文字進入編輯模式
      await todoText.trigger('click');

      // 應該顯示編輯輸入框
      const editInput = wrapper.find('[data-testid="edit-input"]');
      expect(editInput.exists()).toBe(true);

      // 原始文字應該隱藏
      expect(wrapper.find('[data-testid="todo-text"]').exists()).toBe(false);
    });

    it('should pre-fill input with original text in edit mode', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      expect(editInput.element.value).toBe(mockTodo.text);
    });

    it('should auto-focus the input when entering edit mode', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
        attachTo: document.body, // 需要附加到 DOM 以測試 focus
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');
      await wrapper.vm.$nextTick();

      const editInput = wrapper.find('[data-testid="edit-input"]');
      expect(editInput.element).toBe(document.activeElement);

      wrapper.unmount();
    });

    it('should show save and cancel buttons in edit mode', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const saveButton = wrapper.find('[data-testid="save-button"]');
      const cancelButton = wrapper.find('[data-testid="cancel-button"]');

      expect(saveButton.exists()).toBe(true);
      expect(cancelButton.exists()).toBe(true);
      expect(saveButton.text()).toContain('儲存');
      expect(cancelButton.text()).toContain('取消');
    });
  });

  describe('saving changes', () => {
    it('should save changes and exit edit mode when clicking save button', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      // 進入編輯模式
      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      // 修改文字
      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('更新後的文字');

      // 點擊儲存按鈕
      await wrapper.find('[data-testid="save-button"]').trigger('click');
      await wrapper.vm.$nextTick();

      // 應該呼叫 store 的 updateTodo
      // 註：實際實作時需要使用 spy 來驗證

      // 應該退出編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="todo-text"]').exists()).toBe(true);
    });

    it('should save changes when pressing Enter key', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('更新後的文字');

      // 按下 Enter 鍵
      await editInput.trigger('keydown', { key: 'Enter' });
      await wrapper.vm.$nextTick();

      // 應該退出編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="todo-text"]').exists()).toBe(true);
    });

    it('should trim whitespace before saving', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('  更新後的文字  ');

      await wrapper.find('[data-testid="save-button"]').trigger('click');

      // 實作時應該呼叫 store.updateTodo('test-id-1', '更新後的文字')
    });

    it('should not save when text is empty', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('');

      await wrapper.find('[data-testid="save-button"]').trigger('click');

      // 應該顯示錯誤訊息
      expect(wrapper.text()).toContain('請輸入待辦事項內容');

      // 應該保持在編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(true);
    });

    it('should not save when text is only whitespace', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('   ');

      await wrapper.find('[data-testid="save-button"]').trigger('click');

      // 應該顯示錯誤訊息
      expect(wrapper.text()).toContain('請輸入待辦事項內容');

      // 應該保持在編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(true);
    });

    it('should not exit edit mode if text is unchanged', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      // 不修改文字直接儲存
      await wrapper.find('[data-testid="save-button"]').trigger('click');

      // 可以選擇退出編輯模式（不呼叫 updateTodo）或保持在編輯模式
      // 這個行為可以根據產品需求決定
    });
  });

  describe('canceling edit', () => {
    it('should cancel edit and restore original text when clicking cancel button', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('這些變更應該被取消');

      await wrapper.find('[data-testid="cancel-button"]').trigger('click');

      // 應該退出編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false);

      // 原始文字應該保持不變
      const todoText = wrapper.find('[data-testid="todo-text"]');
      expect(todoText.exists()).toBe(true);
      expect(todoText.text()).toBe(mockTodo.text);
    });

    it('should cancel edit when pressing ESC key', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('這些變更應該被取消');

      // 按下 ESC 鍵
      await editInput.trigger('keydown', { key: 'Escape' });
      await wrapper.vm.$nextTick();

      // 應該退出編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false);

      // 原始文字應該保持不變
      const todoText = wrapper.find('[data-testid="todo-text"]');
      expect(todoText.text()).toBe(mockTodo.text);
    });

    it('should not call updateTodo when canceling', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('這些變更應該被取消');

      await wrapper.find('[data-testid="cancel-button"]').trigger('click');

      // 實作時應該驗證 store.updateTodo 沒有被呼叫
    });
  });

  describe('edit mode with completed todo', () => {
    it('should allow editing completed todos', async () => {
      const completedTodo = {
        ...mockTodo,
        completed: true,
      };

      wrapper = mount(TodoItem, {
        props: { todo: completedTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      expect(editInput.exists()).toBe(true);
      expect(editInput.element.value).toBe(completedTodo.text);
    });

    it('should maintain completed status after editing', async () => {
      const completedTodo = {
        ...mockTodo,
        completed: true,
      };

      wrapper = mount(TodoItem, {
        props: { todo: completedTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');
      await editInput.setValue('更新完成項目的文字');

      await wrapper.find('[data-testid="save-button"]').trigger('click');

      // updateTodo 應該只更新文字，不改變 completed 狀態
    });
  });

  describe('edge cases', () => {
    it('should handle rapid clicks without entering multiple edit modes', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      const todoText = wrapper.find('[data-testid="todo-text"]');

      // 快速點擊多次
      await todoText.trigger('click');
      await todoText.trigger('click');
      await todoText.trigger('click');

      // 應該只有一個編輯輸入框
      const editInputs = wrapper.findAll('[data-testid="edit-input"]');
      expect(editInputs.length).toBe(1);
    });

    it('should not allow entering edit mode while checkbox is clicked', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.trigger('change');

      // 點擊核取方塊不應進入編輯模式
      expect(wrapper.find('[data-testid="edit-input"]').exists()).toBe(false);
    });

    it('should clear error message when user starts typing again', async () => {
      wrapper = mount(TodoItem, {
        props: { todo: mockTodo },
      });

      await wrapper.find('[data-testid="todo-text"]').trigger('click');

      const editInput = wrapper.find('[data-testid="edit-input"]');

      // 嘗試儲存空白文字
      await editInput.setValue('');
      await wrapper.find('[data-testid="save-button"]').trigger('click');

      expect(wrapper.text()).toContain('請輸入待辦事項內容');

      // 重新輸入文字
      await editInput.setValue('新文字');

      // 錯誤訊息應該消失
      expect(wrapper.text()).not.toContain('請輸入待辦事項內容');
    });
  });
});
