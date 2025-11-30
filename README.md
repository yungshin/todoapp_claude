# Todo 待辦事項 Web 應用程式

一個簡潔、現代化的待辦事項管理應用程式，使用 Vue 3 + TypeScript + Vite 開發，提供完整的 CRUD 功能與優秀的使用者體驗。

## 功能特色

- **核心功能**
  - 新增、編輯、刪除待辦事項
  - 標記待辦事項為完成/未完成
  - 智慧分組顯示（進行中/已完成）
  - 本地儲存資料持久化

- **使用者體驗**
  - 簡潔直覺的操作介面
  - Toast 通知即時回饋
  - 鍵盤快捷鍵支援（Enter 儲存、ESC 取消、Tab 導航）
  - 友善的空白狀態提示
  - 字數統計與上限提示（500 字元）

- **技術亮點**
  - 響應式設計（支援手機、平板、桌面）
  - XSS 防護機制
  - 完整的 E2E 與單元測試覆蓋
  - 跨瀏覽器相容性（Chromium、Firefox、WebKit）
  - 優秀的效能表現

## 技術架構

### 核心技術

- **前端框架**: Vue 3.5 (Composition API)
- **程式語言**: TypeScript 5.6
- **建置工具**: Vite 6.0
- **狀態管理**: Pinia 3.0
- **樣式方案**: Tailwind CSS 3.4
- **工具函式**: VueUse 14.0

### 測試工具

- **單元測試**: Vitest 4.0 + @vue/test-utils
- **E2E 測試**: Playwright 1.57
- **程式碼品質**: ESLint 9.39 + Prettier 3.6
- **覆蓋率工具**: @vitest/coverage-v8

## 快速開始

### 環境需求

- Node.js 18+
- npm 或其他套件管理工具

### 安裝步驟

```bash
# 複製專案
git clone <repository-url>
cd todoapp_claude

# 安裝相依套件
npm install

# 啟動開發伺服器
npm run dev
```

開發伺服器將會在 `http://localhost:5173` 啟動。

### 建置生產版本

```bash
# 建置專案
npm run build

# 預覽建置結果
npm run preview
```

建置產物將會輸出到 `dist/` 目錄。

## 開發指令

```bash
# 開發伺服器
npm run dev

# 類型檢查
npm run type-check

# 程式碼檢查
npm run lint

# 單元測試
npm test
npm run test:watch        # 監聽模式

# E2E 測試
npm run test:e2e          # 無頭模式
npm run test:e2e:ui       # UI 模式
npm run test:e2e:debug    # 偵錯模式

# 建置專案
npm run build
```

## 測試覆蓋率

本專案擁有完整的測試覆蓋：

| 測試類型 | 通過數 | 跳過數 | 總數 | 通過率 |
|---------|--------|--------|------|--------|
| E2E 測試 | 286 | 2 | 288 | 100% |
| 單元測試 | 221 | 0 | 221 | 100% |
| **總計** | **507** | **2** | **509** | **100%** |

### 測試環境覆蓋

- 桌面瀏覽器：Chromium、Firefox、WebKit
- 平板裝置：iPad (Safari)
- 手機裝置：iPhone (Safari)、Google Pixel (Chrome)
- 響應式環境：Desktop (1920x1080)、Mobile (375x667)、Tablet (768x1024)

詳細測試報告請參考 [TESTING.md](./TESTING.md)。

## 專案結構

```
todoapp_claude/
├── src/
│   ├── assets/          # 靜態資源（樣式、圖片等）
│   ├── components/      # Vue 組件
│   │   ├── ConfirmDialog.vue
│   │   ├── EmptyState.vue
│   │   ├── ToastNotification.vue
│   │   ├── TodoInput.vue
│   │   ├── TodoItem.vue
│   │   └── TodoList.vue
│   ├── composables/     # 可重用的組合式函式
│   │   ├── useConfirm.ts
│   │   ├── useLocalStorage.ts
│   │   └── useToast.ts
│   ├── stores/          # Pinia 狀態管理
│   │   ├── todos.ts
│   │   └── ui.ts
│   ├── types/           # TypeScript 類型定義
│   ├── utils/           # 工具函式
│   ├── App.vue          # 根組件
│   └── main.ts          # 應用程式入口
├── tests/               # 測試檔案
│   ├── unit/           # 單元測試
│   └── e2e/            # E2E 測試
├── specs/              # 功能規格文件
└── public/             # 公開靜態資源
```

## 瀏覽器支援

- Chrome / Edge (最新版)
- Firefox (最新版)
- Safari (最新版)

## 已知限制

### WebKit Tab 鍵導航

在 Safari 瀏覽器中，預設不支援使用 Tab 鍵聚焦到按鈕元素。這是 Safari 的設計決策，不是應用程式的 bug。

**解決方案**：
- **macOS**: 系統偏好設定 > 鍵盤 > 快速鍵 > 選擇「所有控制項目」
- **iOS**: 設定 > 輔助使用 > 鍵盤 > 完整鍵盤存取

## 資料儲存

本應用使用瀏覽器的 `localStorage` API 儲存待辦事項資料。資料僅存在於本地瀏覽器中，不會上傳到任何伺服器。

### 儲存失敗處理

若 localStorage 儲存失敗（如儲存空間已滿、隱私模式限制），系統會：
- 在頁面頂部顯示警告橫幅
- 允許繼續操作（資料僅在當前會話有效）
- 重新載入頁面時資料將遺失

## 安全性

- **XSS 防護**: 所有使用者輸入在顯示時都會轉義，防止跨站腳本攻擊
- **輸入驗證**: 限制待辦事項長度上限為 500 字元
- **本地儲存**: 資料僅存於本地，不涉及網路傳輸

## 效能指標

- 頁面載入時間（100 個項目）: < 2 秒
- 操作回應時間: < 100 毫秒
- 高負載載入時間（500-1000 個項目）: < 3 秒

## 開發規範

- 程式碼風格遵循 ESLint + Prettier 配置
- 使用 TypeScript 嚴格模式
- 遵循 Vue 3 Composition API 最佳實踐
- 所有組件必須包含對應的單元測試
- 所有使用者流程必須包含 E2E 測試

## 貢獻指南

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 授權

本專案採用 MIT 授權條款。

## 聯絡方式

如有任何問題或建議，歡迎開啟 Issue 討論。

---

最後更新：2025-11-30
