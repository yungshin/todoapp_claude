<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useTodosStore } from '@/stores/todos';
import TodoList from '@/components/TodoList.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ToastNotification from '@/components/ToastNotification.vue';

// 使用 Pinia store
const todosStore = useTodosStore();

// 警告橫幅關閉狀態（使用 sessionStorage，重新載入後會重置）
const BANNER_DISMISSED_KEY = 'storage-warning-dismissed';
const bannerDismissed = ref(false);

// 應用程式初始化時載入 localStorage 資料
onMounted(() => {
  todosStore.loadTodos();
  // 檢查橫幅是否在本次 session 中已關閉
  bannerDismissed.value = sessionStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
});

// 計算是否應顯示警告橫幅
const showWarningBanner = computed(() => {
  return todosStore.storageError && !bannerDismissed.value;
});

// 關閉警告橫幅
function dismissBanner(): void {
  bannerDismissed.value = true;
  // 記錄到 sessionStorage（重新載入後會重置）
  sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
    <!-- localStorage 失敗警告橫幅 -->
    <Transition name="slide-down">
      <div
        v-if="showWarningBanner"
        class="fixed top-0 left-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-3 z-40"
        role="alert"
        aria-live="assertive"
      >
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xl" aria-hidden="true">⚠️</span>
            <p class="font-medium">
              無法儲存資料，重新整理後將遺失所有變更
            </p>
          </div>
          <button
            aria-label="關閉警告"
            class="flex-shrink-0 text-yellow-900 hover:text-yellow-700 transition-colors"
            @click="dismissBanner"
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
      </div>
    </Transition>

    <!-- 響應式容器: 手機 px-4, 平板 px-6, 桌面 px-8, 最大寬度 1024px -->
    <header class="py-6 md:py-8 lg:py-10 text-center">
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
        待辦事項
      </h1>
      <p class="text-sm md:text-base text-gray-600">輕鬆管理您的每日任務</p>
    </header>

    <TodoList />

    <!-- 使用 Teleport 將 ConfirmDialog 渲染到 body,確保對話框在最上層 -->
    <Teleport to="body">
      <ConfirmDialog />
    </Teleport>

    <!-- 使用 Teleport 將 ToastNotification 渲染到 body,確保通知在最上層 -->
    <Teleport to="body">
      <ToastNotification />
    </Teleport>
  </main>
</template>

<style scoped>
/* 警告橫幅滑下動畫 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
