import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 測試配置
 * 用於測試響應式設計與跨瀏覽器相容性
 *
 * 參考文件: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 測試目錄
  testDir: './tests/playwright',

  // 最長執行時間
  timeout: 30 * 1000,

  // 完全平行執行測試
  fullyParallel: true,

  // CI 環境中測試失敗時不重試，本地開發時不重試
  retries: process.env.CI ? 2 : 0,

  // 平行執行的 worker 數量
  workers: process.env.CI ? 1 : undefined,

  // 測試報告格式
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // 所有專案共用的設定
  use: {
    // 基礎 URL
    baseURL: 'http://localhost:5173',

    // 截圖設定：失敗時截圖
    screenshot: 'only-on-failure',

    // 錄影設定：失敗時錄影
    video: 'retain-on-failure',

    // 追蹤設定：失敗時保留追蹤
    trace: 'retain-on-failure',
  },

  // 執行測試前啟動開發伺服器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // 測試專案配置：針對不同瀏覽器與裝置
  projects: [
    // === 桌面瀏覽器 ===
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // === 平板裝置 (768px - 1024px) ===
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },

    // === 手機裝置 (< 768px) ===
    {
      name: 'mobile-iphone',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'mobile-pixel',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
      },
    },

    // === 響應式設計專用測試 (自訂 viewport) ===
    {
      name: 'responsive-mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 }, // < 768px
      },
    },
    {
      name: 'responsive-tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 }, // 768px - 1024px
      },
    },
    {
      name: 'responsive-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }, // > 1024px
      },
    },
  ],
});
