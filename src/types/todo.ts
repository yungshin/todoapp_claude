/**
 * Todo 待辦事項型別定義
 * 用於表示單一待辦事項,包含文字描述、完成狀態與時間戳記
 */
export interface TodoItem {
  /**
   * 唯一識別碼
   * 使用 crypto.randomUUID() 生成 UUID v4 格式
   * 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   */
  id: string;

  /**
   * 待辦事項文字描述
   * 長度限制: 1-500 字元,不可為空白字串
   */
  text: string;

  /**
   * 完成狀態
   * true: 已完成, false: 未完成
   * 預設為 false
   */
  completed: boolean;

  /**
   * 建立時間戳記
   * Unix milliseconds (Date.now())
   * 用於同組內排序,建立後不可變更
   */
  createdAt: number;

  /**
   * 最後更新時間戳記
   * Unix milliseconds (Date.now())
   * 用於追蹤修改歷史與未來的同步衝突解決
   * 新增時設定為與 createdAt 相同
   * 每次編輯或切換完成狀態時更新為當前時間
   */
  updatedAt: number;
}
