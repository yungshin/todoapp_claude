/**
 * 驗證工具函式
 * 用於驗證使用者輸入,防止 XSS 與資料錯誤
 */

/**
 * 驗證結果介面
 */
export interface ValidationResult {
  /**
   * 驗證是否通過
   */
  valid: boolean;

  /**
   * 錯誤訊息 (驗證失敗時)
   */
  error?: string;
}

/**
 * 待辦事項文字長度限制
 */
export const TODO_TEXT_MAX_LENGTH = 500;
export const TODO_TEXT_MIN_LENGTH = 1;

/**
 * 驗證字串是否非空白
 * @param value - 要驗證的字串
 * @returns 是否非空白 (去除前後空白後長度 > 0)
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * 驗證字串長度是否在指定範圍內
 * @param value - 要驗證的字串
 * @param min - 最小長度 (預設 1)
 * @param max - 最大長度 (預設 500)
 * @returns 長度是否在範圍內
 */
export function isValidLength(
  value: string,
  min: number = TODO_TEXT_MIN_LENGTH,
  max: number = TODO_TEXT_MAX_LENGTH
): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * 驗證待辦事項文字
 * @param text - 待辦事項文字
 * @returns 驗證結果 (包含 valid 與 error 訊息)
 */
export function validateTodoText(text: string): ValidationResult {
  // 檢查是否為空白
  if (!isNotEmpty(text)) {
    return {
      valid: false,
      error: '請輸入待辦事項內容'
    };
  }

  // 檢查長度是否超過限制
  const trimmedText = text.trim();
  if (trimmedText.length > TODO_TEXT_MAX_LENGTH) {
    return {
      valid: false,
      error: `待辦事項文字不可超過 ${TODO_TEXT_MAX_LENGTH} 字元 (目前: ${trimmedText.length} 字元)`
    };
  }

  // 檢查長度是否過短
  if (trimmedText.length < TODO_TEXT_MIN_LENGTH) {
    return {
      valid: false,
      error: '請輸入待辦事項內容'
    };
  }

  // 驗證通過
  return {
    valid: true
  };
}

/**
 * 驗證 UUID v4 格式
 * @param id - 要驗證的 UUID
 * @returns 是否為有效的 UUID v4 格式
 */
export function isValidUUID(id: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
}
