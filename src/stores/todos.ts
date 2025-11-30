import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TodoItem } from '@/types/todo';
import type { StorageData } from '@/types/storage';
import { validateTodoText } from '@/utils/validators';
import { generateId } from '@/utils/helpers';
import { useUiStore } from '@/stores/ui';

const STORAGE_KEY = 'todo-app-data';
const STORAGE_VERSION = '1.0';

export const useTodosStore = defineStore('todos', () => {
  // 使用 UI store 來顯示 Toast 通知
  const uiStore = useUiStore();

  // State
  const todos = ref<TodoItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const storageError = ref(false); // localStorage 儲存失敗標記

  // Getters
  /**
   * 取得所有未完成的待辦事項
   * 按建立時間倒序排列 (最新的在前)
   */
  const activeTodos = computed(() => {
    return todos.value
      .filter((todo) => !todo.completed)
      .sort((a, b) => b.createdAt - a.createdAt);
  });

  /**
   * 取得所有已完成的待辦事項
   * 按建立時間倒序排列 (最新的在前)
   */
  const completedTodos = computed(() => {
    return todos.value
      .filter((todo) => todo.completed)
      .sort((a, b) => b.createdAt - a.createdAt);
  });

  /**
   * 取得待辦事項總數
   */
  const todoCount = computed(() => todos.value.length);

  // Actions
  /**
   * 新增待辦事項
   * @param text - 待辦事項文字
   * @returns 新建的待辦事項
   * @throws 驗證失敗時拋出錯誤
   */
  function addTodo(text: string): TodoItem {
    // 驗證文字
    const validation = validateTodoText(text);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 建立待辦事項
    const now = Date.now();
    const todo: TodoItem = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    // 加入陣列
    todos.value.push(todo);

    // 自動儲存到 localStorage
    saveTodos();

    // 顯示成功訊息
    uiStore.addToast('success', '待辦事項新增成功');

    return todo;
  }

  /**
   * 切換待辦事項的完成狀態
   * @param id - 待辦事項 ID
   */
  function toggleTodo(id: string): void {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) {
      const wasCompleted = todo.completed;
      todo.completed = !todo.completed;
      todo.updatedAt = Date.now();

      // 自動儲存到 localStorage
      saveTodos();

      // 顯示成功訊息
      const message = wasCompleted ? '已標記為未完成' : '已標記為已完成';
      uiStore.addToast('success', message);
    }
  }

  /**
   * 更新待辦事項文字
   * @param id - 待辦事項 ID
   * @param text - 新文字
   * @throws 驗證失敗或 ID 不存在時拋出錯誤
   */
  function updateTodo(id: string, text: string): void {
    // 驗證文字
    const validation = validateTodoText(text);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const todo = todos.value.find((t) => t.id === id);
    if (!todo) {
      throw new Error('找不到指定的待辦事項');
    }

    todo.text = text.trim();
    todo.updatedAt = Date.now();

    // 自動儲存到 localStorage
    saveTodos();

    // 顯示成功訊息
    uiStore.addToast('success', '待辦事項更新成功');
  }

  /**
   * 刪除待辦事項
   * @param id - 待辦事項 ID
   */
  function deleteTodo(id: string): void {
    const index = todos.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos.value.splice(index, 1);

      // 自動儲存到 localStorage
      saveTodos();

      // 顯示成功訊息
      uiStore.addToast('success', '待辦事項刪除成功');
    }
  }

  /**
   * 從 localStorage 載入待辦事項
   */
  function loadTodos(): void {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (!item) {
        // localStorage 為空,初始化為空陣列
        todos.value = [];
        return;
      }

      const data = JSON.parse(item) as StorageData;
      todos.value = data.todos || [];
    } catch (err) {
      console.error('localStorage read error:', err);
      // 載入失敗時初始化為空陣列
      todos.value = [];
    }
  }

  /**
   * 儲存待辦事項到 localStorage
   */
  function saveTodos(): void {
    try {
      const data: StorageData = {
        todos: todos.value,
        version: STORAGE_VERSION,
        lastSyncedAt: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // 儲存成功,清除錯誤標記
      storageError.value = false;
    } catch (err) {
      console.error('localStorage write error:', err);

      // 設定錯誤標記
      storageError.value = true;

      // 根據不同錯誤類型處理
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        // QuotaExceededError: 儲存空間已滿
        // 這裡只記錄錯誤,不拋出異常,讓應用程式繼續運作
        console.error('QuotaExceededError: localStorage is full');
      }

      // 其他錯誤也不拋出,避免中斷應用程式
    }
  }

  return {
    // State
    todos,
    isLoading,
    error,
    storageError,

    // Getters
    activeTodos,
    completedTodos,
    todoCount,

    // Actions
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    loadTodos,
    saveTodos,
  };
});
