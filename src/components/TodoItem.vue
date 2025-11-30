<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { TodoItem } from '@/types/todo';
import { useTodosStore } from '@/stores/todos';
import { useConfirm } from '@/composables/useConfirm';

// Props
interface Props {
  todo: TodoItem;
}

const props = defineProps<Props>();

// Store & Composables
const todosStore = useTodosStore();
const { confirm } = useConfirm();

// 編輯狀態管理
const isEditing = ref(false);
const editText = ref('');
const editError = ref('');
const editInputRef = ref<{ focus: () => void } | null>(null);

// Handlers
/**
 * 處理核取方塊點擊事件，切換待辦事項的完成狀態
 */
function handleToggle() {
  todosStore.toggleTodo(props.todo.id);
}

/**
 * 進入編輯模式
 */
async function enterEditMode() {
  isEditing.value = true;
  editText.value = props.todo.text;
  editError.value = '';

  // 等待 DOM 更新後自動聚焦輸入框
  await nextTick();
  editInputRef.value?.focus();
}

/**
 * 儲存編輯
 */
function saveEdit() {
  const trimmedText = editText.value.trim();

  // 驗證空白文字
  if (!trimmedText) {
    editError.value = '請輸入待辦事項內容';
    return;
  }

  try {
    // 呼叫 store 的 updateTodo
    todosStore.updateTodo(props.todo.id, trimmedText);

    // 成功後退出編輯模式
    exitEditMode();
  } catch (error) {
    // 顯示錯誤訊息
    editError.value = error instanceof Error ? error.message : '更新失敗';
  }
}

/**
 * 取消編輯
 */
function cancelEdit() {
  exitEditMode();
}

/**
 * 退出編輯模式
 */
function exitEditMode() {
  isEditing.value = false;
  editText.value = '';
  editError.value = '';
}

/**
 * 處理鍵盤事件
 */
function handleKeydown(event: { key: string }) {
  if (event.key === 'Enter') {
    saveEdit();
  } else if (event.key === 'Escape') {
    cancelEdit();
  }
}

/**
 * 當輸入改變時清除錯誤訊息
 */
function handleInput() {
  if (editError.value) {
    editError.value = '';
  }
}

/**
 * 處理刪除待辦事項
 * 顯示確認對話框,確認後才刪除
 */
async function handleDelete() {
  try {
    // 顯示確認對話框
    await confirm('確定要刪除此待辦事項嗎?', {
      title: '刪除確認',
      confirmText: '刪除',
      cancelText: '取消',
    });

    // 使用者確認後,執行刪除
    todosStore.deleteTodo(props.todo.id);
  } catch {
    // 使用者取消,不做任何處理
  }
}
</script>

<template>
  <!-- 響應式間距: 手機 p-3, 平板/桌面 p-4 -->
  <div
    data-testid="todo-item"
    class="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
    :class="{ 'opacity-60': todo.completed }"
  >
    <!-- 核取方塊 - 響應式尺寸 -->
    <input
      type="checkbox"
      :checked="todo.completed"
      class="w-5 h-5 md:w-5 md:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer flex-shrink-0"
      :aria-label="todo.completed ? '標記為未完成' : '標記為已完成'"
      @change="handleToggle"
    />

    <!-- 檢視模式：顯示待辦事項文字與刪除按鈕 -->
    <template v-if="!isEditing">
      <span
        data-testid="todo-text"
        class="flex-1 text-sm md:text-base text-gray-800 break-all cursor-pointer hover:text-blue-600 transition-colors"
        :class="{ 'line-through text-gray-500 hover:text-gray-600': todo.completed }"
        @click="enterEditMode"
      >
        {{ todo.text }}
      </span>

      <!-- 刪除按鈕 - 響應式尺寸 -->
      <button
        data-testid="delete-button"
        type="button"
        class="p-2 md:px-3 md:py-1.5 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex-shrink-0"
        aria-label="刪除待辦事項"
        @click="handleDelete"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </template>

    <!-- 編輯模式：顯示輸入框與按鈕 -->
    <div v-else class="flex-1 flex flex-col gap-2">
      <!-- 響應式按鈕佈局: 手機堆疊, 平板/桌面橫向 -->
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          ref="editInputRef"
          v-model="editText"
          data-testid="edit-input"
          type="text"
          maxlength="500"
          class="flex-1 px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500 focus:ring-red-500': editError }"
          @keydown="handleKeydown"
          @input="handleInput"
        />

        <div class="flex gap-2">
          <button
            data-testid="save-button"
            type="button"
            class="flex-1 sm:flex-none px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            @click="saveEdit"
          >
            儲存
          </button>

          <button
            data-testid="cancel-button"
            type="button"
            class="flex-1 sm:flex-none px-4 py-2 text-sm md:text-base bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            @click="cancelEdit"
          >
            取消
          </button>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <p v-if="editError" class="text-sm text-red-500">
        {{ editError }}
      </p>
    </div>
  </div>
</template>
