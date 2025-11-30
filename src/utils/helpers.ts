/**
 * 輔助工具函式
 * 提供通用的工具函式,如 ID 生成、日期格式化等
 */

/**
 * 生成唯一識別碼
 * 使用 crypto.randomUUID() 生成 UUID v4 格式
 * @returns UUID v4 格式的字串 (例: 550e8400-e29b-41d4-a716-446655440000)
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 格式化時間戳記為人類可讀格式
 * @param timestamp - Unix milliseconds 時間戳記
 * @param locale - 語言區域設定 (預設為 'zh-TW')
 * @returns 格式化後的日期時間字串
 * @example
 * formatTimestamp(1700740200000) // "2023/11/23 下午6:30:00"
 */
export function formatTimestamp(
  timestamp: number,
  locale: string = 'zh-TW'
): string {
  const date = new Date(timestamp);
  return date.toLocaleString(locale);
}

/**
 * 格式化時間戳記為相對時間 (例如: "剛剛", "5 分鐘前", "2 小時前")
 * @param timestamp - Unix milliseconds 時間戳記
 * @returns 相對時間字串
 * @example
 * formatRelativeTime(Date.now() - 60000) // "1 分鐘前"
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // 小於 1 分鐘
  if (diff < 60 * 1000) {
    return '剛剛';
  }

  // 小於 1 小時
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} 分鐘前`;
  }

  // 小於 1 天
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} 小時前`;
  }

  // 小於 7 天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} 天前`;
  }

  // 超過 7 天,顯示完整日期
  return formatTimestamp(timestamp);
}

/**
 * 截斷文字並加上省略符號
 * @param text - 要截斷的文字
 * @param maxLength - 最大長度 (預設 50)
 * @param ellipsis - 省略符號 (預設 '...')
 * @returns 截斷後的文字
 * @example
 * truncateText('這是一段很長的文字', 10) // "這是一段很長的文..."
 */
export function truncateText(
  text: string,
  maxLength: number = 50,
  ellipsis: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * 防抖函式
 * 延遲執行函式,直到最後一次呼叫後經過指定時間
 * @param fn - 要執行的函式
 * @param delay - 延遲時間 (毫秒)
 * @returns 防抖後的函式
 * @example
 * const debouncedSearch = debounce(() => search(), 300);
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
