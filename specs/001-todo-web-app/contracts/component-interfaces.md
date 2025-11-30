# 元件介面合約

**Feature**: Todo Web App
**Date**: 2025-11-23
**Purpose**: 定義 Vue 元件間的介面合約,確保元件間的溝通一致性與可測試性

## 概述

由於本專案為純前端應用,無後端 API,此文件定義 Vue 元件的 Props、Events 與 Emits 介面合約,作為元件間溝通的規格。

## 元件階層結構

```
App.vue
├── Toast Notification.vue (全域,透過 Teleport)
├── ConfirmDialog.vue (全域,透過 Teleport)
└── TodoList.vue
    ├── TodoInput.vue
    ├── EmptyState.vue (條件渲染)
    └── TodoItem.vue (v-for 渲染多個)
```

## 元件介面定義

### 1. TodoList.vue (容器元件)

**職責**: 管理待辦事項清單的顯示與分組

**Props**: 無 (直接使用 Pinia store)

**Emits**: 無

**使用的 Store**:
- `useTodosStore()`: 取得 `activeTodos`, `completedTodos`

**子元件**:
- `TodoInput`: 新增待辦事項輸入框
- `EmptyState`: 空白狀態提示
- `TodoItem`: 待辦事項項目 (透過 `v-for` 渲染)

**範本結構** (使用 Tailwind CSS):
```vue
<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <TodoInput />

    <!-- 進行中組別 -->
    <section v-if="activeTodos.length > 0" class="space-y-3">
      <h2 class="text-lg font-semibold text-gray-700 pb-2 border-b border-gray-200">
        進行中
      </h2>
      <div class="space-y-2">
        <TodoItem
          v-for="todo in activeTodos"
          :key="todo.id"
          :todo="todo"
        />
      </div>
    </section>

    <!-- 已完成組別 -->
    <section v-if="completedTodos.length > 0" class="space-y-3">
      <h2 class="text-lg font-semibold text-gray-500 pb-2 border-b border-gray-200">
        已完成
      </h2>
      <div class="space-y-2">
        <TodoItem
          v-for="todo in completedTodos"
          :key="todo.id"
          :todo="todo"
        />
      </div>
    </section>

    <!-- 空白狀態 -->
    <EmptyState v-if="activeTodos.length === 0 && completedTodos.length === 0" />
  </div>
</template>
```

---

### 2. TodoInput.vue (輸入元件)

**職責**: 處理新增待辦事項的輸入與驗證

**Props**: 無

**Emits**: 無 (直接呼叫 store action)

**內部狀態**:
```typescript
interface TodoInputState {
  /** 輸入框文字 */
  inputText: string;

  /** 驗證錯誤訊息 */
  errorMessage: string | null;

  /** 是否正在提交 */
  isSubmitting: boolean;

  /** 當前字數 */
  characterCount: number;

  /** 是否已達字數上限 */
  isMaxLength: boolean;
}
```

**方法**:
```typescript
interface TodoInputMethods {
  /**
   * 處理表單提交
   * - 驗證輸入文字
   * - 呼叫 store.addTodo()
   * - 清空輸入框
   * - 顯示 Toast 通知
   */
  handleSubmit(): void;

  /**
   * 驗證輸入文字
   * @returns 錯誤訊息,無錯誤時回傳 null
   */
  validateInput(): string | null;
}
```

**驗證規則**:
1. 不可為空白字串 (trim 後)
2. 長度不可超過 500 字元 (使用 HTML `maxlength="500"` 屬性阻止超長輸入)
3. XSS 防護由 Vue 自動處理 (文字插值自動跳脫,不使用 `v-html`)

**字數統計功能**:
- **即時顯示**: 輸入框下方顯示 "當前字數/500 字元" (例如: "245/500 字元")
- **達到上限**: 當 `characterCount === 500` 時,顯示提示文字 "已達字數上限"
- **視覺回饋**: 超過 450 字元時文字顏色變為警告色 (橘色),達到 500 時變為紅色
- **計算方式**: 使用 `inputText.length` 計算 (不 trim)

**錯誤訊息**:
- 空白: `「請輸入待辦事項內容」`
- 超長 (邊界情況,通常被 maxlength 阻止): `「待辦事項文字不可超過 500 字元」`

**成功行為**:
- 清空輸入框
- 重置字數統計為 "0/500 字元"
- 顯示 Toast: `「新增成功」`
- 焦點保持在輸入框

**範本補充** (使用 Tailwind CSS):
```vue
<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <input
        v-model="inputText"
        @input="updateCharacterCount"
        maxlength="500"
        placeholder="輸入待辦事項..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        aria-label="新增待辦事項輸入框"
      />
      <button
        @click="handleSubmit"
        :disabled="!inputText.trim() || isSubmitting"
        class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        新增
      </button>
    </div>

    <!-- 字數統計 -->
    <div class="flex justify-between items-center text-sm">
      <span
        :class="{
          'text-gray-500': characterCount < 450,
          'text-orange-500': characterCount >= 450 && characterCount < 500,
          'text-red-500': characterCount === 500
        }"
      >
        {{ characterCount }}/500 字元
      </span>
      <span v-if="isMaxLength" class="text-red-500 font-medium">
        已達字數上限
      </span>
    </div>

    <!-- 錯誤訊息 -->
    <span v-if="errorMessage" class="block text-sm text-red-600">
      {{ errorMessage }}
    </span>
  </div>
</template>
```

---

### 3. TodoItem.vue (項目元件)

**職責**: 顯示單一待辦事項,處理編輯、切換完成狀態、刪除操作

**Props**:
```typescript
interface TodoItemProps {
  /** 待辦事項資料 */
  todo: TodoItem;
}
```

**Emits**: 無 (直接呼叫 store actions)

**內部狀態**:
```typescript
interface TodoItemState {
  /** 是否處於編輯模式 */
  isEditing: boolean;

  /** 編輯中的文字 */
  editText: string;

  /** 驗證錯誤訊息 */
  errorMessage: string | null;

  /** 編輯中的字數 */
  editCharacterCount: number;

  /** 編輯中是否已達字數上限 */
  isEditMaxLength: boolean;
}
```

**方法**:
```typescript
interface TodoItemMethods {
  /**
   * 進入編輯模式
   * - 設定 isEditing = true
   * - 複製 todo.text 到 editText
   * - 聚焦輸入框
   */
  startEdit(): void;

  /**
   * 儲存編輯
   * - 驗證 editText
   * - 呼叫 store.updateTodo(id, editText)
   * - 退出編輯模式
   * - 顯示 Toast 通知
   */
  saveEdit(): void;

  /**
   * 取消編輯
   * - 恢復原始文字
   * - 退出編輯模式
   */
  cancelEdit(): void;

  /**
   * 切換完成狀態
   * - 呼叫 store.toggleTodo(id)
   * - 顯示 Toast 通知
   */
  toggleComplete(): void;

  /**
   * 刪除待辦事項
   * - 顯示確認對話框
   * - 確認後呼叫 store.deleteTodo(id)
   * - 顯示 Toast 通知
   */
  deleteTodo(): void;
}
```

**鍵盤事件**:
- `Enter`: 儲存編輯
- `Escape`: 取消編輯
- `Space` (在核取方塊上): 切換完成狀態

**視覺狀態**:
```typescript
interface TodoItemVisualState {
  /** 已完成樣式: 刪除線 + 灰色文字 */
  completed: boolean;

  /** 編輯模式: 顯示輸入框而非文字 */
  editing: boolean;

  /** Hover 狀態: 顯示編輯與刪除按鈕 */
  hovering: boolean;
}
```

**範本結構** (使用 Tailwind CSS):
```vue
<template>
  <div
    class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
    :class="{ 'opacity-60': todo.completed }"
  >
    <input
      type="checkbox"
      :checked="todo.completed"
      @change="toggleComplete"
      class="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
      aria-label="標記為已完成"
    />

    <!-- 檢視模式 -->
    <span
      v-if="!isEditing"
      class="flex-1 text-gray-800 cursor-pointer hover:text-primary transition-colors"
      :class="{ 'line-through text-gray-500': todo.completed }"
      @click="startEdit"
    >
      {{ todo.text }}
    </span>

    <!-- 編輯模式 -->
    <div v-else class="flex-1 space-y-1">
      <input
        v-model="editText"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        maxlength="500"
        class="w-full px-3 py-1 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div class="text-xs">
        <span
          :class="{
            'text-gray-500': editCharacterCount < 450,
            'text-orange-500': editCharacterCount >= 450 && editCharacterCount < 500,
            'text-red-500': editCharacterCount === 500
          }"
        >
          {{ editCharacterCount }}/500 字元
        </span>
        <span v-if="isEditMaxLength" class="ml-2 text-red-500">
          已達字數上限
        </span>
      </div>
    </div>

    <!-- 操作按鈕 -->
    <div class="flex gap-2">
      <button
        v-if="!isEditing"
        @click="deleteTodo"
        class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        aria-label="刪除待辦事項"
      >
        刪除
      </button>
      <button
        v-else
        @click="saveEdit"
        class="px-3 py-1 text-sm text-white bg-primary hover:bg-blue-600 rounded-md transition-colors"
      >
        儲存
      </button>
      <button
        v-if="isEditing"
        @click="cancelEdit"
        class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
      >
        取消
      </button>
    </div>

    <!-- 錯誤訊息 -->
    <span v-if="errorMessage" class="absolute -bottom-6 left-0 text-sm text-red-600">
      {{ errorMessage }}
    </span>
  </div>
</template>
```

---

### 4. EmptyState.vue (空白狀態元件)

**職責**: 顯示友善的空白狀態提示訊息

**Props**: 無

**Emits**: 無

**內容** (使用 Tailwind CSS):
```vue
<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <h3 class="text-xl font-semibold text-gray-700 mb-2">目前沒有待辦事項</h3>
    <p class="text-gray-500">點擊上方輸入框新增您的第一個任務!</p>
  </div>
</template>
```

---

### 5. ToastNotification.vue (通知元件)

**職責**: 顯示 Toast 通知訊息 (成功、錯誤、警告)

**Props**:
```typescript
interface ToastProps {
  /** 通知訊息 */
  message: string;

  /** 通知類型 */
  type: 'success' | 'error' | 'warning' | 'info';

  /** 顯示時長 (毫秒),預設 3000 */
  duration?: number;
}
```

**Emits**:
```typescript
interface ToastEmits {
  /** 通知關閉時觸發 */
  close: () => void;
}
```

**行為**:
- 顯示於畫面右上角 (使用 CSS `position: fixed`)
- 自動在 `duration` 毫秒後消失
- 支援手動關閉 (點擊關閉按鈕)
- 支援多個通知堆疊顯示

**使用範例**:
```typescript
// 透過 composable 使用
const { showToast } = useToast();

showToast({
  message: '新增成功',
  type: 'success'
});
```

**內部實作** (透過 Pinia `ui` store):
```typescript
// stores/ui.ts
export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([]);

  function addToast(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID();
    toasts.value.push({ ...toast, id });

    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 3000);
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  }

  return { toasts, addToast, removeToast };
});
```

---

### 6. ConfirmDialog.vue (確認對話框元件)

**職責**: 顯示確認對話框,用於刪除等關鍵操作

**Props**:
```typescript
interface ConfirmDialogProps {
  /** 對話框標題 */
  title: string;

  /** 對話框訊息 */
  message: string;

  /** 確認按鈕文字,預設「確認」 */
  confirmText?: string;

  /** 取消按鈕文字,預設「取消」 */
  cancelText?: string;

  /** 確認按鈕樣式類型,預設 'danger' */
  confirmType?: 'primary' | 'danger';
}
```

**Emits**:
```typescript
interface ConfirmDialogEmits {
  /** 使用者點擊確認 */
  confirm: () => void;

  /** 使用者點擊取消或點擊遮罩 */
  cancel: () => void;
}
```

**無障礙性**:
- 開啟時設定 `role="dialog"` 與 `aria-modal="true"`
- 自動聚焦於確認或取消按鈕
- 支援 `Escape` 鍵關閉 (觸發 `cancel`)
- 鍵盤 trap (Tab 鍵只在對話框內循環)

**使用範例**:
```typescript
// 透過 composable 使用
const { confirm } = useConfirm();

async function deleteTodo(id: string) {
  const result = await confirm({
    title: '刪除確認',
    message: '確定要刪除此待辦事項嗎?',
    confirmType: 'danger'
  });

  if (result) {
    todosStore.deleteTodo(id);
    showToast({ message: '刪除成功', type: 'success' });
  }
}
```

**內部實作** (透過 Pinia `ui` store + Promise):
```typescript
// stores/ui.ts
export const useUiStore = defineStore('ui', () => {
  const confirmDialog = ref<ConfirmDialogState | null>(null);

  function showConfirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise(resolve => {
      confirmDialog.value = {
        ...options,
        onConfirm: () => {
          confirmDialog.value = null;
          resolve(true);
        },
        onCancel: () => {
          confirmDialog.value = null;
          resolve(false);
        }
      };
    });
  }

  return { confirmDialog, showConfirm };
});
```

---

## Composables 介面

### useTodos

**目的**: 封裝待辦事項業務邏輯,提供元件使用的高階 API

**匯出**:
```typescript
export function useTodos() {
  const todosStore = useTodosStore();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  /**
   * 新增待辦事項
   * @param text 待辦事項文字
   * @returns 新增的待辦事項,驗證失敗時拋出錯誤
   */
  async function addTodo(text: string): Promise<TodoItem> {
    try {
      const todo = todosStore.addTodo(text);
      showToast({ message: '新增成功', type: 'success' });
      return todo;
    } catch (error) {
      showToast({
        message: error.message,
        type: 'error'
      });
      throw error;
    }
  }

  /**
   * 切換待辦事項完成狀態
   * @param id 待辦事項 ID
   */
  function toggleTodo(id: string): void {
    todosStore.toggleTodo(id);
    const todo = todosStore.todos.find(t => t.id === id);
    showToast({
      message: todo?.completed ? '已標記為完成' : '已標記為未完成',
      type: 'success'
    });
  }

  /**
   * 更新待辦事項文字
   * @param id 待辦事項 ID
   * @param text 新文字
   */
  async function updateTodo(id: string, text: string): Promise<void> {
    try {
      todosStore.updateTodo(id, text);
      showToast({ message: '更新成功', type: 'success' });
    } catch (error) {
      showToast({
        message: error.message,
        type: 'error'
      });
      throw error;
    }
  }

  /**
   * 刪除待辦事項 (含確認對話框)
   * @param id 待辦事項 ID
   * @returns 是否已刪除
   */
  async function deleteTodo(id: string): Promise<boolean> {
    const confirmed = await confirm({
      title: '刪除確認',
      message: '確定要刪除此待辦事項嗎?',
      confirmType: 'danger'
    });

    if (confirmed) {
      todosStore.deleteTodo(id);
      showToast({ message: '刪除成功', type: 'success' });
      return true;
    }

    return false;
  }

  return {
    // State (from store)
    todos: computed(() => todosStore.todos),
    activeTodos: computed(() => todosStore.activeTodos),
    completedTodos: computed(() => todosStore.completedTodos),
    todoCount: computed(() => todosStore.todoCount),
    isLoading: computed(() => todosStore.isLoading),
    error: computed(() => todosStore.error),

    // Actions
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo
  };
}
```

---

### useToast

**目的**: 封裝 Toast 通知邏輯

**匯出**:
```typescript
export function useToast() {
  const uiStore = useUiStore();

  function showToast(options: {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }): void {
    uiStore.addToast({
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 3000
    });
  }

  return {
    showToast,
    toasts: computed(() => uiStore.toasts)
  };
}
```

---

### useConfirm

**目的**: 封裝確認對話框邏輯

**匯出**:
```typescript
export function useConfirm() {
  const uiStore = useUiStore();

  function confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmType?: 'primary' | 'danger';
  }): Promise<boolean> {
    return uiStore.showConfirm({
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || '確認',
      cancelText: options.cancelText || '取消',
      confirmType: options.confirmType || 'primary'
    });
  }

  return {
    confirm,
    confirmDialog: computed(() => uiStore.confirmDialog)
  };
}
```

---

### useLocalStorage

**目的**: 封裝 localStorage 操作,提供錯誤處理

**匯出**:
```typescript
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const { showToast } = useToast();

  /**
   * 讀取資料
   */
  function load(): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      return JSON.parse(item) as T;
    } catch (error) {
      console.error('localStorage read error:', error);
      showToast({
        message: '資料載入失敗,已重設為預設值',
        type: 'warning'
      });
      return defaultValue;
    }
  }

  /**
   * 儲存資料
   */
  function save(value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('localStorage write error:', error);

      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        showToast({
          message: '無法儲存資料: 瀏覽器儲存空間已滿。請刪除部分待辦事項或清理瀏覽器快取。',
          type: 'error',
          duration: 5000
        });
      } else {
        showToast({
          message: '資料儲存失敗',
          type: 'error'
        });
      }

      return false;
    }
  }

  /**
   * 清空資料
   */
  function clear(): void {
    localStorage.removeItem(key);
  }

  return {
    load,
    save,
    clear
  };
}
```

---

## 元件測試合約

### TodoInput 測試規格

```typescript
describe('TodoInput', () => {
  it('should emit add event with input text when form is submitted');
  it('should clear input after successful submission');
  it('should show error for empty input');
  it('should show error for input longer than 500 characters');
  it('should trim whitespace before validation');
  it('should focus input on mount');
  it('should disable submit button when input is invalid');
});
```

### TodoItem 測試規格

```typescript
describe('TodoItem', () => {
  it('should display todo text');
  it('should show completed style when todo is completed');
  it('should toggle completion status when checkbox is clicked');
  it('should enter edit mode when text is clicked');
  it('should save edit when Enter key is pressed');
  it('should cancel edit when Escape key is pressed');
  it('should show error when saving empty text');
  it('should call delete with confirm dialog');
});
```

### ToastNotification 測試規格

```typescript
describe('ToastNotification', () => {
  it('should display message with correct type style');
  it('should auto-close after duration');
  it('should emit close event when manually closed');
  it('should stack multiple toasts vertically');
});
```

### ConfirmDialog 測試規格

```typescript
describe('ConfirmDialog', () => {
  it('should display title and message');
  it('should emit confirm when confirm button is clicked');
  it('should emit cancel when cancel button is clicked');
  it('should emit cancel when backdrop is clicked');
  it('should close when Escape key is pressed');
  it('should trap focus within dialog');
  it('should focus confirm button on open by default');
});
```

---

## 效能合約

### 渲染效能

- **TodoList**: 使用 `v-memo` 優化已完成項目的重新渲染
- **TodoItem**: 使用 `key` 確保列表項目正確更新
- **虛擬滾動**: 超過 100 個項目時啟用 (可選,Phase 2)

### 事件處理

- **輸入驗證**: 使用 `debounce` 延遲驗證 (300ms)
- **localStorage 寫入**: 批次寫入,避免頻繁 I/O

---

## 無障礙性合約

### ARIA 標籤

- 所有互動元素必須有 `aria-label`
- 表單輸入必須有對應的 `<label>` 或 `aria-labelledby`
- 對話框必須設定 `role="dialog"` 與 `aria-modal="true"`

### 鍵盤導航

- Tab 順序符合邏輯
- 所有功能可透過鍵盤操作
- 焦點可見且明顯

### 語意 HTML

- 使用 `<main>`, `<section>`, `<button>` 等語意標籤
- 避免 `<div>` 作為互動元素

這些合約確保元件間的溝通一致,並提供清楚的測試與實作指引。
