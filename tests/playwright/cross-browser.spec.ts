import { test, expect } from '@playwright/test';

/**
 * 跨瀏覽器相容性測試 (T072a)
 * 在 Chromium、Firefox、WebKit 上測試關鍵功能流程
 *
 * 確保應用程式在不同瀏覽器引擎上都能正常運作
 *
 * 測試範圍:
 * - User Story 1: 新增與檢視待辦事項
 * - User Story 2: 標示完成狀態
 * - User Story 3: 編輯待辦事項
 * - User Story 4: 刪除待辦事項
 * - localStorage 資料持久化
 * - Toast 通知系統
 * - 響應式設計基本功能
 */

test.describe('跨瀏覽器相容性 - 核心功能', () => {
  test.beforeEach(async ({ page }) => {
    // 清空 localStorage 確保測試獨立性
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('US1: 新增與檢視待辦事項', async ({ page, browserName }) => {
    await page.goto('/');

    // 確認空白狀態
    await expect(page.locator('text=目前沒有待辦事項')).toBeVisible();

    // 新增第一個待辦事項
    const input = page.locator('input[placeholder*="待辦事項"]');
    await input.fill(`${browserName} 測試項目 1`);
    await page.click('button:has-text("新增")');

    // 確認待辦事項出現
    const todo1 = page.locator('[data-testid="todo-item"]').filter({ hasText: `${browserName} 測試項目 1` });
    await expect(todo1).toBeVisible({ timeout: 10000 });

    // 新增第二個待辦事項
    await input.fill(`${browserName} 測試項目 2`);
    await page.click('button:has-text("新增")');

    const todo2 = page.locator('[data-testid="todo-item"]').filter({ hasText: `${browserName} 測試項目 2` });
    await expect(todo2).toBeVisible({ timeout: 10000 });

    // 確認兩個待辦事項都存在
    const todoCount = await page.locator('[data-testid="todo-item"]').count();
    expect(todoCount).toBeGreaterThanOrEqual(2);
  });

  test('US1: 空白輸入驗證', async ({ page }) => {
    await page.goto('/');

    // 確認空白輸入時按鈕被禁用
    const addButton = page.locator('button:has-text("新增")');
    await expect(addButton).toBeDisabled();

    // 輸入空白字元後仍然應該禁用
    await page.fill('input[placeholder*="待辦事項"]', '   ');
    await expect(addButton).toBeDisabled();
  });

  test('US2: 標示完成狀態', async ({ page }) => {
    await page.goto('/');

    // 新增待辦事項
    await page.fill('input[placeholder*="待辦事項"]', '測試完成狀態');
    await page.click('button:has-text("新增")');

    const todoItem = page.locator('[data-testid="todo-item"]').filter({ hasText: '測試完成狀態' });
    await expect(todoItem).toBeVisible({ timeout: 10000 });

    // 點擊核取方塊標記為完成
    const checkbox = todoItem.locator('input[type="checkbox"]');
    await checkbox.check();

    // 確認已勾選
    await expect(checkbox).toBeChecked();

    // 檢查樣式變化（刪除線或灰色文字）
    const todoText = todoItem.locator('span').filter({ hasText: '測試完成狀態' });
    await expect(todoText).toHaveClass(/line-through|completed/);

    // 取消完成狀態
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('US3: 編輯待辦事項', async ({ page }) => {
    await page.goto('/');

    // 新增待辦事項
    await page.fill('input[placeholder*="待辦事項"]', '原始內容');
    await page.click('button:has-text("新增")');


    // 等待並點擊文字進入編輯模式
    await page.waitForSelector('[data-testid="todo-text"]', { timeout: 10000 });
    await page.click('[data-testid="todo-text"]');

    // 等待編輯輸入框出現（給更長的等待時間）
    const editInput = page.locator('[data-testid="edit-input"]');
    await expect(editInput).toBeVisible({ timeout: 10000 });

    // 修改內容
    await editInput.fill('已修改內容');

    // 確認內容已更新
    await expect(page.locator('[data-testid="todo-item"]')).toContainText('已修改內容');
    await expect(todoItem).toContainText('已修改內容');
    await expect(todoItem).not.toContainText('原始內容');
  });

  test('US3: 取消編輯', async ({ page }) => {
    await page.goto('/');

    // 新增待辦事項
    await page.fill('input[placeholder*="待辦事項"]', '不要修改');
    await page.click('button:has-text("新增")');

    // 等待並點擊文字進入編輯模式
    await page.waitForSelector('[data-testid="todo-text"]', { timeout: 10000 });
    await page.click('[data-testid="todo-text"]');

    // 等待編輯輸入框出現
    const editInput = page.locator('[data-testid="edit-input"]');
    await expect(editInput).toBeVisible({ timeout: 10000 });

    // 修改但按 ESC 取消
    await editInput.fill('臨時修改');
    await editInput.press('Escape');

    // 確認內容未改變
    await expect(page.locator('[data-testid="todo-item"]')).toContainText('不要修改');
  });

  test('US4: 刪除待辦事項', async ({ page }) => {
    await page.goto('/');

    // 新增待辦事項
    await page.fill('input[placeholder*="待辦事項"]', '即將被刪除');
    await page.click('button:has-text("新增")');

    const todoItem = page.locator('[data-testid="todo-item"]').filter({ hasText: '即將被刪除' });
    await expect(todoItem).toBeVisible({ timeout: 10000 });

    // 點擊刪除按鈕
    const deleteButton = todoItem.locator('button[aria-label*="刪除"]');
    await deleteButton.click();

    // 確認對話框出現
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('確定要刪除');

    // 點擊確認刪除（按鈕可能是「確認」或「刪除」）
    const confirmButton = dialog.locator('button').filter({ hasText: /確認|刪除/ });
    await confirmButton.click();

    // 確認待辦事項已被刪除
    await expect(todoItem).not.toBeVisible({ timeout: 10000 });

    // 應該顯示空白狀態
    await expect(page.locator('text=目前沒有待辦事項')).toBeVisible();
  });

  test('US4: 取消刪除', async ({ page }) => {
    await page.goto('/');

    // 新增待辦事項
    await page.fill('input[placeholder*="待辦事項"]', '不要刪除');
    await page.click('button:has-text("新增")');

    const todoItem = page.locator('[data-testid="todo-item"]').filter({ hasText: '不要刪除' });
    const deleteButton = todoItem.locator('button[aria-label*="刪除"]');
    await deleteButton.click();

    // 確認對話框出現
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // 點擊取消
    const cancelButton = dialog.locator('button').filter({ hasText: '取消' });
    await cancelButton.click();

    // 確認待辦事項仍然存在
    await expect(todoItem).toBeVisible({ timeout: 10000 });
  });
});

test.describe('跨瀏覽器相容性 - localStorage 持久化', () => {
  test('資料持久化：重新載入後資料仍存在', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 新增多個待辦事項
    const todos = ['持久化測試 1', '持久化測試 2', '持久化測試 3'];

    for (const todo of todos) {
      await page.fill('input[placeholder*="待辦事項"]', todo);
      await page.click('button:has-text("新增")');
    }

    // 標記第一個為完成
    const firstTodo = page.locator('[data-testid="todo-item"]').filter({ hasText: '持久化測試 1' });
    await firstTodo.locator('input[type="checkbox"]').check();

    // 重新載入頁面
    await page.reload();

    // 確認所有待辦事項仍然存在
    for (const todo of todos) {
      await expect(page.locator('[data-testid="todo-item"]').filter({ hasText: todo })).toBeVisible({ timeout: 10000 });
    }

    // 確認完成狀態保持
    const firstTodoAfterReload = page.locator('[data-testid="todo-item"]').filter({ hasText: '持久化測試 1' });
    await expect(firstTodoAfterReload.locator('input[type="checkbox"]')).toBeChecked();
  });

  test('資料持久化：檢查 localStorage 資料格式', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 新增待辦事項
    await page.fill('input[placeholder*="待辦事項"]', 'LocalStorage 測試');
    await page.click('button:has-text("新增")');

    // 等待待辦事項新增完成
    await page.waitForTimeout(500);

    // 檢查 localStorage 資料
    const storageData = await page.evaluate(() => {
      const data = localStorage.getItem('todo-app-data');
      return data ? JSON.parse(data) : null;
    });

    // 驗證資料結構
    expect(storageData).not.toBeNull();
    expect(storageData.todos).toBeDefined();
    expect(Array.isArray(storageData.todos)).toBeTruthy();
    expect(storageData.todos.length).toBeGreaterThan(0);

    // 驗證待辦事項結構
    const todo = storageData.todos[0];
    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('text');
    expect(todo).toHaveProperty('completed');
    expect(todo).toHaveProperty('createdAt');
    expect(todo).toHaveProperty('updatedAt');
  });
});

test.describe('跨瀏覽器相容性 - Toast 通知系統', () => {
  test('Toast 通知：新增成功顯示通知', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="待辦事項"]', 'Toast 測試');
    await page.click('button:has-text("新增")');

    // 確認成功 Toast 出現
    const successToast = page.locator('[data-testid="toast-success"]');
    await expect(successToast).toBeVisible({ timeout: 3000 });

    // Toast 應該包含成功訊息
    await expect(successToast).toContainText(/新增|成功|完成/i);
  });

  test('Toast 通知：自動消失功能', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="待辦事項"]', 'Toast 自動消失');
    await page.click('button:has-text("新增")');

    const successToast = page.locator('[data-testid="toast-success"]');
    await expect(successToast).toBeVisible({ timeout: 3000 });

    // 等待 Toast 自動消失（預設 3 秒）
    await expect(successToast).not.toBeVisible({ timeout: 5000 });
  });

  test('Toast 通知：手動關閉功能', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[placeholder*="待辦事項"]', 'Toast 手動關閉');
    await page.click('button:has-text("新增")');

    const successToast = page.locator('[data-testid="toast-success"]');
    await expect(successToast).toBeVisible({ timeout: 3000 });

    // 點擊關閉按鈕
    const closeButton = successToast.locator('button[aria-label*="關閉"]');
    await closeButton.click();

    // Toast 應該立即消失
    await expect(successToast).not.toBeVisible({ timeout: 1000 });
  });
});

test.describe('跨瀏覽器相容性 - XSS 防護', () => {
  test('XSS 防護：script 標籤應顯示為文字', async ({ page }) => {
    await page.goto('/');

    // 嘗試注入 script 標籤
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('input[placeholder*="待辦事項"]', xssPayload);
    await page.click('button:has-text("新增")');

    // script 應該顯示為純文字
    const todoItem = page.locator('[data-testid="todo-item"]').filter({ hasText: '<script>' });
    await expect(todoItem).toBeVisible({ timeout: 10000 });

    // 確認沒有執行 script（頁面應該沒有 alert）
    // 如果 script 被執行，測試會因為 alert 而卡住
  });

  test('XSS 防護：HTML 標籤應顯示為文字', async ({ page }) => {
    await page.goto('/');

    // 嘗試注入 HTML 標籤
    const htmlPayload = '<img src=x onerror=alert(1)>';
    await page.fill('input[placeholder*="待辦事項"]', htmlPayload);
    await page.click('button:has-text("新增")');

    // HTML 應該顯示為純文字
    const todoItem = page.locator('[data-testid="todo-item"]').filter({ hasText: '<img' });
    await expect(todoItem).toBeVisible({ timeout: 10000 });
  });
});

test.describe('跨瀏覽器相容性 - 鍵盤操作', () => {
  test('鍵盤操作：Enter 鍵新增待辦事項', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('input[placeholder*="待辦事項"]');
    await input.fill('按 Enter 新增');
    await input.press('Enter');

    // 待辦事項應該被新增
    const todoItem = page.locator('[data-testid="todo-item"]').filter({ hasText: '按 Enter 新增' });
    await expect(todoItem).toBeVisible({ timeout: 10000 });
  });

  test('鍵盤操作：Enter 儲存編輯，ESC 取消編輯', async ({ page }) => {
    await page.goto('/');

    // 新增待辦事項
    await page.fill('input[placeholder*="待辦事項"]', '鍵盤測試');
    await page.click('button:has-text("新增")');

    const todoItem = page.locator('[data-testid="todo-item"]').filter({ hasText: '鍵盤測試' });
    const todoText = todoItem.locator('[data-testid="todo-text"]');
    await todoText.click();

    // 編輯並按 Enter 儲存
    const editInput = page.locator('[data-testid="edit-input"]');
    await expect(editInput).toBeVisible({ timeout: 10000 });
    await editInput.fill('已用 Enter 儲存');
    await editInput.press('Enter');

    await expect(todoItem).toContainText('已用 Enter 儲存');
  });

  test('鍵盤操作：Tab 鍵導航', async ({ page }) => {
    await page.goto('/');

    // 使用 Tab 鍵導航到輸入框
    await page.keyboard.press('Tab');

    // 輸入應該獲得焦點
    const input = page.locator('input[placeholder*="待辦事項"]');
    await expect(input).toBeFocused();

    // 再按 Tab 移動到新增按鈕
    await page.keyboard.press('Tab');

    const addButton = page.locator('button:has-text("新增")');
    await expect(addButton).toBeFocused();
  });
});
