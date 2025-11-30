# Implementation Plan: Todo 待辦事項 Web 應用程式

**Branch**: `001-todo-web-app` | **Date**: 2025-11-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-web-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

建立一個單頁式 Todo Web 應用程式,提供待辦事項的新增、編輯、刪除與完成狀態切換功能。採用 Vue 3 前端框架搭配 Composition API,使用瀏覽器本地儲存(localStorage)進行資料持久化。應用程式強調使用者體驗一致性,包含 Toast 通知、載入狀態指示器、錯誤處理與響應式設計,支援手機、平板與桌面裝置。遵循 MVP 原則,4 個使用者情境按優先級(P1-P4)獨立開發與測試。

## Technical Context

**Language/Version**: JavaScript (ES2020+) / TypeScript 5.x (可選,建議用於更好的型別安全)
**Primary Dependencies**:
- Vue 3.4+ (前端框架,使用 Composition API)
- Pinia 2.x (狀態管理)
- VueUse 10.x (Vue 組合式函式工具庫,提供 localStorage、網路狀態等實用工具)
- Tailwind CSS 3+ (Utility-First CSS 框架,提供現代化設計與高效開發體驗)

**Storage**: 瀏覽器 localStorage (純前端,無後端資料庫)
**Testing**: Vitest (單元測試、元件測試、E2E 測試) + Vue Test Utils (Vue 元件測試工具)
**Target Platform**: 現代瀏覽器 (Chrome, Firefox, Safari, Edge 最新版本)
**Project Type**: 單頁式 Web 應用程式 (SPA)
**Performance Goals**:
- 首次內容繪製 (FCP) < 1.5 秒
- 使用者互動回應 < 100ms
- 載入 100 個待辦事項時頁面載入 < 2 秒
**Constraints**:
- 純前端實作,無後端 API
- 支援離線操作 (資料存於本地)
- 響應式設計 (手機、平板、桌面),使用以下中斷點:
  - **手機**: `< 768px` (Tailwind: 預設 `sm` 以下)
  - **平板**: `768px - 1024px` (Tailwind: `md` 到 `lg` 之間)
  - **桌面**: `> 1024px` (Tailwind: `lg` 以上)
- XSS 防護 (正確處理使用者輸入,使用 `textContent` 而非 `innerHTML`)
**Scale/Scope**:
- 單一使用者
- 預期最多 1000 個待辦事項
- 4 個主要功能模組 (新增/檢視、完成狀態、編輯、刪除)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 程式碼品質標準 ✅ PASS

- **命名慣例**: 使用 Vue 3 官方風格指南,元件使用 PascalCase,組合式函式使用 `use` 前綴
- **單一職責**: 每個元件與組合式函式專注於單一功能
- **程式碼重用**: 使用 Vue Composables 抽取共用邏輯
- **文件說明**: JSDoc 註解用於公開的組合式函式與工具函式
- **Linter**: ESLint + Vue 官方 eslint-plugin-vue + Prettier (格式化)

### II. 測試驅動開發 (TDD) ✅ PASS

- **測試策略**: 核心業務邏輯(狀態管理、資料持久化)優先測試
- **測試分類**:
  - **單元測試**: Pinia store actions/getters, 組合式函式, 工具函式
  - **元件測試**: Vue 元件的使用者互動與狀態變化
  - **整合測試**: E2E 測試涵蓋 4 個使用者情境 (P1-P4)
- **覆蓋率目標**: 核心業務邏輯 (store, composables) 達 80%
- **TDD 流程**: 先撰寫測試 → 測試失敗 → 實作 → 測試通過 → 重構

### III. 使用者體驗一致性 ✅ PASS

- **Toast 通知**: 右上角浮動訊息,3 秒自動消失
- **載入狀態**: 使用 loading 狀態變數控制載入指示器
- **錯誤處理**: 友善錯誤訊息,空白輸入時即時驗證
- **確認對話框**: 刪除操作前顯示確認對話框
- **視覺回饋**: 100ms 內顯示按鈕點擊效果
- **響應式設計**: 使用 CSS Grid/Flexbox + 媒體查詢適應不同裝置

### IV. 效能需求 ✅ PASS

- **FCP < 1.5s**: 使用 Vite 打包,程式碼分割,延遲載入非關鍵元件
- **互動回應 < 100ms**: 使用 Vue 3 reactivity 系統確保即時更新
- **大量資料處理**: Vue 3 高效 reactivity 系統原生支援大量項目渲染 (測試目標: 500-1000 個待辦事項)
- **記憶體管理**: 正確清理事件監聽器與計時器,避免記憶體洩漏
- **資源優化**: Vite 自動進行樹搖 (tree-shaking) 與程式碼壓縮

### V. MVP 優先原則 ✅ PASS

- **優先級排序**: P1(新增/檢視) → P2(完成狀態) → P3(編輯) → P4(刪除)
- **獨立測試**: 每個使用者情境有獨立的功能模組與測試
- **簡單優先**: 不引入不必要的抽象層或設計模式
- **無過度設計**: 不實作分類、標籤、優先級等進階功能

### 總結

✅ **所有憲法原則符合** - 無需複雜度追蹤表

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/           # Vue 元件
│   ├── TodoList.vue     # 待辦事項清單容器元件
│   ├── TodoItem.vue     # 單一待辦事項元件
│   ├── TodoInput.vue    # 新增待辦事項輸入框元件
│   ├── ToastNotification.vue  # Toast 通知元件
│   ├── ConfirmDialog.vue      # 確認對話框元件
│   └── EmptyState.vue   # 空白狀態元件
│
├── composables/         # Vue Composition API 組合式函式
│   ├── useTodos.ts      # 待辦事項業務邏輯
│   ├── useToast.ts      # Toast 通知邏輯
│   ├── useLocalStorage.ts  # localStorage 封裝
│   └── useConfirm.ts    # 確認對話框邏輯
│
├── stores/              # Pinia 狀態管理
│   ├── todos.ts         # 待辦事項 store
│   └── ui.ts            # UI 狀態 store (toast, loading)
│
├── types/               # TypeScript 型別定義 (如使用 TS)
│   └── todo.ts          # Todo 相關型別
│
├── utils/               # 工具函式
│   ├── validators.ts    # 驗證函式 (防 XSS, 長度限制)
│   └── helpers.ts       # 輔助函式
│
├── assets/              # 靜態資源
│   └── styles/
│       └── main.css     # Tailwind CSS 入口檔案 (包含 @tailwind directives)
│
├── App.vue              # 根元件
└── main.ts              # 應用程式入口

tests/
├── unit/                # 單元測試
│   ├── stores/
│   │   └── todos.spec.ts
│   ├── composables/
│   │   ├── useTodos.spec.ts
│   │   └── useLocalStorage.spec.ts
│   └── utils/
│       └── validators.spec.ts
│
├── component/           # 元件測試
│   ├── TodoList.spec.ts
│   ├── TodoItem.spec.ts
│   └── TodoInput.spec.ts
│
└── e2e/                 # E2E 測試 (可選)
    ├── user-story-1.spec.ts  # P1: 新增與檢視
    ├── user-story-2.spec.ts  # P2: 完成狀態
    ├── user-story-3.spec.ts  # P3: 編輯
    └── user-story-4.spec.ts  # P4: 刪除

public/
├── index.html           # HTML 入口
└── favicon.ico

配置檔案 (repository root):
├── vite.config.ts       # Vite 建置配置
├── vitest.config.ts     # Vitest 測試配置
├── tailwind.config.js   # Tailwind CSS 配置
├── eslint.config.js     # ESLint 配置
├── .prettierrc          # Prettier 配置
├── tsconfig.json        # TypeScript 配置 (如使用)
└── package.json         # 專案依賴與腳本
```

### 配置檔案說明

#### tailwind.config.js

響應式設計中斷點配置 (對應 spec.md SC-007):

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      // 手機優先設計 (預設樣式)
      'sm': '640px',   // Tailwind 預設,本專案較少使用
      'md': '768px',   // 平板中斷點 (對應 spec.md 定義)
      'lg': '1024px',  // 桌面中斷點 (對應 spec.md 定義)
      'xl': '1280px',  // 大螢幕 (可選)
    },
    extend: {
      colors: {
        // 自訂顏色 (可依設計系統調整)
        'toast-success': '#10b981',
        'toast-error': '#ef4444',
        'toast-warning': '#f59e0b',
        'warning-banner': '#fef3c7',
      },
    },
  },
  plugins: [],
}
```

**使用範例**:
```vue
<!-- 手機: 垂直排列, 桌面: 水平排列 -->
<div class="flex flex-col md:flex-row gap-4">
  <input class="flex-1" />
  <button class="w-full md:w-auto">新增</button>
</div>
```

#### vite.config.ts

關鍵配置:
- **別名設定**: `@` 指向 `src/` 目錄
- **測試整合**: Vitest 配置包含 jsdom 環境
- **建置優化**: 程式碼分割、樹搖 (tree-shaking)

#### vitest.config.ts

測試配置:
- **環境**: `jsdom` (模擬瀏覽器 DOM)
- **覆蓋率工具**: `@vitest/coverage-v8`
- **覆蓋率目標**: 核心業務邏輯 (stores, composables) ≥ 80%

**Structure Decision**:

選擇單頁式 Web 應用程式 (SPA) 結構,使用 Vite + Vue 3 標準專案配置。

**理由**:
- **純前端**: 無需 backend 資料夾,所有邏輯在瀏覽器執行
- **元件化**: `components/` 目錄存放可重用的 UI 元件
- **組合式函式**: `composables/` 抽取共用業務邏輯,提升可測試性與重用性
- **狀態管理集中**: `stores/` 使用 Pinia 管理全域狀態
- **測試覆蓋**: 分層測試策略 (unit/component/e2e) 對應不同測試粒度

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - 無憲法違規需要說明
