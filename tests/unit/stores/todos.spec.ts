import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTodosStore } from '@/stores/todos';
import type { TodoItem } from '@/types/todo';

describe('useTodosStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // 清空 localStorage mock
    if (typeof localStorage.clear === 'function') {
      localStorage.clear();
    } else {
      // 手動清空 localStorage (for jsdom compatibility)
      Object.keys(localStorage).forEach((key) => {
        localStorage.removeItem(key);
      });
    }
  });

  describe('addTodo', () => {
    it('should add a new todo with correct properties', () => {
      const store = useTodosStore();
      const text = '購買蔬菜';

      const todo = store.addTodo(text);

      expect(todo).toBeDefined();
      expect(todo.id).toBeTruthy();
      expect(todo.text).toBe(text);
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeTruthy();
      expect(todo.updatedAt).toBe(todo.createdAt);
      expect(store.todos).toHaveLength(1);
      expect(store.todos[0]).toEqual(todo);
    });

    it('should add multiple todos', () => {
      const store = useTodosStore();

      store.addTodo('任務 1');
      store.addTodo('任務 2');
      store.addTodo('任務 3');

      expect(store.todos).toHaveLength(3);
      expect(store.todos[0].text).toBe('任務 1');
      expect(store.todos[1].text).toBe('任務 2');
      expect(store.todos[2].text).toBe('任務 3');
    });

    it('should trim whitespace from todo text', () => {
      const store = useTodosStore();

      const todo = store.addTodo('  測試文字  ');

      expect(todo.text).toBe('測試文字');
    });

    it('should throw error for empty text', () => {
      const store = useTodosStore();

      expect(() => store.addTodo('')).toThrow('請輸入待辦事項內容');
      expect(() => store.addTodo('   ')).toThrow('請輸入待辦事項內容');
    });

    it('should throw error for text longer than 500 characters', () => {
      const store = useTodosStore();
      const longText = 'a'.repeat(501);

      expect(() => store.addTodo(longText)).toThrow('待辦事項文字不可超過 500 字元');
    });

    it('should accept text with exactly 500 characters', () => {
      const store = useTodosStore();
      const text = 'a'.repeat(500);

      const todo = store.addTodo(text);

      expect(todo.text).toHaveLength(500);
    });

    it('should generate unique IDs for todos', () => {
      const store = useTodosStore();

      const todo1 = store.addTodo('任務 1');
      const todo2 = store.addTodo('任務 2');

      expect(todo1.id).not.toBe(todo2.id);
    });
  });

  describe('activeTodos getter', () => {
    it('should return only uncompleted todos', () => {
      const store = useTodosStore();

      const todo1 = store.addTodo('未完成 1');
      const todo2 = store.addTodo('未完成 2');
      const todo3 = store.addTodo('未完成 3');

      // 標記其中一個為完成
      store.todos[1].completed = true;

      expect(store.activeTodos).toHaveLength(2);
      expect(store.activeTodos.map((t) => t.id)).toContain(todo1.id);
      expect(store.activeTodos.map((t) => t.id)).toContain(todo3.id);
      expect(store.activeTodos.map((t) => t.id)).not.toContain(todo2.id);
    });

    it('should return empty array when all todos are completed', () => {
      const store = useTodosStore();

      store.addTodo('任務 1');
      store.addTodo('任務 2');

      // 標記所有為完成
      store.todos.forEach((todo) => {
        todo.completed = true;
      });

      expect(store.activeTodos).toHaveLength(0);
    });

    it('should return empty array when there are no todos', () => {
      const store = useTodosStore();

      expect(store.activeTodos).toHaveLength(0);
    });

    it('should sort active todos by createdAt in descending order (newest first)', () => {
      const store = useTodosStore();

      // 新增任務時使用不同的時間戳記
      vi.useFakeTimers();

      vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
      const todo1 = store.addTodo('最舊的任務');

      vi.setSystemTime(new Date('2025-01-01T11:00:00Z'));
      const todo2 = store.addTodo('中間的任務');

      vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));
      const todo3 = store.addTodo('最新的任務');

      vi.useRealTimers();

      const activeTodos = store.activeTodos;

      expect(activeTodos[0]).toEqual(todo3); // 最新的在前
      expect(activeTodos[1]).toEqual(todo2);
      expect(activeTodos[2]).toEqual(todo1);
    });
  });

  describe('saveTodos', () => {
    it('should save todos to localStorage with correct structure', () => {
      const store = useTodosStore();

      store.addTodo('任務 1');
      store.addTodo('任務 2');

      store.saveTodos();

      const savedData = localStorage.getItem('todos-app-data');
      expect(savedData).toBeTruthy();

      const parsed = JSON.parse(savedData!);
      expect(parsed).toHaveProperty('todos');
      expect(parsed).toHaveProperty('version');
      expect(parsed.version).toBe('1.0');
      expect(parsed.todos).toHaveLength(2);
    });

    it('should save empty todos array', () => {
      const store = useTodosStore();

      store.saveTodos();

      const savedData = localStorage.getItem('todos-app-data');
      const parsed = JSON.parse(savedData!);

      expect(parsed.todos).toHaveLength(0);
    });

    it('should handle localStorage quota exceeded error', () => {
      const store = useTodosStore();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // 模擬 localStorage 空間不足
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      setItemSpy.mockImplementation(() => {
        const error = new DOMException('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      store.addTodo('測試任務');

      expect(() => store.saveTodos()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe('loadTodos', () => {
    it('should load todos from localStorage', () => {
      const store = useTodosStore();

      // 預先設定 localStorage 資料
      const mockData = {
        version: '1.0',
        todos: [
          {
            id: 'test-id-1',
            text: '任務 1',
            completed: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'test-id-2',
            text: '任務 2',
            completed: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      };

      localStorage.setItem('todos-app-data', JSON.stringify(mockData));

      store.loadTodos();

      expect(store.todos).toHaveLength(2);
      expect(store.todos[0].text).toBe('任務 1');
      expect(store.todos[1].text).toBe('任務 2');
      expect(store.todos[1].completed).toBe(true);
    });

    it('should initialize with empty todos when localStorage is empty', () => {
      const store = useTodosStore();

      store.loadTodos();

      expect(store.todos).toHaveLength(0);
    });

    it('should handle corrupted localStorage data', () => {
      const store = useTodosStore();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // 設定無效的 JSON
      localStorage.setItem('todos-app-data', 'invalid json {]');

      store.loadTodos();

      expect(store.todos).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle localStorage read error', () => {
      const store = useTodosStore();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // 模擬 localStorage 讀取錯誤
      const getItemSpy = vi.spyOn(localStorage, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('localStorage read error');
      });

      store.loadTodos();

      expect(store.todos).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      getItemSpy.mockRestore();
    });
  });

  describe('toggleTodo', () => {
    it('should toggle todo from uncompleted to completed', () => {
      const store = useTodosStore();

      const todo = store.addTodo('測試任務');
      expect(todo.completed).toBe(false);

      store.toggleTodo(todo.id);

      const updatedTodo = store.todos.find((t) => t.id === todo.id);
      expect(updatedTodo).toBeDefined();
      expect(updatedTodo!.completed).toBe(true);
    });

    it('should toggle todo from completed to uncompleted', () => {
      const store = useTodosStore();

      const todo = store.addTodo('測試任務');
      store.toggleTodo(todo.id); // 切換為完成
      expect(store.todos.find((t) => t.id === todo.id)!.completed).toBe(true);

      store.toggleTodo(todo.id); // 切換回未完成

      const updatedTodo = store.todos.find((t) => t.id === todo.id);
      expect(updatedTodo!.completed).toBe(false);
    });

    it('should update updatedAt timestamp when toggling', () => {
      const store = useTodosStore();
      vi.useFakeTimers();

      vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
      const todo = store.addTodo('測試任務');
      const originalUpdatedAt = todo.updatedAt;

      vi.setSystemTime(new Date('2025-01-01T11:00:00Z'));
      store.toggleTodo(todo.id);

      const updatedTodo = store.todos.find((t) => t.id === todo.id);
      expect(updatedTodo!.updatedAt).toBeGreaterThan(originalUpdatedAt);

      vi.useRealTimers();
    });

    it('should save to localStorage when toggling', () => {
      const store = useTodosStore();

      const todo = store.addTodo('測試任務');
      localStorage.clear();

      store.toggleTodo(todo.id);

      const savedData = localStorage.getItem('todos-app-data');
      expect(savedData).toBeTruthy();

      const parsed = JSON.parse(savedData!);
      expect(parsed.todos[0].completed).toBe(true);
    });

    it('should do nothing when id does not exist', () => {
      const store = useTodosStore();

      store.addTodo('測試任務');
      const originalLength = store.todos.length;

      store.toggleTodo('non-existent-id');

      expect(store.todos).toHaveLength(originalLength);
    });

    it('should only toggle the specific todo', () => {
      const store = useTodosStore();

      const todo1 = store.addTodo('任務 1');
      const todo2 = store.addTodo('任務 2');
      const todo3 = store.addTodo('任務 3');

      store.toggleTodo(todo2.id);

      expect(store.todos.find((t) => t.id === todo1.id)!.completed).toBe(false);
      expect(store.todos.find((t) => t.id === todo2.id)!.completed).toBe(true);
      expect(store.todos.find((t) => t.id === todo3.id)!.completed).toBe(false);
    });
  });

  describe('integration: addTodo and saveTodos', () => {
    it('should persist todos when addTodo is called with saveTodos', () => {
      const store = useTodosStore();

      store.addTodo('任務 1');
      store.addTodo('任務 2');
      store.saveTodos();

      // 建立新的 store 實例並載入資料
      const newStore = useTodosStore();
      newStore.loadTodos();

      expect(newStore.todos).toHaveLength(2);
      expect(newStore.todos[0].text).toBe('任務 1');
      expect(newStore.todos[1].text).toBe('任務 2');
    });
  });
});
