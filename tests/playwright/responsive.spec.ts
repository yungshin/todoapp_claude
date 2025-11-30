import { test, expect } from '@playwright/test';

/**
 * 響應式設計 E2E 測試 (T072)
 * 測試應用程式在不同螢幕尺寸下的響應式行為
 *
 * 測試三種中斷點:
 * - 手機: < 768px (使用 375px)
 * - 平板: 768px - 1024px (使用 768px)
 * - 桌面: > 1024px (使用 1440px)
 *
 * 驗證任務:
 * - T068: App.vue 響應式佈局 (容器寬度、邊距)
 * - T069: TodoInput 元件響應式設計 (手機垂直、桌面水平)
 * - T070: TodoList 與 TodoItem 元件響應式設計 (字體、間距、按鈕)
 * - T071: Toast/Dialog 元件響應式設計 (手機全寬、桌面固定寬度)
 */

// === 手機測試 (< 768px) ===
test.describe('手機裝置響應式設計 (< 768px)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('T068: App.vue 容器在手機上使用正確的邊距與寬度', async ({ page }) => {
    await page.goto('/');

    // 檢查主容器
    const container = page.locator('main').first();
    await expect(container).toBeVisible();

    // 檢查容器佔據全寬（扣除 padding）
    const boundingBox = await container.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(300); // 手機寬度應該較窄
    expect(boundingBox?.width).toBeLessThan(400);
  });

  test('T069: TodoInput 在手機上採用垂直排列', async ({ page }) => {
    await page.goto('/');

    const todoInput = page.locator('input[placeholder*="待辦事項"]');
    const addButton = page.locator('button:has-text("新增")');

    // 確認元件存在
    await expect(todoInput).toBeVisible();
    await expect(addButton).toBeVisible();

    // 檢查垂直排列：按鈕應該在輸入框下方
    const inputBox = await todoInput.boundingBox();
    const buttonBox = await addButton.boundingBox();

    expect(inputBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();

    // 按鈕的 top 應該大於輸入框的 bottom (垂直排列)
    if (inputBox && buttonBox) {
      expect(buttonBox.y).toBeGreaterThan(inputBox.y + inputBox.height - 5);
    }

    // 按鈕應該是全寬
    if (buttonBox) {
      expect(buttonBox.width).toBeGreaterThan(300);
    }
  });

  test('T070: TodoItem 在手機上使用適當的字體大小與間距', async ({ page }) => {
    await page.goto('/');

    // 新增一個待辦事項
    await page.fill('input[placeholder*="待辦事項"]', '測試手機響應式設計');
    await page.click('button:has-text("新增")');

    // 等待待辦事項出現
    const todoItem = page.locator('li').filter({ hasText: '測試手機響應式設計' });
    await expect(todoItem).toBeVisible();

    // 檢查待辦事項可見且可點擊
    const itemBox = await todoItem.boundingBox();
    expect(itemBox?.height).toBeGreaterThan(40); // 手機上應該有足夠的觸控區域
  });

  test('T071: Toast 通知在手機上採用全寬顯示', async ({ page }) => {
    await page.goto('/');

    // 新增待辦事項觸發 Toast
    await page.fill('input[placeholder*="待辦事項"]', '測試 Toast 響應式');
    await page.click('button:has-text("新增")');

    // 等待 Toast 出現
    const toast = page.locator('[data-testid="toast-success"]');
    await expect(toast).toBeVisible({ timeout: 2000 });

    // 檢查 Toast 寬度接近視窗寬度（扣除 padding）
    const toastBox = await toast.boundingBox();
    expect(toastBox?.width).toBeGreaterThan(300);
    expect(toastBox?.width).toBeLessThan(380); // 應該有左右 padding
  });
});

// === 平板測試 (768px - 1024px) ===
test.describe('平板裝置響應式設計 (768px - 1024px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('T068: App.vue 容器在平板上使用正確的寬度', async ({ page }) => {
    await page.goto('/');

    const container = page.locator('main').first();
    await expect(container).toBeVisible();

    const boundingBox = await container.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(400); // 平板應該更寬
    expect(boundingBox?.width).toBeLessThan(800);
  });

  test('T069: TodoInput 在平板上可能採用水平排列', async ({ page }) => {
    await page.goto('/');

    const todoInput = page.locator('input[placeholder*="待辦事項"]');
    const addButton = page.locator('button:has-text("新增")');

    await expect(todoInput).toBeVisible();
    await expect(addButton).toBeVisible();

    // 檢查元件佈局（平板可能是水平或垂直，取決於設計）
    const inputBox = await todoInput.boundingBox();
    const buttonBox = await addButton.boundingBox();

    expect(inputBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
  });

  test('T070: TodoList 在平板上正常顯示', async ({ page }) => {
    await page.goto('/');

    // 新增待辦事項
    await page.fill('input[placeholder*="待辦事項"]', '測試平板響應式設計');
    await page.click('button:has-text("新增")');

    const todoItem = page.locator('li').filter({ hasText: '測試平板響應式設計' });
    await expect(todoItem).toBeVisible();
  });
});

// === 桌面測試 (> 1024px) ===
test.describe('桌面裝置響應式設計 (> 1024px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('T068: App.vue 容器在桌面上使用最大寬度限制', async ({ page }) => {
    await page.goto('/');

    const container = page.locator('main').first();
    await expect(container).toBeVisible();

    const boundingBox = await container.boundingBox();
    // 桌面上容器應該有最大寬度限制（例如 max-w-4xl = 896px）
    expect(boundingBox?.width).toBeLessThan(1000);
  });

  test('T069: TodoInput 在桌面上採用水平排列', async ({ page }) => {
    await page.goto('/');

    const todoInput = page.locator('input[placeholder*="待辦事項"]');
    const addButton = page.locator('button:has-text("新增")');

    await expect(todoInput).toBeVisible();
    await expect(addButton).toBeVisible();

    const inputBox = await todoInput.boundingBox();
    const buttonBox = await addButton.boundingBox();

    expect(inputBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();

    // 桌面上應該是水平排列：按鈕與輸入框大致在同一水平線
    if (inputBox && buttonBox) {
      const verticalDiff = Math.abs(inputBox.y - buttonBox.y);
      expect(verticalDiff).toBeLessThan(20); // 允許些微差異
    }

    // 按鈕不應該是全寬
    if (buttonBox) {
      expect(buttonBox.width).toBeLessThan(200);
    }
  });

  test('T070: TodoItem 在桌面上使用適當的字體與間距', async ({ page }) => {
    await page.goto('/');

    // 新增待辦事項
    await page.fill('input[placeholder*="待辦事項"]', '測試桌面響應式設計');
    await page.click('button:has-text("新增")');

    const todoItem = page.locator('li').filter({ hasText: '測試桌面響應式設計' });
    await expect(todoItem).toBeVisible();

    // 桌面上應該有良好的可讀性
    const itemBox = await todoItem.boundingBox();
    expect(itemBox?.height).toBeGreaterThan(30);
  });

  test('T071: Dialog 在桌面上採用固定寬度', async ({ page }) => {
    await page.goto('/');

    // 新增並刪除待辦事項以觸發確認對話框
    await page.fill('input[placeholder*="待辦事項"]', '測試對話框響應式');
    await page.click('button:has-text("新增")');

    // 等待並點擊刪除按鈕
    const deleteButton = page.locator('button[aria-label*="刪除"]').first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // 檢查對話框
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // 桌面上對話框應該有固定寬度，不會過寬
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox?.width).toBeLessThan(600);
    expect(dialogBox?.width).toBeGreaterThan(300);
  });

  test('T071: Toast 在桌面上採用固定寬度', async ({ page }) => {
    await page.goto('/');

    // 觸發 Toast
    await page.fill('input[placeholder*="待辦事項"]', '測試 Toast 桌面版');
    await page.click('button:has-text("新增")');

    const toast = page.locator('[data-testid="toast-success"]');
    await expect(toast).toBeVisible({ timeout: 2000 });

    // 桌面上 Toast 應該有固定寬度
    const toastBox = await toast.boundingBox();
    expect(toastBox?.width).toBeLessThan(500);
    expect(toastBox?.width).toBeGreaterThan(250);
  });
});

// === 跨尺寸功能測試 ===
test.describe('跨尺寸功能一致性', () => {
  const viewports = [
    { name: '手機', width: 375, height: 667 },
    { name: '平板', width: 768, height: 1024 },
    { name: '桌面', width: 1440, height: 900 },
  ];

  for (const viewport of viewports) {
    test(`${viewport.name} (${viewport.width}px): 核心功能正常運作`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // 1. 新增待辦事項
      await page.fill('input[placeholder*="待辦事項"]', `${viewport.name}測試項目`);
      await page.click('button:has-text("新增")');

      const todoItem = page.locator('li').filter({ hasText: `${viewport.name}測試項目` });
      await expect(todoItem).toBeVisible();

      // 2. 切換完成狀態
      const checkbox = todoItem.locator('input[type="checkbox"]');
      await checkbox.check();
      await expect(checkbox).toBeChecked();

      // 3. 編輯待辦事項（點擊文字進入編輯模式）
      const todoText = todoItem.locator('span').filter({ hasText: `${viewport.name}測試項目` });
      await todoText.click();

      const editInput = todoItem.locator('input[type="text"]');
      await expect(editInput).toBeVisible();
      await editInput.fill(`${viewport.name}已編輯`);
      await editInput.press('Enter');

      await expect(todoItem).toContainText(`${viewport.name}已編輯`);

      // 4. 刪除待辦事項
      const deleteButton = todoItem.locator('button[aria-label*="刪除"]');
      await deleteButton.click();

      // 確認對話框應該出現
      const confirmDialog = page.locator('[role="dialog"]');
      await expect(confirmDialog).toBeVisible();

      // 點擊確認按鈕
      await page.click('button:has-text("確認")');

      // 待辦事項應該被刪除
      await expect(todoItem).not.toBeVisible();
    });
  }
});
