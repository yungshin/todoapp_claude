import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import TodoInput from '@/components/TodoInput.vue';
import { useTodosStore } from '@/stores/todos';

describe('TodoInput', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('rendering', () => {
    it('should render input field and submit button', () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input[type="text"]');
      const button = wrapper.find('button');

      expect(input.exists()).toBe(true);
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe('新增');
    });

    it('should have placeholder text', () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('輸入待辦事項...');
    });

    it('should have maxlength attribute set to 500', () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      expect(input.attributes('maxlength')).toBe('500');
    });

    it('should display character count', () => {
      wrapper = mount(TodoInput);

      const charCount = wrapper.find('.text-sm');
      expect(charCount.text()).toContain('0/500 字元');
    });
  });

  describe('input handling', () => {
    it('should update character count when typing', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      await input.setValue('測試文字');

      const charCount = wrapper.find('.text-sm');
      expect(charCount.text()).toContain('4/500 字元');
    });

    it('should show warning color when approaching limit (>= 450 chars)', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      const text = 'a'.repeat(450);
      await input.setValue(text);

      const charCount = wrapper.find('.text-sm span');
      expect(charCount.classes()).toContain('text-orange-500');
    });

    it('should show error color when at limit (500 chars)', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      const text = 'a'.repeat(500);
      await input.setValue(text);

      const charCount = wrapper.find('.text-sm span');
      expect(charCount.classes()).toContain('text-red-500');
    });

    it('should show "已達字數上限" message when at 500 chars', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      await input.setValue('a'.repeat(500));

      expect(wrapper.text()).toContain('已達字數上限');
    });

    it('should not show "已達字數上限" message when below 500 chars', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      await input.setValue('a'.repeat(499));

      expect(wrapper.text()).not.toContain('已達字數上限');
    });
  });

  describe('form submission', () => {
    it('should add todo when form is submitted with valid input', async () => {
      wrapper = mount(TodoInput);
      const store = useTodosStore();
      const addTodoSpy = vi.spyOn(store, 'addTodo');

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      await input.setValue('新的待辦事項');
      await button.trigger('click');

      expect(addTodoSpy).toHaveBeenCalledWith('新的待辦事項');
      expect(addTodoSpy).toHaveBeenCalledTimes(1);
    });

    it('should clear input after successful submission', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      await input.setValue('測試任務');
      await button.trigger('click');

      expect((input.element as HTMLInputElement).value).toBe('');
    });

    it('should reset character count after submission', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      await input.setValue('測試任務');
      await button.trigger('click');

      const charCount = wrapper.find('.text-sm');
      expect(charCount.text()).toContain('0/500 字元');
    });

    it('should trim whitespace before adding todo', async () => {
      wrapper = mount(TodoInput);
      const store = useTodosStore();
      const addTodoSpy = vi.spyOn(store, 'addTodo');

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      await input.setValue('  測試任務  ');
      await button.trigger('click');

      expect(addTodoSpy).toHaveBeenCalledWith('  測試任務  ');
    });

    it('should submit on Enter key press', async () => {
      wrapper = mount(TodoInput);
      const store = useTodosStore();
      const addTodoSpy = vi.spyOn(store, 'addTodo');

      const input = wrapper.find('input');

      await input.setValue('測試任務');
      await input.trigger('keydown.enter');

      expect(addTodoSpy).toHaveBeenCalledWith('測試任務');
    });
  });

  describe('validation', () => {
    it('should disable button for empty input', async () => {
      wrapper = mount(TodoInput);

      const button = wrapper.find('button');

      // 按鈕應該被停用（因為輸入框為空）
      expect((button.element as HTMLButtonElement).disabled).toBe(true);
    });

    it('should disable button for whitespace-only input', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      await input.setValue('   ');

      // 按鈕應該被停用（因為 trim 後為空）
      expect((button.element as HTMLButtonElement).disabled).toBe(true);
    });

    it('should enable button when valid input is entered', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      // 初始狀態：按鈕被停用
      expect((button.element as HTMLButtonElement).disabled).toBe(true);

      // 輸入有效文字後，按鈕應該啟用
      await input.setValue('有效的待辦事項');
      expect((button.element as HTMLButtonElement).disabled).toBe(false);
    });

    it('should not add todo when input is empty', async () => {
      wrapper = mount(TodoInput);
      const store = useTodosStore();
      const addTodoSpy = vi.spyOn(store, 'addTodo');

      const button = wrapper.find('button');
      await button.trigger('click');

      expect(addTodoSpy).not.toHaveBeenCalled();
    });

    it('should not add todo when input is whitespace only', async () => {
      wrapper = mount(TodoInput);
      const store = useTodosStore();
      const addTodoSpy = vi.spyOn(store, 'addTodo');

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      await input.setValue('   ');
      await button.trigger('click');

      expect(addTodoSpy).not.toHaveBeenCalled();
    });
  });

  describe('button states', () => {
    it('should disable button when input is empty', async () => {
      wrapper = mount(TodoInput);

      const button = wrapper.find('button');
      // 按鈕應該被停用
      expect((button.element as HTMLButtonElement).disabled).toBe(true);
    });

    it('should disable button when input is whitespace only', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      await input.setValue('   ');

      const button = wrapper.find('button');
      // 按鈕應該被停用
      expect((button.element as HTMLButtonElement).disabled).toBe(true);
    });

    it('should enable submit button when input has valid text', async () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      await input.setValue('有效的待辦事項');

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeUndefined();
    });

    it('should show disabled cursor style when button is disabled', async () => {
      wrapper = mount(TodoInput);

      const button = wrapper.find('button');
      expect(button.classes()).toContain('disabled:cursor-not-allowed');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on input', () => {
      wrapper = mount(TodoInput);

      const input = wrapper.find('input');
      expect(input.attributes('aria-label')).toBe('新增待辦事項輸入框');
    });

    it('should have accessible button text', () => {
      wrapper = mount(TodoInput);

      const button = wrapper.find('button');
      expect(button.text()).toBe('新增');
    });
  });

  describe('error handling', () => {
    it('should handle store error gracefully', async () => {
      wrapper = mount(TodoInput);
      const store = useTodosStore();

      vi.spyOn(store, 'addTodo').mockImplementation(() => {
        throw new Error('待辦事項文字不可超過 500 字元');
      });

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      await input.setValue('測試');
      await button.trigger('click');

      const errorMessage = wrapper.find('.text-red-600');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toContain('待辦事項文字不可超過 500 字元');
    });

    it('should clear previous error when retrying submission', async () => {
      wrapper = mount(TodoInput);
      const store = useTodosStore();

      // 第一次失敗
      vi.spyOn(store, 'addTodo').mockImplementationOnce(() => {
        throw new Error('錯誤訊息');
      });

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      await input.setValue('測試');
      await button.trigger('click');

      expect(wrapper.find('.text-red-600').exists()).toBe(true);

      // 第二次成功
      await input.setValue('新的測試');
      await button.trigger('click');

      expect(wrapper.find('.text-red-600').exists()).toBe(false);
    });
  });

  describe('focus management', () => {
    it('should keep focus on input after successful submission', async () => {
      wrapper = mount(TodoInput, {
        attachTo: document.body,
      });

      const input = wrapper.find('input');
      const button = wrapper.find('button');

      (input.element as HTMLInputElement).focus();
      await input.setValue('測試任務');
      await button.trigger('click');

      expect(document.activeElement).toBe(input.element);

      wrapper.unmount();
    });
  });
});
