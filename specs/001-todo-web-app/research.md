# 技術研究文件: Todo Web App

**Feature**: Todo 待辦事項 Web 應用程式
**Date**: 2025-11-23
**Purpose**: 記錄技術選擇決策、最佳實踐與實作策略

## 技術棧決策

### 1. 前端框架: Vue 3

**決策**: 使用 Vue 3.4+ 搭配 Composition API

**理由**:
- **使用者指定**: 專案需求明確指定使用 Vue 作為主要網頁框架
- **Composition API**: 提供更好的邏輯重用與型別推論,適合組織待辦事項的業務邏輯
- **響應式系統**: Vue 3 的 Proxy-based reactivity 提供更好的效能與除錯體驗
- **生態系統成熟**: 豐富的第三方套件與官方工具鏈支援

**替代方案考量**:
- React: 更大的生態系統,但學習曲線較陡,且本專案已指定 Vue
- Svelte: 更小的 bundle size,但生態系統較小,社群資源較少
- Vanilla JS: 完全控制但需要自行實作響應式系統,開發效率低

### 2. 建置工具: Vite

**決策**: 使用 Vite 4+ 作為開發伺服器與建置工具

**理由**:
- **官方推薦**: Vue 官方推薦的建置工具,與 Vue 3 整合最佳
- **快速啟動**: ESM-based 開發伺服器,冷啟動速度快
- **HMR**: 熱模組替換速度極快,提升開發體驗
- **優化建置**: 內建 Rollup 建置優化,支援 tree-shaking 與程式碼分割
- **效能目標**: 幫助達成 FCP < 1.5s 的效能目標

**替代方案考量**:
- Webpack: 功能強大但配置複雜,建置速度較慢
- Parcel: 零配置但彈性較低,對 Vue 3 支援不如 Vite

### 3. 狀態管理: Pinia 2

**決策**: 使用 Pinia 2.x 作為全域狀態管理解決方案

**理由**:
- **官方推薦**: Vue 官方狀態管理庫,Vuex 的繼任者
- **TypeScript 友善**: 完整的型別推論,無需額外型別定義
- **Composition API 風格**: 與 Vue 3 Composition API 一致的使用方式
- **DevTools 整合**: 完整的 Vue DevTools 支援,方便除錯
- **模組化**: 每個 store 獨立,符合單一職責原則

**Store 設計**:
- `todos` store: 管理待辦事項的 CRUD 操作與排序邏輯
- `ui` store: 管理 Toast 通知、載入狀態、確認對話框等 UI 狀態

**替代方案考量**:
- Vuex: 舊版狀態管理,TypeScript 支援較弱,已不推薦用於新專案
- Composition API + provide/inject: 適合小型專案但缺乏 DevTools 與持久化支援

### 4. 本地儲存: localStorage + VueUse

**決策**: 使用 localStorage 搭配 VueUse 的 `useLocalStorage` composable

**理由**:
- **需求符合**: 規格明確要求瀏覽器本地儲存,無需後端
- **VueUse 整合**: `useLocalStorage` 提供響應式的 localStorage 封裝
- **自動序列化**: 自動處理 JSON 序列化/反序列化
- **同步更新**: 多個分頁間的資料同步
- **錯誤處理**: 內建 localStorage 失敗處理 (quota exceeded, private mode)

**儲存策略**:
```typescript
// 儲存格式範例
{
  "todos": [
    {
      "id": "uuid-v4",
      "text": "待辦事項文字",
      "completed": false,
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ],
  "version": "1.0" // 用於未來資料遷移
}
```

**替代方案考量**:
- IndexedDB: 更大容量與更好效能,但 API 複雜,對本專案過度設計
- sessionStorage: 關閉分頁後資料遺失,不符合持久化需求
- Cookie: 容量限制4KB,會隨請求發送增加網路負擔

### 5. 測試框架: Vitest + Vue Test Utils

**決策**:
- 單元測試: Vitest 3+
- 元件測試: Vue Test Utils 2+ (官方測試工具)
- E2E 測試: Playwright (可選,用於關鍵使用者情境)

**理由**:
- **Vite 原生支援**: Vitest 與 Vite 共享配置,無需額外設定
- **快速執行**: 利用 Vite 的 ESM 與快取機制,測試執行速度快
- **Jest 相容**: API 與 Jest 高度相容,學習成本低
- **Vue 官方**: Vue Test Utils 是 Vue 官方維護的測試工具
- **TDD 支援**: watch mode 與即時回饋支援 TDD 工作流程

**測試策略**:
- **單元測試 (80% 覆蓋率目標)**:
  - Pinia stores (todos, ui)
  - Composables (useTodos, useLocalStorage, useToast, useConfirm)
  - Utils (validators, helpers)
- **元件測試**:
  - TodoList, TodoItem, TodoInput, ToastNotification, ConfirmDialog
  - 測試使用者互動與狀態變化
- **E2E 測試 (關鍵路徑)**:
  - P1: 新增與檢視待辦事項
  - P2: 切換完成狀態
  - P3: 編輯待辦事項
  - P4: 刪除待辦事項

**替代方案考量**:
- Jest: 廣泛使用但需額外配置 ESM 轉譯,速度較慢
- Cypress: 強大的 E2E 工具但啟動時間較長,對單元測試過重

### 6. 程式碼品質工具

**決策**:
- **Linter**: ESLint 9+ + eslint-plugin-vue
- **Formatter**: Prettier 3+
- **Type Checker**: TypeScript 5.x (可選但建議)

**理由**:
- **Vue 官方規範**: eslint-plugin-vue 實現 Vue 官方風格指南
- **自動化**: Prettier 統一程式碼格式,減少 code review 爭議
- **型別安全**: TypeScript 提供編譯時型別檢查,減少執行時錯誤
- **IDE 整合**: VS Code, WebStorm 等 IDE 完整支援

**ESLint 規則**:
- Vue 官方推薦規則 (essential/strongly-recommended/recommended)
- 禁止 `var` 使用,強制 `const`/`let`
- 強制箭頭函式使用括號
- 元件命名使用 PascalCase

### 7. UI 與樣式策略

**決策**: Tailwind CSS 3+ (Utility-First CSS 框架)

**理由**:
- **現代主流設計**: Tailwind 是目前最流行的 CSS 框架,被 GitHub, Netflix, NASA 等採用
- **效能優異**: JIT (Just-In-Time) 模式只打包實際使用的 CSS,最終 bundle 僅 10-20KB (gzipped)
- **開發效率高**: Utility classes 讓開發速度提升 2-3 倍,符合 MVP 快速交付原則
- **設計系統內建**: 一致的間距、顏色、陰影系統,確保 UI 一致性
- **響應式設計簡單**: `sm:`, `md:`, `lg:` 前綴輕鬆實現響應式
- **完美整合 Vite**: 官方支援 Vite,配置簡單快速

**Tailwind 配置**:
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

**主要樣式檔案**:
```css
/* src/assets/styles/main.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded-lg shadow-md
           hover:bg-blue-600 transition duration-150 ease-in-out
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  }

  .todo-item {
    @apply p-4 bg-white rounded-lg shadow-sm border border-gray-200
           hover:shadow-md transition-shadow duration-150;
  }
}
```

**響應式設計**:
- Mobile First 方法 (Tailwind 預設)
- 斷點: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- 範例: `<div class="w-full md:w-1/2 lg:w-1/3">`

**效能優勢**:
- 僅打包使用到的 classes (樹搖優化)
- 生產環境自動壓縮與 purge 未使用的 CSS
- 符合 FCP < 1.5s 的效能目標

**替代方案考量**:
- Vuetify: Material Design 風格固定,bundle size ~200KB,對本專案過度龐大
- Element Plus: 較重 (~100KB),且元件風格不一定符合「現代主流」
- 原生 CSS: 開發效率低,難以快速達成現代化設計
- CSS-in-JS: 增加複雜度,效能影響較大

### 8. 唯一識別碼生成: UUID

**決策**: 使用 `crypto.randomUUID()` (瀏覽器原生 API)

**理由**:
- **瀏覽器原生**: 無需額外套件,bundle size 零影響
- **安全隨機**: 使用密碼學安全的隨機數生成器
- **標準格式**: UUID v4 標準格式
- **瀏覽器支援**: Chrome 92+, Firefox 95+, Safari 15.4+ (符合現代瀏覽器要求)

**Fallback 策略** (舊瀏覽器):
```typescript
function generateId(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

**替代方案考量**:
- nanoid: 更短的 ID 但需額外套件
- 時間戳 + 隨機數: 可能碰撞,不夠可靠

## XSS 防護策略

**威脅分析**: 使用者可以輸入任意文字,包含 HTML 標籤與 JavaScript 程式碼

**防護措施**:

1. **Vue 自動跳脫**: Vue 的文字插值 `{{ text }}` 自動跳脫 HTML
2. **禁止 `v-html`**: 完全不使用 `v-html` 指令
3. **輸入驗證**: 限制文字長度 500 字元
4. **Content Security Policy** (可選,額外防護層):
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

**測試案例**:
```typescript
// 測試輸入
const maliciousInputs = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<svg onload=alert("XSS")>'
];

// 預期行為: 顯示為純文字,不執行程式碼
```

## 效能優化策略

### 1. 初次載入優化 (FCP < 1.5s)

- **程式碼分割**: Vite 自動分割 vendor chunk
- **延遲載入**: 非關鍵元件使用 `defineAsyncComponent`
- **資源壓縮**: Vite 自動 minify CSS/JS
- **字體優化**: 使用系統字體,避免額外網路請求

### 2. 互動回應優化 (< 100ms)

- **Vue 3 Reactivity**: 利用 Proxy-based 響應式系統
- **虛擬滾動**: 超過 100 個項目時使用 `vue-virtual-scroller`
- **防抖輸入**: 搜尋/過濾功能使用 `useDebounceFn` (未來功能)

### 3. 記憶體管理

- **清理副作用**: 使用 `onBeforeUnmount` 清理事件監聽器與計時器
- **避免閉包陷阱**: 正確使用 `ref` 與 `reactive`
- **WeakMap 快取**: 需要時使用 WeakMap 避免記憶體洩漏

### 4. localStorage 效能

- **批次寫入**: 使用 debounce 減少寫入頻率
- **序列化優化**: 只序列化必要欄位
- **讀取快取**: 啟動時讀取一次,後續操作使用記憶體快取

## 無障礙性 (Accessibility) 考量

**WCAG 2.1 AA 級別目標**:

1. **鍵盤導航**:
   - Tab 鍵切換焦點
   - Enter 鍵觸發按鈕/儲存編輯
   - ESC 鍵取消編輯/關閉對話框
   - Space 鍵切換核取方塊

2. **ARIA 標籤**:
```vue
<button aria-label="刪除待辦事項" @click="deleteTodo">
  <DeleteIcon />
</button>

<input
  aria-label="新增待辦事項"
  aria-describedby="input-hint"
  v-model="newTodoText"
/>
<span id="input-hint">最多 500 字元</span>
```

3. **焦點管理**:
   - 新增事項後焦點回到輸入框
   - 刪除對話框開啟時焦點移至對話框
   - 對話框關閉後焦點回到觸發元素

4. **語意 HTML**:
```vue
<main role="main">
  <h1>我的待辦事項</h1>
  <form @submit.prevent="addTodo">
    <label for="todo-input">新增待辦事項</label>
    <input id="todo-input" type="text" />
    <button type="submit">新增</button>
  </form>
  <ul role="list">
    <li v-for="todo in todos" :key="todo.id" role="listitem">
      <!-- Todo item -->
    </li>
  </ul>
</main>
```

## 開發工作流程

### 1. 環境設定

```bash
# 安裝依賴
npm install

# 開發伺服器 (with HMR)
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

### 2. TDD 工作流程

```bash
# 測試 watch mode
npm run test:watch

# 測試覆蓋率報告
npm run test:coverage

# E2E 測試
npm run test:e2e
```

### 3. 程式碼品質檢查

```bash
# ESLint 檢查
npm run lint

# Prettier 格式化
npm run format

# TypeScript 型別檢查
npm run type-check
```

### 4. Git Hooks (建議)

使用 `husky` + `lint-staged` 在提交前自動執行檢查:

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["prettier --write"]
  }
}
```

## 風險與限制

### 1. 瀏覽器儲存限制

**風險**: localStorage 容量限制約 5-10MB,超過限制會拋出 QuotaExceededError

**緩解策略**:
- 在規格中明確限制最多 1000 個待辦事項
- 實作儲存失敗錯誤處理 (FR-008)
- 提供清楚的警告訊息提示使用者

**監控**:
```typescript
function getStorageUsage(): number {
  const total = 5 * 1024 * 1024; // 假設 5MB
  let used = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }
  return (used / total) * 100; // 回傳使用百分比
}
```

### 2. 瀏覽器相容性

**限制**: 需要現代瀏覽器支援 ES2020+ 與 Proxy

**支援範圍**:
- Chrome 92+
- Firefox 95+
- Safari 15.4+
- Edge 92+

**不支援**: IE 11 及更早版本 (符合規格要求)

### 3. 效能限制

**風險**: 超過 1000 個待辦事項時可能出現效能問題

**緩解策略**:
- 實作虛擬滾動 (超過 100 個項目時)
- 使用 `v-memo` 優化列表渲染 (Vue 3.2+)
- 考慮分頁或篩選功能 (未來擴展)

## 後續擴展建議

**Phase 2 可能功能** (超出當前 MVP 範圍):

1. **分類與標籤**: 待辦事項分組管理
2. **優先級**: P1/P2/P3 優先級標記
3. **到期日與提醒**: 時間管理功能
4. **搜尋與篩選**: 快速找到特定事項
5. **資料匯出**: JSON/CSV 格式匯出
6. **主題切換**: 淺色/深色模式
7. **多裝置同步**: 使用後端 API + 資料庫
8. **PWA 支援**: Service Worker + 離線快取

**技術債務追蹤**:
- 目前使用 localStorage,未來可能需要遷移到 IndexedDB
- TypeScript 採用率 (目前可選,建議全面採用)
- E2E 測試覆蓋率 (目前可選,建議加強)

## 參考資源

- [Vue 3 官方文件](https://vuejs.org/)
- [Pinia 官方文件](https://pinia.vuejs.org/)
- [Vite 官方文件](https://vitejs.dev/)
- [Vitest 官方文件](https://vitest.dev/)
- [VueUse 官方文件](https://vueuse.org/)
- [Vue 3 風格指南](https://vuejs.org/style-guide/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
