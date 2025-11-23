# 資料模型: Todo Web App

**Feature**: Todo 待辦事項 Web 應用程式
**Date**: 2025-11-23
**Source**: [spec.md](./spec.md) - Key Entities 章節

## 概述

本應用程式為純前端實作,所有資料儲存於瀏覽器 localStorage。資料模型設計簡單且符合 MVP 原則,專注於核心 CRUD 操作。

## 核心實體

### TodoItem (待辦事項)

**目的**: 代表單一待辦事項,包含文字描述、完成狀態與時間戳記。

**TypeScript 型別定義**:

```typescript
interface TodoItem {
  /** 唯一識別碼,使用 UUID v4 格式 */
  id: string;

  /** 待辦事項文字描述,最多 500 字元 */
  text: string;

  /** 完成狀態 */
  completed: boolean;

  /** 建立時間戳記,ISO 8601 格式 */
  createdAt: string;

  /** 最後更新時間戳記,ISO 8601 格式 */
  updatedAt: string;
}
```

**欄位說明**:

| 欄位 | 型別 | 必填 | 說明 | 驗證規則 |
|------|------|------|------|----------|
| `id` | `string` | ✅ | UUID v4 格式的唯一識別碼 | 格式: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` |
| `text` | `string` | ✅ | 待辦事項的文字描述 | 長度: 1-500 字元,不可為空白字串 |
| `completed` | `boolean` | ✅ | 是否已完成 | `true` (已完成) 或 `false` (未完成) |
| `createdAt` | `string` | ✅ | 建立時間 | ISO 8601 格式,例: `2025-11-23T10:30:00.000Z` |
| `updatedAt` | `string` | ✅ | 最後更新時間 | ISO 8601 格式,每次編輯或狀態變更時更新 |

**業務規則**:

1. **唯一性**: `id` 必須在所有待辦事項中唯一
2. **文字長度**: `text` 長度限制 1-500 字元
3. **XSS 防護**: `text` 儲存原始文字,顯示時 Vue 自動跳脫 HTML
4. **時間戳記**: `createdAt` 建立後不可變更,`updatedAt` 每次編輯時更新
5. **狀態切換**: `completed` 可在 `true`/`false` 間自由切換
6. **刪除**: 刪除為永久性操作,無軟刪除或垃圾桶功能 (MVP 階段)

**範例資料**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "完成專案規劃文件",
  "completed": false,
  "createdAt": "2025-11-23T10:00:00.000Z",
  "updatedAt": "2025-11-23T10:00:00.000Z"
}
```

## localStorage 儲存格式

### 儲存鍵值

**Key**: `todos-app-data`

**理由**: 使用明確的 key 名稱,避免與其他應用程式的 localStorage 資料衝突。

### 儲存結構

```typescript
interface StorageData {
  /** 待辦事項陣列 */
  todos: TodoItem[];

  /** 資料格式版本號,用於未來資料遷移 */
  version: string;

  /** 最後同步時間戳記 (保留欄位,目前未使用) */
  lastSyncedAt?: string;
}
```

**JSON 範例**:

```json
{
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "完成專案規劃文件",
      "completed": false,
      "createdAt": "2025-11-23T10:00:00.000Z",
      "updatedAt": "2025-11-23T10:00:00.000Z"
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "text": "撰寫單元測試",
      "completed": true,
      "createdAt": "2025-11-23T09:00:00.000Z",
      "updatedAt": "2025-11-23T11:30:00.000Z"
    }
  ],
  "version": "1.0",
  "lastSyncedAt": null
}
```

### 版本管理

**當前版本**: `1.0`

**版本演進策略**:
- 未來如果資料結構變更,遞增版本號 (如 `1.1`, `2.0`)
- 實作資料遷移邏輯,確保舊版本資料可以自動升級
- 遷移邏輯範例:

```typescript
function migrateData(data: any): StorageData {
  if (!data.version || data.version === '1.0') {
    // 已是最新版本或舊版本
    return {
      todos: data.todos || [],
      version: '1.0',
      lastSyncedAt: null
    };
  }

  // 未來版本遷移邏輯
  // if (data.version === '1.0') {
  //   // 從 1.0 升級到 1.1
  //   return { ...upgraded, version: '1.1' };
  // }

  return data;
}
```

## 狀態管理 (Pinia Store)

### todos Store

**檔案位置**: `src/stores/todos.ts`

**Store 結構**:

```typescript
import { defineStore } from 'pinia';
import type { TodoItem } from '@/types/todo';

export const useTodosStore = defineStore('todos', () => {
  // State
  const todos = ref<TodoItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeTodos = computed(() =>
    todos.value
      .filter(t => !t.completed)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  const completedTodos = computed(() =>
    todos.value
      .filter(t => t.completed)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  const todoCount = computed(() => ({
    total: todos.value.length,
    active: activeTodos.value.length,
    completed: completedTodos.value.length
  }));

  // Actions
  function addTodo(text: string): TodoItem;
  function updateTodo(id: string, text: string): void;
  function toggleTodo(id: string): void;
  function deleteTodo(id: string): void;
  function loadTodos(): void;
  function saveTodos(): void;

  return {
    // State
    todos,
    isLoading,
    error,
    // Getters
    activeTodos,
    completedTodos,
    todoCount,
    // Actions
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    loadTodos,
    saveTodos
  };
});
```

**Getters 說明**:

1. **activeTodos**: 回傳未完成的待辦事項,按建立時間倒序排列
2. **completedTodos**: 回傳已完成的待辦事項,按建立時間倒序排列
3. **todoCount**: 回傳統計資訊 (總數、未完成數、已完成數)

**Actions 說明**:

1. **addTodo(text)**: 新增待辦事項
   - 生成 UUID
   - 設定 `createdAt` 與 `updatedAt` 為當前時間
   - 預設 `completed = false`
   - 加入 `todos` 陣列
   - 儲存到 localStorage

2. **updateTodo(id, text)**: 更新待辦事項文字
   - 驗證 `text` 長度 (1-500 字元)
   - 更新 `updatedAt` 為當前時間
   - 儲存到 localStorage

3. **toggleTodo(id)**: 切換完成狀態
   - 切換 `completed` 值
   - 更新 `updatedAt`
   - 儲存到 localStorage

4. **deleteTodo(id)**: 刪除待辦事項
   - 從 `todos` 陣列移除
   - 儲存到 localStorage

5. **loadTodos()**: 從 localStorage 載入資料
   - 解析 JSON
   - 執行資料遷移 (如需要)
   - 錯誤處理 (JSON 解析失敗、quota exceeded 等)

6. **saveTodos()**: 儲存資料到 localStorage
   - 序列化為 JSON
   - 錯誤處理 (quota exceeded)
   - 觸發 UI store 的錯誤通知

## 資料流程

### 1. 初始化流程

```
App 啟動
  ↓
useTodosStore.loadTodos()
  ↓
讀取 localStorage['todos-app-data']
  ↓
JSON.parse() + 資料遷移
  ↓
更新 todos state
  ↓
渲染 UI (activeTodos + completedTodos)
```

### 2. 新增待辦事項流程

```
使用者輸入文字 + 點擊「新增」
  ↓
驗證文字 (非空白, ≤ 500 字元)
  ↓
useTodosStore.addTodo(text)
  ↓
生成 TodoItem (id, createdAt, updatedAt)
  ↓
加入 todos 陣列
  ↓
saveTodos() → localStorage
  ↓
觸發 reactivity 更新 UI
  ↓
顯示 Toast 通知「新增成功」
```

### 3. 切換完成狀態流程

```
使用者點擊核取方塊
  ↓
useTodosStore.toggleTodo(id)
  ↓
切換 completed 值 + 更新 updatedAt
  ↓
saveTodos() → localStorage
  ↓
Vue reactivity 觸發 computed 重新計算
  ↓
待辦事項在 activeTodos ↔ completedTodos 間移動
  ↓
UI 重新渲染 (視覺樣式變更 + 位置移動)
  ↓
顯示 Toast 通知
```

### 4. 編輯待辦事項流程

```
使用者點擊待辦事項文字
  ↓
進入編輯模式 (顯示輸入框)
  ↓
使用者修改文字 + 按 Enter 或點擊儲存
  ↓
驗證文字 (非空白, ≤ 500 字元)
  ↓
useTodosStore.updateTodo(id, newText)
  ↓
更新 text + updatedAt
  ↓
saveTodos() → localStorage
  ↓
退出編輯模式
  ↓
顯示 Toast 通知「更新成功」
```

### 5. 刪除待辦事項流程

```
使用者點擊刪除按鈕
  ↓
顯示確認對話框「確定要刪除此待辦事項嗎?」
  ↓
使用者點擊「確認」
  ↓
useTodosStore.deleteTodo(id)
  ↓
從 todos 陣列移除
  ↓
saveTodos() → localStorage
  ↓
關閉確認對話框
  ↓
顯示 Toast 通知「刪除成功」
```

## 錯誤處理

### localStorage 失敗情境

**QuotaExceededError**:
- **原因**: 儲存空間已滿
- **處理**: 顯示持續警告橫幅,允許繼續操作但資料僅在會話期間有效
- **訊息**: 「無法儲存資料:瀏覽器儲存空間已滿。請刪除部分待辦事項或清理瀏覽器快取。目前變更將在關閉頁面後遺失。」

**SecurityError / 隱私模式**:
- **原因**: 瀏覽器隱私模式限制 localStorage
- **處理**: 顯示警告訊息,資料僅存於記憶體
- **訊息**: 「您正在使用隱私瀏覽模式,資料無法持久化儲存。關閉頁面後資料將遺失。」

**JSON 解析失敗**:
- **原因**: localStorage 資料損壞
- **處理**: 清空 localStorage,使用空陣列初始化
- **訊息**: 「資料載入失敗,已重設為空白清單。」

### 資料驗證失敗

**文字長度超過限制**:
- **觸發時機**: 使用者嘗試新增或編輯超過 500 字元的文字
- **處理**: 阻止操作,顯示錯誤訊息
- **訊息**: 「待辦事項文字不可超過 500 字元 (目前: {length} 字元)」

**空白文字**:
- **觸發時機**: 使用者嘗試新增或儲存空白文字
- **處理**: 阻止操作,顯示錯誤訊息
- **訊息**: 「請輸入待辦事項內容」

## 效能考量

### 排序效能

**當前實作**: 每次 computed 執行時進行陣列排序

**優化策略** (如超過 100 個項目時):
- 使用索引結構維護排序狀態
- 僅在新增/刪除時重新排序,切換狀態時移動項目

### localStorage 寫入頻率

**當前實作**: 每次操作後立即寫入

**優化策略** (如效能問題):
- 使用 `useDebounceFn` 延遲 300ms 批次寫入
- 在 `beforeunload` 事件時強制寫入,確保資料不遺失

### 記憶體使用

**估算** (1000 個待辦事項):
- 每個 TodoItem ≈ 200 bytes (含字串與時間戳記)
- 1000 個項目 ≈ 200KB
- JSON 序列化後 ≈ 250KB
- localStorage 限制通常 5-10MB,足夠使用

## 測試策略

### 單元測試 (todos.spec.ts)

```typescript
describe('useTodosStore', () => {
  it('should add a new todo', () => {
    const store = useTodosStore();
    const todo = store.addTodo('測試待辦事項');

    expect(todo.text).toBe('測試待辦事項');
    expect(todo.completed).toBe(false);
    expect(todo.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(store.todos).toHaveLength(1);
  });

  it('should toggle todo completion status', () => {
    const store = useTodosStore();
    const todo = store.addTodo('測試');

    store.toggleTodo(todo.id);
    expect(store.todos[0].completed).toBe(true);

    store.toggleTodo(todo.id);
    expect(store.todos[0].completed).toBe(false);
  });

  it('should update todo text', () => {
    const store = useTodosStore();
    const todo = store.addTodo('原始文字');
    const originalUpdatedAt = todo.updatedAt;

    // 確保時間戳記不同
    vi.advanceTimersByTime(1000);

    store.updateTodo(todo.id, '新文字');
    expect(store.todos[0].text).toBe('新文字');
    expect(store.todos[0].updatedAt).not.toBe(originalUpdatedAt);
  });

  it('should delete todo', () => {
    const store = useTodosStore();
    const todo = store.addTodo('待刪除');

    store.deleteTodo(todo.id);
    expect(store.todos).toHaveLength(0);
  });

  it('should reject empty text', () => {
    const store = useTodosStore();

    expect(() => store.addTodo('')).toThrow();
    expect(() => store.addTodo('   ')).toThrow();
  });

  it('should reject text longer than 500 characters', () => {
    const store = useTodosStore();
    const longText = 'a'.repeat(501);

    expect(() => store.addTodo(longText)).toThrow();
  });

  it('should sort active todos by creation time (newest first)', () => {
    const store = useTodosStore();

    const todo1 = store.addTodo('第一個');
    vi.advanceTimersByTime(1000);
    const todo2 = store.addTodo('第二個');
    vi.advanceTimersByTime(1000);
    const todo3 = store.addTodo('第三個');

    const active = store.activeTodos;
    expect(active[0].id).toBe(todo3.id);
    expect(active[1].id).toBe(todo2.id);
    expect(active[2].id).toBe(todo1.id);
  });
});
```

### localStorage 整合測試

```typescript
describe('localStorage integration', () => {
  it('should persist todos to localStorage', () => {
    const store = useTodosStore();
    store.addTodo('持久化測試');

    const stored = JSON.parse(localStorage.getItem('todos-app-data')!);
    expect(stored.todos).toHaveLength(1);
    expect(stored.todos[0].text).toBe('持久化測試');
  });

  it('should load todos from localStorage on init', () => {
    // 預先設定 localStorage
    localStorage.setItem('todos-app-data', JSON.stringify({
      todos: [
        {
          id: '123',
          text: '預載資料',
          completed: false,
          createdAt: '2025-11-23T10:00:00.000Z',
          updatedAt: '2025-11-23T10:00:00.000Z'
        }
      ],
      version: '1.0'
    }));

    const store = useTodosStore();
    store.loadTodos();

    expect(store.todos).toHaveLength(1);
    expect(store.todos[0].text).toBe('預載資料');
  });

  it('should handle localStorage quota exceeded error', () => {
    const store = useTodosStore();

    // Mock localStorage.setItem 拋出 QuotaExceededError
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    store.addTodo('測試');

    expect(store.error).toContain('儲存空間已滿');
  });
});
```

## 未來擴展考量

### 多裝置同步 (Phase 2)

**變更**:
- 新增 `syncStatus` 欄位: `'synced' | 'pending' | 'conflict'`
- 新增 `serverUpdatedAt` 欄位: 伺服器端時間戳記
- 實作衝突解決策略 (last-write-wins 或 merge)

### 軟刪除 (Phase 2)

**變更**:
- 新增 `deletedAt` 欄位: 刪除時間,`null` 表示未刪除
- 實作垃圾桶功能,30 天後永久刪除
- 提供恢復功能

### 分類與標籤 (Phase 2)

**變更**:
- 新增 `categoryId` 欄位
- 新增 `tags` 欄位: `string[]`
- 新增 `Category` 實體

### 優先級 (Phase 2)

**變更**:
- 新增 `priority` 欄位: `'low' | 'medium' | 'high'`
- 排序邏輯調整: 優先級 > 時間

這些擴展都可以透過版本遷移機制平滑升級,不影響現有資料。
