<template>
  <!-- Toast 容器：固定在右上角，響應式位置 -->
  <div
    class="fixed top-4 right-4 left-4 md:left-auto z-50 flex flex-col gap-2 md:gap-3 pointer-events-none"
    role="region"
    aria-live="polite"
    aria-label="通知訊息"
  >
    <!-- Toast 清單：使用 TransitionGroup 處理多個 Toast 的動畫 -->
    <TransitionGroup name="toast">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        :data-testid="`toast-${toast.type}`"
        :class="[
          'pointer-events-auto',
          'w-full md:min-w-[300px] md:max-w-md',
          'px-4 py-3 rounded-lg shadow-lg',
          'flex items-start gap-3',
          'text-white text-sm md:text-base',
          toastTypeClasses[toast.type],
        ]"
        role="alert"
      >
        <!-- 圖示 -->
        <span class="flex-shrink-0 text-xl" aria-hidden="true">
          {{ toastIcons[toast.type] }}
        </span>

        <!-- 訊息 -->
        <p class="flex-1 text-sm font-medium break-words">
          {{ toast.message }}
        </p>

        <!-- 關閉按鈕 -->
        <button
          :aria-label="`關閉${toast.type === 'success' ? '成功' : toast.type === 'error' ? '錯誤' : toast.type === 'warning' ? '警告' : '資訊'}訊息`"
          class="flex-shrink-0 text-white hover:opacity-75 transition-opacity"
          @click="handleClose(toast.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import type { ToastType } from '@/types/ui';

const uiStore = useUiStore();

/**
 * Toast 類型對應的 Tailwind CSS 類別
 */
const toastTypeClasses: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

/**
 * Toast 類型對應的圖示
 */
const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

/**
 * 處理關閉 Toast
 */
function handleClose(id: string): void {
  uiStore.removeToast(id);
}
</script>

<style scoped>
/* Toast 進入/離開動畫 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Toast 移動動畫（當其他 Toast 被移除時） */
.toast-move {
  transition: transform 0.3s ease;
}
</style>
