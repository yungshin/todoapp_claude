# 開發快速入門: Todo Web App

**Feature**: Todo 待辦事項 Web 應用程式
**Date**: 2025-11-23
**Audience**: 開發團隊成員
**Goal**: 在 30 分鐘內設定開發環境並開始開發

## 前置需求

### 必要工具

- **Node.js**: 18.x 或更高版本
  ```bash
  node --version  # 應顯示 v18.x.x 或更高
  ```

- **npm**: 9.x 或更高版本 (隨 Node.js 安裝)
  ```bash
  npm --version  # 應顯示 9.x.x 或更高
  ```

- **Git**: 最新版本
  ```bash
  git --version
  ```

### 建議工具

- **VS Code**: 最新版本,搭配以下擴充套件:
  - Volar (Vue Language Features)
  - ESLint
  - Prettier - Code formatter
  - Vue VSCode Snippets
  - Tailwind CSS IntelliSense

- **瀏覽器**: Chrome, Firefox, Safari 或 Edge 最新版本

## 專案初始化 (首次設定)

### 1. 建立 Vue 專案

使用 Vite 官方腳手架建立 Vue 3 + TypeScript 專案:

```bash
# 在專案根目錄執行
npm create vite@latest . -- --template vue-ts

# 選項選擇
# ✔ Project name: … .
# ✔ Select a framework: › Vue
# ✔ Select a variant: › TypeScript
```

### 2. 安裝核心依賴

```bash
# 安裝 Pinia (狀態管理)
npm install pinia

# 安裝 VueUse (組合式函式工具庫)
npm install @vueuse/core

# 安裝 Tailwind CSS 與相關套件
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安裝開發工具
npm install -D @vitejs/plugin-vue
```

### 3. 安裝測試工具

```bash
# 安裝 Vitest (單元測試)
npm install -D vitest

# 安裝 Vue Test Utils (元件測試)
npm install -D @vue/test-utils

# 安裝 jsdom (測試環境)
npm install -D jsdom

# (可選) 安裝 Playwright (E2E 測試)
npm install -D @playwright/test
```

### 4. 安裝程式碼品質工具

```bash
# 安裝 ESLint
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-vue

# 安裝 Prettier
npm install -D prettier eslint-config-prettier

# (可選) 安裝 Husky + lint-staged (Git hooks)
npm install -D husky lint-staged
npx husky init
```

## 配置檔案設定

### 1. Vite 配置 (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### 2. Vitest 配置 (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.config.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
```

### 3. TypeScript 配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4. ESLint 配置 (`eslint.config.js`)

```javascript
import js from '@eslint/js';
import typescript from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettier,
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: typescript.parser
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off'
    }
  }
];
```

### 5. Prettier 配置 (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### 6. Tailwind CSS 配置 (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
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
    },
  },
  plugins: [],
};
```

### 7. 建立 Tailwind CSS 入口檔案 (`src/assets/styles/main.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自訂全域樣式 */
@layer base {
  * {
    @apply box-border;
  }

  body {
    @apply font-sans antialiased;
  }
}

/* 自訂元件樣式 */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
  }

  .btn-primary {
    @apply bg-primary text-white hover:bg-blue-600;
  }

  .btn-danger {
    @apply bg-danger text-white hover:bg-red-600;
  }
}
```

### 8. 在應用程式入口引入 Tailwind (`src/main.ts`)

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/styles/main.css'; // 引入 Tailwind CSS

const app = createApp(App);
app.use(createPinia());
app.mount('#app');
```

### 9. package.json 腳本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "format": "prettier --write src/",
    "type-check": "vue-tsc --noEmit"
  }
}
```

## 專案結構建立

### 建立目錄結構

```bash
# 建立主要目錄
mkdir -p src/components
mkdir -p src/composables
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/assets/styles

# 建立測試目錄
mkdir -p tests/unit/stores
mkdir -p tests/unit/composables
mkdir -p tests/unit/utils
mkdir -p tests/component
mkdir -p tests/e2e
```

### 建立核心檔案

```bash
# 建立型別定義
touch src/types/todo.ts

# 建立 store
touch src/stores/todos.ts
touch src/stores/ui.ts

# 建立 composables
touch src/composables/useTodos.ts
touch src/composables/useToast.ts
touch src/composables/useConfirm.ts
touch src/composables/useLocalStorage.ts

# 建立元件
touch src/components/TodoList.vue
touch src/components/TodoItem.vue
touch src/components/TodoInput.vue
touch src/components/ToastNotification.vue
touch src/components/ConfirmDialog.vue
touch src/components/EmptyState.vue

# 建立工具函式
touch src/utils/validators.ts
touch src/utils/helpers.ts

# 建立樣式 (main.css 內容見上方配置檔案設定)
touch src/assets/styles/main.css
```

## 啟動開發伺服器

### 開發模式

```bash
# 啟動開發伺服器 (預設 http://localhost:3000)
npm run dev
```

瀏覽器會自動開啟,顯示 Vue 預設歡迎頁面。

### 測試模式

```bash
# 執行測試 (watch mode)
npm run test:watch

# 執行測試覆蓋率報告
npm run test:coverage

# 開啟覆蓋率 HTML 報告
open coverage/index.html
```

### 型別檢查

```bash
# 執行 TypeScript 型別檢查
npm run type-check
```

### 程式碼檢查

```bash
# 執行 ESLint 檢查並自動修復
npm run lint

# 執行 Prettier 格式化
npm run format
```

## TDD 工作流程

### Red-Green-Refactor 循環

1. **Red (紅燈)**: 先寫測試

```typescript
// tests/unit/stores/todos.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTodosStore } from '@/stores/todos';

describe('useTodosStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should add a new todo', () => {
    const store = useTodosStore();
    const todo = store.addTodo('測試待辦事項');

    expect(todo.text).toBe('測試待辦事項');
    expect(todo.completed).toBe(false);
    expect(store.todos).toHaveLength(1);
  });
});
```

2. **執行測試**: `npm run test:watch`
   - 測試應該失敗 (因為還沒實作)

3. **Green (綠燈)**: 撰寫最少程式碼使測試通過

```typescript
// src/stores/todos.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TodoItem } from '@/types/todo';

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<TodoItem[]>([]);

  function addTodo(text: string): TodoItem {
    const todo: TodoItem = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    todos.value.push(todo);
    return todo;
  }

  return {
    todos,
    addTodo
  };
});
```

4. **確認測試通過**: 測試應該變成綠燈

5. **Refactor (重構)**: 改善程式碼品質,確保測試持續通過

### 開發順序建議

按照 MVP 優先級 (P1 → P2 → P3 → P4) 開發:

#### P1: 新增與檢視待辦事項

1. 建立 `TodoItem` 型別定義
2. 建立 `useTodosStore` (測試驅動)
   - `addTodo` action
   - `activeTodos` getter
3. 建立 `TodoInput` 元件 (測試驅動)
4. 建立 `TodoList` 元件
5. 建立 `EmptyState` 元件
6. 整合測試: 新增待辦事項流程

#### P2: 標示完成狀態

1. 實作 `toggleTodo` action (測試驅動)
2. 實作 `completedTodos` getter
3. 建立 `TodoItem` 元件 (核取方塊功能)
4. 整合測試: 切換完成狀態流程

#### P3: 編輯待辦事項

1. 實作 `updateTodo` action (測試驅動)
2. 擴展 `TodoItem` 元件 (編輯模式)
3. 整合測試: 編輯待辦事項流程

#### P4: 刪除待辦事項

1. 實作 `deleteTodo` action (測試驅動)
2. 建立 `ConfirmDialog` 元件 (測試驅動)
3. 建立 `useConfirm` composable
4. 擴展 `TodoItem` 元件 (刪除功能)
5. 整合測試: 刪除待辦事項流程

#### 橫切關注點 (Cross-cutting)

1. Toast 通知系統
   - `ToastNotification` 元件
   - `useToast` composable
   - `ui` store
2. localStorage 持久化
   - `useLocalStorage` composable
   - 錯誤處理
3. XSS 防護
   - `validators.ts` 工具函式

## 開發提示

### VS Code 快捷鍵

- `Ctrl + Space`: 自動完成
- `F2`: 重新命名符號
- `Alt + Click`: 多游標編輯
- `Ctrl + P`: 快速開啟檔案
- `Ctrl + Shift + P`: 命令面板

### Vue Devtools

安裝 [Vue.js devtools](https://devtools.vuejs.org/) 瀏覽器擴充套件:
- 檢視元件樹狀結構
- 檢視 Pinia store 狀態
- 時間旅行除錯

### 除錯技巧

1. **元件除錯**:
```vue
<script setup>
import { watchEffect } from 'vue';

const props = defineProps<{ todo: TodoItem }>();

// 追蹤 props 變化
watchEffect(() => {
  console.log('Todo changed:', props.todo);
});
</script>
```

2. **Store 除錯**:
```typescript
// 使用 Pinia 的 $subscribe
const store = useTodosStore();
store.$subscribe((mutation, state) => {
  console.log('Store mutated:', mutation.type);
  console.log('New state:', state);
});
```

3. **localStorage 除錯**:
```javascript
// 在瀏覽器 Console 檢視 localStorage
console.log(JSON.parse(localStorage.getItem('todos-app-data')));

// 清空 localStorage
localStorage.clear();
```

## 常見問題排解

### 問題: `npm run dev` 顯示 port 被佔用

```bash
# 方案 1: 變更 port (在 vite.config.ts)
server: {
  port: 3001
}

# 方案 2: 停止佔用 port 的程序
lsof -ti:3000 | xargs kill -9
```

### 問題: TypeScript 型別錯誤

```bash
# 重新安裝型別定義
npm install -D @types/node

# 清除快取
rm -rf node_modules/.vite
```

### 問題: ESLint 與 Prettier 衝突

```bash
# 確保安裝 eslint-config-prettier
npm install -D eslint-config-prettier

# 確認 eslint.config.js 最後一行是 prettier
```

### 問題: 測試找不到模組

```bash
# 確認 vitest.config.ts 有正確設定 alias
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

## Git 工作流程

### 開發新功能

```bash
# 確保在功能分支
git branch  # 應顯示 * 001-todo-web-app

# 開發前拉取最新變更
git pull origin 001-todo-web-app

# 開發...

# 查看變更
git status
git diff

# 暫存變更
git add src/components/TodoList.vue

# 提交 (遵循 TDD: 先測試後實作)
git commit -m "test: 新增 TodoList 元件測試"
git commit -m "feat: 實作 TodoList 元件"

# 推送到遠端
git push origin 001-todo-web-app
```

### 提交訊息慣例

```
類型: 簡短描述 (不超過 50 字元)

詳細說明 (可選)

類型包含:
- feat: 新功能
- fix: 錯誤修復
- refactor: 重構
- test: 測試
- docs: 文件
- style: 格式調整
- perf: 效能優化
```

## 下一步

1. **閱讀設計文件**:
   - [data-model.md](./data-model.md) - 資料模型
   - [component-interfaces.md](./contracts/component-interfaces.md) - 元件介面
   - [research.md](./research.md) - 技術研究

2. **開始開發 P1 功能**:
   - 從 `TodoItem` 型別定義開始
   - 遵循 TDD 流程
   - 參考元件介面合約

3. **定期執行品質檢查**:
   ```bash
   npm run lint && npm run type-check && npm run test
   ```

4. **需要協助?**
   - 查看 Vue 官方文件: https://vuejs.org/
   - 查看 Pinia 文件: https://pinia.vuejs.org/
   - 查看專案 README (如有)

祝開發順利! 🚀
