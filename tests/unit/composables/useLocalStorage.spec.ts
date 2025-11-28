import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage } from '@/composables/useLocalStorage';

describe('useLocalStorage', () => {
  const TEST_KEY = 'test-key';
  const DEFAULT_VALUE = { items: [], count: 0 };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('load', () => {
    it('should load data from localStorage', () => {
      const testData = { items: ['item1', 'item2'], count: 2 };
      localStorage.setItem(TEST_KEY, JSON.stringify(testData));

      const { load } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const result = load();

      expect(result).toEqual(testData);
    });

    it('should return default value when localStorage is empty', () => {
      const { load } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const result = load();

      expect(result).toEqual(DEFAULT_VALUE);
    });

    it('should return default value when key does not exist', () => {
      localStorage.setItem('other-key', JSON.stringify({ data: 'test' }));

      const { load } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const result = load();

      expect(result).toEqual(DEFAULT_VALUE);
    });

    it('should handle corrupted JSON data', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem(TEST_KEY, 'invalid json {]');

      const { load } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const result = load();

      expect(result).toEqual(DEFAULT_VALUE);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('localStorage read error'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle localStorage access error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });

      const { load } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const result = load();

      expect(result).toEqual(DEFAULT_VALUE);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      getItemSpy.mockRestore();
    });

    it('should handle null values in localStorage', () => {
      localStorage.setItem(TEST_KEY, 'null');

      const { load } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const result = load();

      expect(result).toBeNull();
    });

    it('should load complex nested objects', () => {
      const complexData = {
        todos: [
          { id: '1', text: 'Test', completed: false, createdAt: 123, updatedAt: 123 },
          { id: '2', text: 'Test 2', completed: true, createdAt: 456, updatedAt: 456 },
        ],
        version: '1.0',
        lastSyncedAt: '2025-01-01T00:00:00Z',
      };

      localStorage.setItem(TEST_KEY, JSON.stringify(complexData));

      const { load } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const result = load();

      expect(result).toEqual(complexData);
    });
  });

  describe('save', () => {
    it('should save data to localStorage', () => {
      const { save } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const testData = { items: ['item1', 'item2'], count: 2 };

      const result = save(testData);

      expect(result).toBe(true);
      const savedData = localStorage.getItem(TEST_KEY);
      expect(savedData).toBe(JSON.stringify(testData));
    });

    it('should save default value', () => {
      const { save } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);

      const result = save(DEFAULT_VALUE);

      expect(result).toBe(true);
      const savedData = localStorage.getItem(TEST_KEY);
      expect(savedData).toBe(JSON.stringify(DEFAULT_VALUE));
    });

    it('should save null value', () => {
      const { save } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);

      const result = save(null);

      expect(result).toBe(true);
      const savedData = localStorage.getItem(TEST_KEY);
      expect(savedData).toBe('null');
    });

    it('should save empty object', () => {
      const { save } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);

      const result = save({});

      expect(result).toBe(true);
      const savedData = localStorage.getItem(TEST_KEY);
      expect(savedData).toBe('{}');
    });

    it('should save empty array', () => {
      const { save } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);

      const result = save([]);

      expect(result).toBe(true);
      const savedData = localStorage.getItem(TEST_KEY);
      expect(savedData).toBe('[]');
    });

    it('should save complex nested objects', () => {
      const { save } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const complexData = {
        todos: [
          { id: '1', text: 'Test', completed: false, createdAt: 123, updatedAt: 123 },
        ],
        version: '1.0',
      };

      const result = save(complexData);

      expect(result).toBe(true);
      const savedData = localStorage.getItem(TEST_KEY);
      expect(JSON.parse(savedData!)).toEqual(complexData);
    });

    it('should handle QuotaExceededError', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      const quotaError = new DOMException('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';

      setItemSpy.mockImplementation(() => {
        throw quotaError;
      });

      const { save } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const result = save({ large: 'data' });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('localStorage write error'),
        quotaError
      );

      consoleSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('should handle generic storage error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      const genericError = new Error('Storage not available');
      setItemSpy.mockImplementation(() => {
        throw genericError;
      });

      const { save } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const result = save({ data: 'test' });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('should overwrite existing data', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify({ old: 'data' }));

      const { save } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const newData = { new: 'data' };

      save(newData);

      const savedData = localStorage.getItem(TEST_KEY);
      expect(JSON.parse(savedData!)).toEqual(newData);
    });
  });

  describe('clear', () => {
    it('should remove data from localStorage', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify({ data: 'test' }));

      const { clear } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      clear();

      const result = localStorage.getItem(TEST_KEY);
      expect(result).toBeNull();
    });

    it('should not throw error when key does not exist', () => {
      const { clear } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);

      expect(() => clear()).not.toThrow();
    });

    it('should only clear specific key', () => {
      localStorage.setItem(TEST_KEY, JSON.stringify({ data: 'test' }));
      localStorage.setItem('other-key', JSON.stringify({ other: 'data' }));

      const { clear } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      clear();

      expect(localStorage.getItem(TEST_KEY)).toBeNull();
      expect(localStorage.getItem('other-key')).not.toBeNull();
    });
  });

  describe('integration', () => {
    it('should save and load data correctly', () => {
      const { save, load } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const testData = { items: ['a', 'b', 'c'], count: 3 };

      save(testData);
      const loaded = load();

      expect(loaded).toEqual(testData);
    });

    it('should return default value after clear', () => {
      const { save, load, clear } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);
      const testData = { items: ['a'], count: 1 };

      save(testData);
      clear();
      const loaded = load();

      expect(loaded).toEqual(DEFAULT_VALUE);
    });

    it('should handle multiple save and load cycles', () => {
      const { save, load } = useLocalStorage(TEST_KEY, DEFAULT_VALUE);

      const data1 = { items: ['1'], count: 1 };
      save(data1);
      expect(load()).toEqual(data1);

      const data2 = { items: ['1', '2'], count: 2 };
      save(data2);
      expect(load()).toEqual(data2);

      const data3 = { items: [], count: 0 };
      save(data3);
      expect(load()).toEqual(data3);
    });
  });

  describe('type safety', () => {
    it('should work with different data types', () => {
      // String type
      const stringStorage = useLocalStorage<string>('string-key', 'default');
      stringStorage.save('test string');
      expect(stringStorage.load()).toBe('test string');

      // Number type
      const numberStorage = useLocalStorage<number>('number-key', 0);
      numberStorage.save(42);
      expect(numberStorage.load()).toBe(42);

      // Boolean type
      const booleanStorage = useLocalStorage<boolean>('boolean-key', false);
      booleanStorage.save(true);
      expect(booleanStorage.load()).toBe(true);

      // Array type
      const arrayStorage = useLocalStorage<string[]>('array-key', []);
      arrayStorage.save(['a', 'b', 'c']);
      expect(arrayStorage.load()).toEqual(['a', 'b', 'c']);
    });
  });
});
