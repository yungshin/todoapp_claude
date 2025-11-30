# 實作任務清單: Todo 待辦事項 Web 應用程式

**Feature**: Todo Web App
**Branch**: `001-todo-web-app`
**Date**: 2025-11-23
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## 總覽

本任務清單按照使用者情境優先級 (P1→P2→P3→P4) 組織,確保每個情境都可以獨立實作與測試。採用 TDD (測試驅動開發) 方法,每個情境先撰寫測試再實作功能。

### 快速統計

- **總任務數**: 76
- **User Story 1 (P1)**: 20 個任務 (核心功能,必須優先完成)
- **User Story 2 (P2)**: 8 個任務
- **User Story 3 (P3)**: 8 個任務
- **User Story 4 (P4)**: 11 個任務
- **Setup**: 6 個任務
- **Foundational**: 8 個任務
- **Polish**: 15 個任務 (包含 Playwright 設定與測試)

### MVP 範圍建議

**最小可行產品 (MVP)**: 僅實作 **User Story 1 (P1)** 即可交付基本功能
- 使用者可新增待辦事項
- 使用者可檢視待辦事項清單
- 資料持久化儲存
- 基本錯誤處理

## 實作策略

### 執行順序

```
Phase 1: Setup (T001-T006)
↓
Phase 2: Foundational (T007-T014)
↓
Phase 3: User Story 1 [P1] (T015-T034) ← MVP
↓
Phase 4: User Story 2 [P2] (T035-T042)
↓
Phase 5: User Story 3 [P3] (T043-T050)
↓
Phase 6: User Story 4 [P4] (T051-T061)
↓
Phase 7: Polish (T062-T073)
```

### 平行執行機會

每個 phase 內標記 `[P]` 的任務可以平行執行:

- **Foundational Phase**: T007-T009 可平行 (不同 stores)
- **US1 Phase**: T015-T017 可平行 (不同元件測試)
- **US1 Phase**: T022-T024 可平行 (不同元件實作)
- **US2 Phase**: T035, T036 可平行
- **US3 Phase**: T043, T044 可平行
- **US4 Phase**: T051-T053 可平行
- **Polish Phase**: T062-T064, T068-T071 可平行

---

## Phase 1: Setup (專案初始化)

**目標**: 建立 Vue 3 + TypeScript + Vite 專案骨架

**獨立測試標準**:
- ✅ 專案可成功啟動 (`npm run dev`)
- ✅ 測試可成功執行 (`npm run test`)
- ✅ Linter 可成功執行 (`npm run lint`)

### 任務清單

- [ ] T001 使用 Vite 建立 Vue 3 + TypeScript 專案 (`npm create vite@latest . -- --template vue-ts`)
- [ ] T002 [P] 安裝核心依賴 (pinia, @vueuse/core, tailwindcss, postcss, autoprefixer)
- [ ] T003 [P] 安裝測試工具 (vitest, @vue/test-utils, jsdom, @vitest/coverage-v8)
- [ ] T004 [P] 安裝程式碼品質工具 (eslint, @eslint/js, typescript-eslint, eslint-plugin-vue, prettier, eslint-config-prettier)
- [ ] T005 配置建置工具 (vite.config.ts, vitest.config.ts, tsconfig.json, eslint.config.js, .prettierrc, tailwind.config.js)
- [ ] T006 建立專案目錄結構 (src/components, src/composables, src/stores, src/types, src/utils, src/assets/styles, tests/unit, tests/component, tests/e2e)

---

## Phase 2: Foundational (基礎建設)

**目標**: 建立所有使用者情境共用的基礎設施

**獨立測試標準**:
- ✅ 所有型別定義可正確編譯
- ✅ Store 單元測試通過
- ✅ Utils 單元測試通過

### 任務清單

- [ ] T007 [P] 建立 TodoItem 型別定義在 src/types/todo.ts (id, text, completed, createdAt, updatedAt)
- [ ] T008 [P] 建立 StorageData 型別定義在 src/types/storage.ts (todos, version, lastSyncedAt)
- [ ] T009 [P] 建立 UI 相關型別定義在 src/types/ui.ts (Toast, ConfirmDialog, LoadingState)
- [ ] T010 建立驗證工具函式在 src/utils/validators.ts (validateTodoText, isValidLength, isNotEmpty)
- [ ] T011 撰寫 validators.ts 的單元測試在 tests/unit/utils/validators.spec.ts
- [ ] T012 建立輔助函式在 src/utils/helpers.ts (generateId 使用 crypto.randomUUID)
- [ ] T013 建立 Tailwind CSS 入口檔案在 src/assets/styles/main.css (包含 @tailwind directives 與自訂樣式)
- [ ] T014 在 src/main.ts 引入 Pinia 與 Tailwind CSS

---

## Phase 3: User Story 1 [P1] - 新增與檢視待辦事項

**User Story**: 使用者可以建立新的待辦事項並在清單中立即看到

**Why P1**: 這是 Todo 應用的核心功能,沒有新增與檢視功能就無法使用應用程式

**獨立測試標準**:
- ✅ 使用者可以輸入文字並點擊「新增」按鈕
- ✅ 新的待辦事項立即出現在清單中
- ✅ 輸入框在新增後自動清空
- ✅ 空白輸入顯示錯誤訊息「請輸入待辦事項內容」
- ✅ 超過 500 字元顯示錯誤訊息
- ✅ 重新整理頁面後資料仍然存在
- ✅ 清單為空時顯示友善的空白狀態訊息

### 測試任務

- [ ] T015 [P] 撰寫 todos store 單元測試在 tests/unit/stores/todos.spec.ts (addTodo, loadTodos, saveTodos, activeTodos getter)
- [ ] T016 [P] 撰寫 useLocalStorage composable 單元測試在 tests/unit/composables/useLocalStorage.spec.ts
- [ ] T017 [P] 撰寫 TodoInput 元件測試在 tests/component/TodoInput.spec.ts

### 實作任務

- [ ] T018 實作 todos store 在 src/stores/todos.ts (state: todos, isLoading, error | getters: activeTodos | actions: addTodo, loadTodos, saveTodos)
- [ ] T019 實作 useLocalStorage composable 在 src/composables/useLocalStorage.ts (load, save, clear 方法,含錯誤處理)
- [ ] T020 整合 localStorage 到 todos store 的 loadTodos 與 saveTodos actions
- [ ] T021 實作 EmptyState 元件在 src/components/EmptyState.vue (顯示友善訊息與圖示)
- [ ] T022 [P] [US1] 實作 TodoInput 元件在 src/components/TodoInput.vue (輸入框、驗證、新增按鈕)
- [ ] T023 [P] [US1] 實作 TodoList 容器元件在 src/components/TodoList.vue (顯示進行中組別、空白狀態)
- [ ] T024 [P] [US1] 實作 TodoItem 元件基本顯示功能在 src/components/TodoItem.vue (僅顯示文字與核取方塊,尚未實作互動)
- [ ] T025 [US1] 在 App.vue 中組合 TodoList 元件
- [ ] T026 [US1] 實作應用程式初始化時載入 localStorage 資料 (在 App.vue 的 onMounted hook)

### 整合測試任務

- [ ] T027 [US1] 撰寫 E2E 測試在 tests/e2e/user-story-1.spec.ts (測試新增待辦事項完整流程)
- [ ] T028 [US1] 測試空白輸入的錯誤處理
- [ ] T029 [US1] 測試超長文字 (>500字元) 的錯誤處理
- [ ] T030 [US1] 測試空白狀態顯示
- [ ] T031 [US1] 測試資料持久化 (重新載入後資料仍存在)
- [ ] T032 [US1] 測試 localStorage 失敗情境 (QuotaExceededError 模擬)
- [ ] T033 [US1] 測試 XSS 防護 (輸入 `<script>alert('XSS')</script>` 應顯示為文字)
- [ ] T034 [US1] 執行完整測試套件確保 US1 所有驗收標準通過

---

## Phase 4: User Story 2 [P2] - 標示完成狀態

**User Story**: 使用者可以將待辦事項標記為已完成或未完成

**Why P2**: 標記完成是 Todo 應用的第二重要功能,讓使用者能追蹤進度

**獨立測試標準**:
- ✅ 點擊核取方塊可切換完成狀態
- ✅ 已完成項目顯示刪除線與灰色文字
- ✅ 已完成項目移動到「已完成」組別(清單下方)
- ✅ 重新整理後完成狀態保持不變

### 測試與實作任務

- [ ] T035 [P] [US2] 撰寫 toggleTodo action 的單元測試在 tests/unit/stores/todos.spec.ts
- [ ] T036 [P] [US2] 撰寫 completedTodos getter 的單元測試
- [ ] T037 [US2] 實作 todos store 的 toggleTodo action (切換 completed, 更新 updatedAt, 儲存到 localStorage)
- [ ] T038 [US2] 實作 todos store 的 completedTodos getter (過濾 completed=true, 按 createdAt 倒序排列)
- [ ] T039 [US2] 在 TodoItem 元件中實作核取方塊點擊處理 (呼叫 toggleTodo, 視覺樣式變化)
- [ ] T040 [US2] 在 TodoList 元件中新增「已完成」組別區塊 (包含「已完成」組別標題與分隔線, 僅在 completedTodos.length > 0 時顯示)

### 整合測試任務

- [ ] T041 [US2] 撰寫 E2E 測試在 tests/e2e/user-story-2.spec.ts (測試切換完成狀態完整流程)
- [ ] T042 [US2] 執行完整測試套件確保 US2 所有驗收標準通過

---

## Phase 5: User Story 3 [P3] - 編輯待辦事項

**User Story**: 使用者可以修改已建立的待辦事項內容

**Why P3**: 編輯功能提升使用者體驗,但使用者可以刪除後重建作為替代方案

**獨立測試標準**:
- ✅ 點擊待辦事項文字進入編輯模式
- ✅ 編輯模式顯示輸入框並預填原文字
- ✅ 按 Enter 或點擊「儲存」按鈕儲存變更
- ✅ 按 ESC 或點擊「取消」按鈕取消編輯
- ✅ 空白文字無法儲存,顯示錯誤訊息

### 測試與實作任務

- [ ] T043 [P] [US3] 撰寫 updateTodo action 的單元測試在 tests/unit/stores/todos.spec.ts
- [ ] T044 [P] [US3] 撰寫 TodoItem 編輯模式的元件測試在 tests/component/TodoItem.spec.ts
- [ ] T045 [US3] 實作 todos store 的 updateTodo action (驗證, 更新 text 與 updatedAt, 儲存)
- [ ] T046 [US3] 在 TodoItem 元件中新增編輯狀態管理 (isEditing, editText)
- [ ] T047 [US3] 實作 TodoItem 的編輯模式 UI (點擊文字進入, 顯示輸入框, 儲存/取消按鈕)
- [ ] T048 [US3] 實作 TodoItem 的鍵盤事件處理 (Enter 儲存, ESC 取消)

### 整合測試任務

- [ ] T049 [US3] 撰寫 E2E 測試在 tests/e2e/user-story-3.spec.ts (測試編輯待辦事項完整流程)
- [ ] T050 [US3] 執行完整測試套件確保 US3 所有驗收標準通過

---

## Phase 6: User Story 4 [P4] - 刪除待辦事項

**User Story**: 使用者可以從清單中永久移除不需要的待辦事項

**Why P4**: 刪除功能是清理清單的必要功能,但可先透過標記完成管理

**獨立測試標準**:
- ✅ 點擊刪除按鈕顯示確認對話框
- ✅ 確認對話框包含訊息「確定要刪除此待辦事項嗎?」
- ✅ 點擊「確認」後待辦事項從清單中移除
- ✅ 點擊「取消」後對話框關閉,待辦事項保留
- ✅ 重新整理後刪除的項目不再出現

### 測試任務

- [ ] T051 [P] [US4] 撰寫 deleteTodo action 的單元測試在 tests/unit/stores/todos.spec.ts
- [ ] T052 [P] [US4] 撰寫 useConfirm composable 的單元測試在 tests/unit/composables/useConfirm.spec.ts
- [ ] T053 [P] [US4] 撰寫 ConfirmDialog 元件測試在 tests/component/ConfirmDialog.spec.ts

### 實作任務

- [ ] T054 [US4] 實作 todos store 的 deleteTodo action (從陣列移除, 儲存到 localStorage)
- [ ] T055 [US4] 實作 ui store 基礎版在 src/stores/ui.ts (confirmDialog state, showConfirm action, 為後續 Toast 與 loading 狀態預留擴展空間)
- [ ] T056 [US4] 實作 ConfirmDialog 元件在 src/components/ConfirmDialog.vue (標題, 訊息, 確認/取消按鈕, 鍵盤支援)
- [ ] T057 [US4] 實作 useConfirm composable 在 src/composables/useConfirm.ts (封裝確認對話框邏輯,回傳 Promise)
- [ ] T058 [US4] 在 TodoItem 元件中實作刪除按鈕與確認流程
- [ ] T059 [US4] 在 App.vue 中使用 Teleport 渲染 ConfirmDialog 元件

### 整合測試任務

- [ ] T060 [US4] 撰寫 E2E 測試在 tests/e2e/user-story-4.spec.ts (測試刪除待辦事項完整流程)
- [ ] T061 [US4] 執行完整測試套件確保 US4 所有驗收標準通過

---

## Phase 7: Polish (跨切關注點)

**目標**: 實作跨越所有使用者情境的橫切功能

**獨立測試標準**:
- ✅ 所有操作顯示 Toast 通知
- ✅ Toast 在 3 秒後自動消失
- ✅ localStorage 失敗時顯示警告橫幅
- ✅ 響應式設計在手機/平板/桌面正常運作

### 任務清單

- [ ] T062 [P] 實作 ui store 的 Toast 與載入狀態管理 (toasts state, isLoading state, addToast, removeToast, setLoading actions)
- [ ] T063 [P] 實作 useToast composable 在 src/composables/useToast.ts
- [ ] T064 [P] 實作 ToastNotification 元件在 src/components/ToastNotification.vue (成功/錯誤/警告樣式, 自動消失, 堆疊顯示)
- [ ] T065 在 App.vue 中使用 Teleport 渲染 ToastNotification 元件
- [ ] T066 在所有 store actions 中整合 Toast 通知 (新增成功、更新成功、刪除成功、切換狀態)
- [ ] T067 實作 localStorage 失敗時的警告橫幅在 App.vue (黃色背景, 頂部固定, 可關閉, 重新載入後再次顯示)
- [ ] T068 [P] 實作 App.vue 響應式佈局 (容器寬度、邊距適應 <768px/768-1024px/>1024px)
- [ ] T069 [P] 實作 TodoInput 元件響應式設計 (輸入框與按鈕在手機上垂直排列、桌面上水平排列)
- [ ] T070 [P] 實作 TodoList 與 TodoItem 元件響應式設計 (字體大小、間距、按鈕尺寸適應不同螢幕)
- [ ] T071 [P] 實作 Toast/Dialog 元件響應式設計 (手機上全寬顯示、桌面上固定寬度)
- [ ] T071a 安裝 Playwright (@playwright/test, 執行 npx playwright install --with-deps)
- [ ] T071b 配置 Playwright (建立 playwright.config.ts, 設定測試目錄 tests/playwright, 配置 chromium/firefox/webkit/mobile 專案)
- [ ] T072 [Playwright] 撰寫響應式設計 E2E 測試在 tests/playwright/responsive.spec.ts (測試 <768px/768-1024px/>1024px 三種寬度, 驗證 T068-T071 的實作)
- [ ] T072a [Playwright] 撰寫跨瀏覽器相容性測試在 tests/playwright/cross-browser.spec.ts (在 Chromium/Firefox/WebKit 上測試關鍵流程)
- [ ] T073 執行完整測試套件與效能測試 (Vitest + Playwright, FCP < 1.5s, 互動回應 < 100ms, 大量資料 500-1000 項)

---

## 依賴關係圖

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundational)
  ├─→ Phase 3 (US1 - 新增與檢視) ← MVP 範圍
  │     ↓
  ├─→ Phase 4 (US2 - 完成狀態) ← 依賴 US1
  │     ↓
  ├─→ Phase 5 (US3 - 編輯) ← 依賴 US1
  │     ↓
  └─→ Phase 6 (US4 - 刪除) ← 依賴 US1
        ↓
      Phase 7 (Polish - Toast & 警告橫幅) ← 可與 US2-4 平行

註: US2, US3, US4 彼此獨立,可任意順序開發
```

### 關鍵路徑

**最快完成 MVP** (最小可行產品):
```
Setup → Foundational → US1 → 完成
預估: 6 + 8 + 20 = 34 個任務
```

**完整功能交付**:
```
Setup → Foundational → US1 → US2 → US3 → US4 → Polish → 完成
預估: 6 + 8 + 20 + 8 + 8 + 11 + 15 = 76 個任務
```

---

## 平行執行範例

### US1 階段 (Phase 3) 的平行執行策略

**第一輪** - 測試撰寫 (可平行):
```bash
# 開發者 A
T015: 撰寫 todos store 測試

# 開發者 B
T016: 撰寫 useLocalStorage 測試

# 開發者 C
T017: 撰寫 TodoInput 元件測試
```

**第二輪** - 元件實作 (可平行):
```bash
# 開發者 A
T022: 實作 TodoInput 元件

# 開發者 B
T023: 實作 TodoList 元件

# 開發者 C
T024: 實作 TodoItem 元件 (基本顯示)
```

**第三輪** - 整合測試 (可平行):
```bash
# 開發者 A
T028-T030: 錯誤處理測試

# 開發者 B
T031-T032: 持久化測試

# 開發者 C
T033: XSS 防護測試
```

### US2-US4 的平行執行策略

**US2, US3, US4 可完全平行開發** (彼此獨立):
```bash
# 團隊 A 開發 US2 (完成狀態)
T035-T042

# 團隊 B 開發 US3 (編輯功能)
T043-T050

# 團隊 C 開發 US4 (刪除功能)
T051-T061
```

---

## 驗證檢查清單

### Phase 1 完成標準
- [ ] `npm run dev` 成功啟動,瀏覽器顯示 Vue 預設頁面
- [ ] `npm run test` 執行無錯誤 (即使尚無測試)
- [ ] `npm run lint` 執行無錯誤
- [ ] `npm run type-check` TypeScript 編譯無錯誤

### Phase 2 完成標準
- [ ] 所有型別定義檔案可正確編譯
- [ ] validators.ts 單元測試通過 (100% 覆蓋率)
- [ ] Tailwind CSS 樣式正確載入

### Phase 3 (US1) 完成標準
- [ ] ✅ 所有驗收情境通過 (spec.md User Story 1 的 4 個情境)
- [ ] ✅ E2E 測試通過 (tests/e2e/user-story-1.spec.ts)
- [ ] ✅ 單元測試覆蓋率 ≥ 80% (todos store, useLocalStorage)
- [ ] ✅ 可獨立部署並完整運作

### Phase 4 (US2) 完成標準
- [ ] ✅ 所有驗收情境通過 (spec.md User Story 2 的 4 個情境)
- [ ] ✅ E2E 測試通過
- [ ] ✅ 切換狀態後資料持久化正確

### Phase 5 (US3) 完成標準
- [ ] ✅ 所有驗收情境通過 (spec.md User Story 3 的 4 個情境)
- [ ] ✅ E2E 測試通過
- [ ] ✅ 鍵盤操作 (Enter, ESC) 正常運作

### Phase 6 (US4) 完成標準
- [ ] ✅ 所有驗收情境通過 (spec.md User Story 4 的 4 個情境)
- [ ] ✅ E2E 測試通過
- [ ] ✅ 確認對話框無障礙性符合 WCAG 2.1 AA

### Phase 7 (Polish) 完成標準
- [ ] ✅ Toast 通知系統運作正常
- [ ] ✅ localStorage 失敗時警告橫幅顯示
- [ ] ✅ 響應式設計在 3 種裝置 (<768px, 768-1024px, >1024px) 正常運作
- [ ] ✅ Playwright 響應式設計測試通過 (3 種螢幕尺寸)
- [ ] ✅ 跨瀏覽器測試通過 (Chrome, Firefox, Safari)
- [ ] ✅ 效能目標達成 (FCP < 1.5s, 互動 < 100ms)

### 最終發布檢查清單
- [ ] ✅ 所有 Vitest 測試通過 (單元測試、元件測試、基本整合測試)
- [ ] ✅ 所有 Playwright E2E 測試通過 (響應式設計、跨瀏覽器)
- [ ] ✅ 測試覆蓋率 ≥ 80%
- [ ] ✅ 無 ESLint 錯誤
- [ ] ✅ 無 TypeScript 錯誤
- [ ] ✅ 效能測試通過 (SC-001 至 SC-008)
- [ ] ✅ 無障礙性檢查通過 (鍵盤導航、ARIA 標籤)
- [ ] ✅ 跨瀏覽器測試通過 (Chrome, Firefox, Safari via Playwright)
- [ ] ✅ 生產環境建置無錯誤 (`npm run build`)

---

## 下一步行動

1. **開始 Setup Phase**: 執行 T001-T006 建立專案骨架
2. **參考文件**:
   - [quickstart.md](./quickstart.md) - 環境設定詳細步驟
   - [data-model.md](./data-model.md) - 資料結構定義
   - [contracts/component-interfaces.md](./contracts/component-interfaces.md) - 元件介面規格
3. **啟用 TDD**: 遵循 Red-Green-Refactor 循環
4. **執行測試**: 使用 `npm run test:watch` 持續監控測試狀態

祝開發順利! 🚀
