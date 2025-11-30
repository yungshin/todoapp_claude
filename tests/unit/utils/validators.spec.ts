import { describe, it, expect } from 'vitest';
import {
  isNotEmpty,
  isValidLength,
  validateTodoText,
  isValidUUID,
  TODO_TEXT_MAX_LENGTH,
  TODO_TEXT_MIN_LENGTH
} from '../../../src/utils/validators';

describe('validators', () => {
  describe('isNotEmpty', () => {
    it('應該回傳 true 當文字非空白', () => {
      expect(isNotEmpty('hello')).toBe(true);
      expect(isNotEmpty('  hello  ')).toBe(true);
      expect(isNotEmpty('a')).toBe(true);
    });

    it('應該回傳 false 當文字為空白', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
      expect(isNotEmpty('\t\n')).toBe(false);
    });
  });

  describe('isValidLength', () => {
    it('應該回傳 true 當長度在範圍內', () => {
      expect(isValidLength('a')).toBe(true);
      expect(isValidLength('hello')).toBe(true);
      expect(isValidLength('a'.repeat(500))).toBe(true);
      expect(isValidLength('  hello  ', 1, 500)).toBe(true); // 自動 trim
    });

    it('應該回傳 false 當長度超過上限', () => {
      expect(isValidLength('a'.repeat(501))).toBe(false);
      expect(isValidLength('a'.repeat(1000))).toBe(false);
    });

    it('應該回傳 false 當長度小於下限', () => {
      expect(isValidLength('')).toBe(false);
      expect(isValidLength('   ')).toBe(false);
    });

    it('應該支援自訂長度範圍', () => {
      expect(isValidLength('hello', 1, 10)).toBe(true);
      expect(isValidLength('hello', 6, 10)).toBe(false); // 長度 5 < 6
      expect(isValidLength('hello', 1, 4)).toBe(false); // 長度 5 > 4
    });
  });

  describe('validateTodoText', () => {
    it('應該通過驗證當文字有效', () => {
      const result = validateTodoText('完成專案規劃');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('應該通過驗證當文字長度為 1', () => {
      const result = validateTodoText('a');
      expect(result.valid).toBe(true);
    });

    it('應該通過驗證當文字長度為 500', () => {
      const result = validateTodoText('a'.repeat(500));
      expect(result.valid).toBe(true);
    });

    it('應該自動 trim 文字並驗證', () => {
      const result = validateTodoText('  完成專案規劃  ');
      expect(result.valid).toBe(true);
    });

    it('應該拒絕空白文字', () => {
      const result1 = validateTodoText('');
      expect(result1.valid).toBe(false);
      expect(result1.error).toBe('請輸入待辦事項內容');

      const result2 = validateTodoText('   ');
      expect(result2.valid).toBe(false);
      expect(result2.error).toBe('請輸入待辦事項內容');
    });

    it('應該拒絕超過 500 字元的文字', () => {
      const longText = 'a'.repeat(501);
      const result = validateTodoText(longText);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('不可超過 500 字元');
      expect(result.error).toContain('501 字元');
    });

    it('應該拒絕超長文字並顯示正確字數', () => {
      const longText = 'a'.repeat(1000);
      const result = validateTodoText(longText);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        `待辦事項文字不可超過 ${TODO_TEXT_MAX_LENGTH} 字元 (目前: 1000 字元)`
      );
    });

    it('應該正確處理 Unicode 字元', () => {
      const emojiText = '完成專案 🎉'.repeat(50); // 約 500 字元
      const result = validateTodoText(emojiText);
      // 長度應該基於字元數,不是 bytes
      expect(result.valid).toBe(emojiText.trim().length <= 500);
    });
  });

  describe('isValidUUID', () => {
    it('應該回傳 true 當 UUID 格式正確', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('6ba7b810-9dad-41d1-80b4-00c04fd430c8')).toBe(true);
      expect(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
    });

    it('應該回傳 true 當 UUID 為大寫', () => {
      expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    });

    it('應該回傳 false 當 UUID 格式錯誤', () => {
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false); // 太短
      expect(isValidUUID('550e8400-e29b-51d4-a716-446655440000')).toBe(false); // 版本錯誤 (5 而非 4)
      expect(isValidUUID('not-a-uuid-at-all')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });

    it('應該驗證 UUID v4 格式 (第三組第一個字元為 4)', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true); // 4xxx
      expect(isValidUUID('550e8400-e29b-31d4-a716-446655440000')).toBe(false); // 3xxx
      expect(isValidUUID('550e8400-e29b-51d4-a716-446655440000')).toBe(false); // 5xxx
    });

    it('應該驗證 UUID v4 格式 (第四組第一個字元為 8/9/a/b)', () => {
      expect(isValidUUID('550e8400-e29b-41d4-8716-446655440000')).toBe(true); // 8xxx
      expect(isValidUUID('550e8400-e29b-41d4-9716-446655440000')).toBe(true); // 9xxx
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true); // axxx
      expect(isValidUUID('550e8400-e29b-41d4-b716-446655440000')).toBe(true); // bxxx
      expect(isValidUUID('550e8400-e29b-41d4-c716-446655440000')).toBe(false); // cxxx (無效)
    });
  });

  describe('常數', () => {
    it('應該定義正確的長度限制常數', () => {
      expect(TODO_TEXT_MAX_LENGTH).toBe(500);
      expect(TODO_TEXT_MIN_LENGTH).toBe(1);
    });
  });
});
