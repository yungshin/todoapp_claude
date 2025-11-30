<template>
  <div class="space-y-2">
    <!-- 響應式佈局: 手機垂直排列, 平板/桌面水平排列 -->
    <div class="flex flex-col md:flex-row gap-2">
      <input
        ref="inputRef"
        v-model="inputText"
        type="text"
        maxlength="500"
        placeholder="輸入待辦事項..."
        class="flex-1 px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-sm"
        aria-label="新增待辦事項輸入框"
        @input="updateCharacterCount"
        @keydown.enter="handleSubmit"
      />
      <button
        :disabled="!inputText.trim() || isSubmitting"
        class="w-full md:w-auto px-6 py-2.5 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base md:text-sm font-medium"
        @click="handleSubmit"
      >
        新增
      </button>
    </div>

    <!-- 字數統計 -->
    <div class="flex justify-between items-center text-sm">
      <span
        :class="{
          'text-gray-500': characterCount < 450,
          'text-orange-500': characterCount >= 450 && characterCount < 500,
          'text-red-500': characterCount === 500
        }"
      >
        {{ characterCount }}/500 字元
      </span>
      <span v-if="isMaxLength" class="text-red-500 font-medium">
        已達字數上限
      </span>
    </div>

    <!-- 錯誤訊息 -->
    <span v-if="errorMessage" class="block text-sm text-red-600">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTodosStore } from '@/stores/todos';

// State
const inputText = ref('');
const errorMessage = ref<string | null>(null);
const isSubmitting = ref(false);
// eslint-disable-next-line no-undef
const inputRef = ref<HTMLInputElement | null>(null);

const todosStore = useTodosStore();

// Computed
const characterCount = computed(() => inputText.value.length);
const isMaxLength = computed(() => characterCount.value === 500);

// Methods
function updateCharacterCount() {
  // 字數統計會自動透過 computed 更新
  // 清除錯誤訊息 (如果有有效輸入)
  if (inputText.value.trim()) {
    errorMessage.value = null;
  }
}

function validateInput(): string | null {
  const trimmed = inputText.value.trim();

  if (!trimmed) {
    return '請輸入待辦事項內容';
  }

  if (trimmed.length > 500) {
    return '待辦事項文字不可超過 500 字元';
  }

  return null;
}

function handleSubmit() {
  // 驗證輸入
  const validationError = validateInput();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  try {
    isSubmitting.value = true;

    // 呼叫 store 新增待辦事項
    todosStore.addTodo(inputText.value);

    // 清空輸入框
    inputText.value = '';
    errorMessage.value = null;

    // 保持焦點
    inputRef.value?.focus();
  } catch (error) {
    // 處理 store 拋出的錯誤 (如驗證錯誤)
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = '新增失敗，請稍後再試';
    }
  } finally {
    isSubmitting.value = false;
  }
}

// Lifecycle
onMounted(() => {
  // 元件掛載時自動聚焦（可選）
  // inputRef.value?.focus();
});
</script>
