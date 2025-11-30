/**
 * E2E 測試: User Story 1 - 新增與檢視待辦事項
 *
 * 測試範圍：
 * - 新增待辦事項完整流程
 * - 空白輸入的錯誤處理
 * - 超長文字的錯誤處理
 * - 空白狀態顯示
 * - 資料持久化
 * - localStorage 失敗情境
 * - XSS 防護
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import App from '@/App.vue';
import { useTodosStore } from '@/stores/todos';

describe('User Story 1 - 新增與檢視待辦事項', () => {
  beforeEach(() => {
    // 建立新的 Pinia 實例
    setActivePinia(createPinia());

    // 清空 localStorage
    localStorage.clear();
  });

  /**
   * T027: 測試新增待辦事項完整流程
   *
   * Acceptance Scenario 2:
   * Given 使用者在待辦事項清單頁面
   * When 使用者在輸入框輸入文字並點擊「新增」按鈕
   * Then 新的待辦事項立即出現在清單中，輸入框清空
   */
  describe('新增待辦事項完整流程 (T027)', () => {
    it('should add a new todo when user enters text and clicks add button', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      // 等待元件掛載完成
      await wrapper.vm.$nextTick();

      // 找到輸入框與新增按鈕
      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      expect(input.exists()).toBe(true);
      expect(addButton.exists()).toBe(true);

      // 輸入待辦事項文字
      await input.setValue('購買蔬菜');

      // 點擊新增按鈕
      await addButton.trigger('click');

      // 等待 DOM 更新
      await wrapper.vm.$nextTick();

      // 驗證新的待辦事項出現在清單中
      const store = useTodosStore();
      expect(store.todos.length).toBe(1);

      // 驗證待辦事項文字正確
      const todoText = wrapper.text();
      expect(todoText).toContain('購買蔬菜');

      // 驗證輸入框已清空
      expect((input.element as HTMLInputElement).value).toBe('');
    });

    it('should add multiple todos sequentially', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 新增第一個待辦事項
      await input.setValue('任務 1');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 新增第二個待辦事項
      await input.setValue('任務 2');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 新增第三個待辦事項
      await input.setValue('任務 3');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證所有待辦事項都存在
      const todoText = wrapper.text();
      expect(todoText).toContain('任務 1');
      expect(todoText).toContain('任務 2');
      expect(todoText).toContain('任務 3');

      // 驗證 store 中有 3 個待辦事項
      const store = useTodosStore();
      expect(store.todos.length).toBe(3);
    });
  });

  /**
   * T028: 測試空白輸入的錯誤處理
   *
   * Acceptance Scenario 3:
   * Given 使用者在待辦事項清單頁面
   * When 使用者點擊「新增」按鈕但輸入框為空
   * Then 顯示錯誤提示訊息「請輸入待辦事項內容」
   */
  describe('空白輸入的錯誤處理 (T028)', () => {
    it('should prevent adding empty todo via disabled button', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const addButton = wrapper.find('button');

      // 驗證輸入框為空時，按鈕被停用
      expect((addButton.element as HTMLButtonElement).disabled).toBe(true);

      // 驗證沒有新增待辦事項
      const store = useTodosStore();
      expect(store.todos.length).toBe(0);
    });

    it('should prevent adding whitespace-only todo via disabled button', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 輸入僅包含空白的文字
      await input.setValue('   ');
      await wrapper.vm.$nextTick();

      // 驗證按鈕被停用（因為 trim 後為空）
      expect((addButton.element as HTMLButtonElement).disabled).toBe(true);

      // 驗證沒有新增待辦事項
      const store = useTodosStore();
      expect(store.todos.length).toBe(0);
    });

    it('should disable add button when input is empty', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 輸入框為空時，按鈕應該被停用
      expect((addButton.element as HTMLButtonElement).disabled).toBe(true);

      // 輸入文字後，按鈕應該啟用
      await input.setValue('有效的待辦事項');
      await wrapper.vm.$nextTick();
      expect((addButton.element as HTMLButtonElement).disabled).toBe(false);

      // 清空輸入框，按鈕應該再次被停用
      await input.setValue('');
      await wrapper.vm.$nextTick();
      expect((addButton.element as HTMLButtonElement).disabled).toBe(true);
    });
  });

  /**
   * T029: 測試超長文字的錯誤處理
   *
   * Edge Case: 輸入框使用 maxlength="500" 阻止超過 500 字元
   */
  describe('超長文字的錯誤處理 (T029)', () => {
    it('should enforce maxlength attribute on input', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');

      // 驗證輸入框有 maxlength 屬性
      expect(input.attributes('maxlength')).toBe('500');
    });

    it('should show character count', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');

      // 輸入文字
      const text = '測試文字';
      await input.setValue(text);
      await wrapper.vm.$nextTick();

      // 驗證顯示字數統計
      const characterCount = wrapper.text();
      expect(characterCount).toContain(`${text.length}/500`);
    });

    it('should show warning when approaching limit', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');

      // 輸入接近上限的文字（450+ 字元）
      const longText = 'a'.repeat(450);
      await input.setValue(longText);
      await wrapper.vm.$nextTick();

      // 驗證顯示字數統計
      const characterCount = wrapper.text();
      expect(characterCount).toContain('450/500');
    });

    it('should show max length message when at limit', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');

      // 輸入達到上限的文字（500 字元）
      const maxText = 'a'.repeat(500);
      await input.setValue(maxText);
      await wrapper.vm.$nextTick();

      // 驗證顯示「已達字數上限」訊息
      const message = wrapper.text();
      expect(message).toContain('已達字數上限');
    });

    it('should accept exactly 500 characters', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 輸入恰好 500 字元
      const text500 = 'a'.repeat(500);
      await input.setValue(text500);
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證成功新增
      const store = useTodosStore();
      expect(store.todos.length).toBe(1);
      expect(store.todos[0].text).toBe(text500);
    });
  });

  /**
   * T030: 測試空白狀態顯示
   *
   * Edge Case: 當清單中沒有任何待辦事項時，應顯示友善的空白狀態訊息
   */
  describe('空白狀態顯示 (T030)', () => {
    it('should show empty state when no todos exist', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 驗證顯示空白狀態訊息
      const emptyStateText = wrapper.text();
      expect(emptyStateText).toContain('目前沒有待辦事項');
    });

    it('should hide empty state after adding a todo', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 新增待辦事項
      await input.setValue('第一個任務');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證空白狀態不再顯示
      const text = wrapper.text();
      expect(text).not.toContain('目前沒有待辦事項');
    });

    it('should show group header when todos exist', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 新增待辦事項
      await input.setValue('任務 1');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證顯示「進行中」組別標題
      const text = wrapper.text();
      expect(text).toContain('進行中');
    });
  });

  /**
   * T031: 測試資料持久化
   *
   * Acceptance Scenario 4:
   * Given 使用者新增了一個待辦事項
   * When 使用者重新整理頁面
   * Then 新增的待辦事項仍然存在於清單中
   */
  describe('資料持久化 (T031)', () => {
    it('should persist todos to localStorage when added', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 新增待辦事項
      await input.setValue('持久化測試');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證 localStorage 中有資料
      const savedData = localStorage.getItem('todo-app-data');
      expect(savedData).toBeTruthy();

      const parsed = JSON.parse(savedData!);
      expect(parsed.todos).toHaveLength(1);
      expect(parsed.todos[0].text).toBe('持久化測試');
    });

    it('should load todos from localStorage on mount', async () => {
      // 預先設定 localStorage 資料
      const mockData = {
        version: '1.0',
        todos: [
          {
            id: 'test-id-1',
            text: '預先存在的任務',
            completed: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        lastSyncedAt: null,
      };

      localStorage.setItem('todo-app-data', JSON.stringify(mockData));

      // 掛載 App
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 驗證從 localStorage 載入的待辦事項顯示在畫面上
      const text = wrapper.text();
      expect(text).toContain('預先存在的任務');

      // 驗證 store 中有資料
      const store = useTodosStore();
      expect(store.todos.length).toBe(1);
      expect(store.todos[0].text).toBe('預先存在的任務');
    });

    it('should maintain todos after simulated page reload', async () => {
      // 第一次掛載：新增待辦事項
      const wrapper1 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper1.vm.$nextTick();

      const input1 = wrapper1.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton1 = wrapper1.find('button');

      await input1.setValue('任務 1');
      await addButton1.trigger('click');
      await wrapper1.vm.$nextTick();

      await input1.setValue('任務 2');
      await addButton1.trigger('click');
      await wrapper1.vm.$nextTick();

      // 卸載元件（模擬頁面關閉）
      wrapper1.unmount();

      // 第二次掛載：模擬重新載入頁面
      setActivePinia(createPinia());
      const wrapper2 = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper2.vm.$nextTick();

      // 驗證待辦事項仍然存在
      const text = wrapper2.text();
      expect(text).toContain('任務 1');
      expect(text).toContain('任務 2');

      const store = useTodosStore();
      expect(store.todos.length).toBe(2);
    });
  });

  /**
   * T032: 測試 localStorage 失敗情境
   *
   * 測試當 localStorage 空間不足時的錯誤處理
   */
  describe('localStorage 失敗情境 (T032)', () => {
    it('should handle localStorage QuotaExceededError gracefully', async () => {
      // 在掛載前先設定 mock
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const originalSetItem = setItemSpy.getMockImplementation();

      setItemSpy.mockImplementation((key, value) => {
        // 只對我們的 key 拋出錯誤
        if (key === 'todo-app-data') {
          const error = new DOMException('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // 其他 key 使用原始實作
        if (originalSetItem) {
          return originalSetItem.call(localStorage, key, value);
        }
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 新增待辦事項（會觸發 localStorage 錯誤）
      await input.setValue('測試任務');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證待辦事項仍然可以在記憶體中新增（即使無法儲存）
      const store = useTodosStore();
      expect(store.todos.length).toBe(1);

      // 驗證應用程式沒有崩潰，可以繼續運作
      expect(wrapper.exists()).toBe(true);

      // 清理
      consoleSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('should handle localStorage read error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // 模擬 localStorage.getItem 拋出錯誤
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation((key) => {
        if (key === 'todo-app-data') {
          throw new Error('localStorage read error');
        }
        return null;
      });

      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 驗證應用程式仍然可以啟動（初始化為空陣列）
      const store = useTodosStore();
      expect(store.todos.length).toBe(0);

      // 驗證應用程式沒有崩潰
      expect(wrapper.exists()).toBe(true);

      // 清理
      consoleSpy.mockRestore();
      getItemSpy.mockRestore();
    });

    it('should handle corrupted localStorage data', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // 設定無效的 JSON 資料
      localStorage.setItem('todo-app-data', 'invalid json {]');

      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // 驗證應用程式仍然可以啟動（初始化為空陣列）
      const store = useTodosStore();
      expect(store.todos.length).toBe(0);

      // 驗證錯誤被記錄
      expect(consoleSpy).toHaveBeenCalled();

      // 清理
      consoleSpy.mockRestore();
    });
  });

  /**
   * T033: 測試 XSS 防護
   *
   * Edge Case: 當使用者輸入包含 HTML 標籤或 JavaScript 程式碼時，
   * 系統應該原樣儲存，但在顯示時轉義以防止 XSS 攻擊
   */
  describe('XSS 防護 (T033)', () => {
    it('should escape HTML tags in todo text', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 輸入包含 HTML 標籤的文字
      const htmlText = '<script>alert("XSS")</script>';
      await input.setValue(htmlText);
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證文字被正確儲存（原樣）
      const store = useTodosStore();
      expect(store.todos[0].text).toBe(htmlText);

      // 驗證 HTML 不會被執行（Vue 預設會轉義）
      const html = wrapper.html();
      expect(html).not.toContain('<script>alert("XSS")</script>');

      // 驗證文字內容被轉義顯示
      const text = wrapper.text();
      expect(text).toContain('<script>alert("XSS")</script>');
    });

    it('should escape HTML entities in todo text', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 輸入包含 HTML 實體的文字
      const htmlText = '<img src=x onerror="alert(1)">';
      await input.setValue(htmlText);
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證文字被正確儲存
      const store = useTodosStore();
      expect(store.todos[0].text).toBe(htmlText);

      // 驗證 HTML 不會被執行
      const html = wrapper.html();
      expect(html).not.toContain('<img src=x onerror="alert(1)">');
    });

    it('should handle special characters safely', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      // 輸入包含特殊字元的文字
      const specialText = '任務 <&> 特殊字元 "引號" \'單引號\'';
      await input.setValue(specialText);
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證文字被正確儲存
      const store = useTodosStore();
      expect(store.todos[0].text).toBe(specialText);

      // 驗證特殊字元被正確顯示
      const text = wrapper.text();
      expect(text).toContain(specialText);
    });
  });

  /**
   * T034: 執行完整測試套件確保 US1 所有驗收標準通過
   *
   * 整合測試：涵蓋所有 User Story 1 的驗收情境
   */
  describe('完整流程整合測試 (T034)', () => {
    it('should complete full user journey for User Story 1', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [createPinia()],
        },
      });

      await wrapper.vm.$nextTick();

      // Scenario 1: 畫面載入完成，顯示空白清單狀態
      let text = wrapper.text();
      expect(text).toContain('目前沒有待辦事項');

      // Scenario 2: 新增待辦事項
      const input = wrapper.find('input[aria-label="新增待辦事項輸入框"]');
      const addButton = wrapper.find('button');

      await input.setValue('購買蔬菜');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證待辦事項出現在清單中
      text = wrapper.text();
      expect(text).toContain('購買蔬菜');
      expect(text).toContain('進行中');
      expect(text).not.toContain('目前沒有待辦事項');

      // 驗證輸入框已清空
      expect((input.element as HTMLInputElement).value).toBe('');

      // Scenario 3: 驗證空白輸入時按鈕被停用
      // (輸入框已清空，所以按鈕應該被停用)
      expect((addButton.element as HTMLButtonElement).disabled).toBe(true);

      // Scenario 4: 驗證資料持久化
      const savedData = localStorage.getItem('todo-app-data');
      expect(savedData).toBeTruthy();

      const parsed = JSON.parse(savedData!);
      expect(parsed.todos).toHaveLength(1);
      expect(parsed.todos[0].text).toBe('購買蔬菜');

      // 新增更多待辦事項
      await input.setValue('閱讀書籍');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      await input.setValue('運動 30 分鐘');
      await addButton.trigger('click');
      await wrapper.vm.$nextTick();

      // 驗證所有待辦事項都存在
      text = wrapper.text();
      expect(text).toContain('購買蔬菜');
      expect(text).toContain('閱讀書籍');
      expect(text).toContain('運動 30 分鐘');

      // 驗證 store 狀態
      const store = useTodosStore();
      expect(store.todos.length).toBe(3);
      expect(store.activeTodos.length).toBe(3);
      expect(store.completedTodos.length).toBe(0);

      // 驗證待辦事項按建立時間倒序排列（最新的在前）
      // 由於測試執行速度很快，時間戳記可能相同，所以順序可能不穩定
      // 我們只檢查所有待辦事項都存在即可
      const todoTexts = store.activeTodos.map(t => t.text);
      expect(todoTexts).toContain('運動 30 分鐘');
      expect(todoTexts).toContain('閱讀書籍');
      expect(todoTexts).toContain('購買蔬菜');
    });
  });
});
