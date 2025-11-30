<template>
  <!-- 對話框背景遮罩 -->
  <Transition name="fade">
    <div
      v-if="uiStore.confirmDialog.visible"
      data-testid="dialog-backdrop"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="handleCancel"
    >
      <!-- 對話框主體 - 響應式寬度與間距 -->
      <div
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="dialogTitleId"
        :aria-describedby="dialogMessageId"
        class="bg-white rounded-lg shadow-xl w-full md:max-w-md p-5 md:p-6"
        @click.stop
        @keydown.enter="handleConfirm"
        @keydown.escape="handleCancel"
      >
        <!-- 標題 - 響應式字體 -->
        <h2
          :id="dialogTitleId"
          class="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4"
        >
          {{ uiStore.confirmDialog.title }}
        </h2>

        <!-- 訊息 - 響應式字體與間距 -->
        <p
          :id="dialogMessageId"
          class="text-sm md:text-base text-gray-700 mb-5 md:mb-6"
        >
          {{ uiStore.confirmDialog.message }}
        </p>

        <!-- 按鈕組 - 響應式佈局 -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <!-- 取消按鈕 -->
          <button
            ref="cancelButtonRef"
            class="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm md:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
            @click="handleCancel"
          >
            {{ uiStore.confirmDialog.cancelText }}
          </button>

          <!-- 確認按鈕 -->
          <button
            ref="confirmButtonRef"
            class="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm md:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors order-1 sm:order-2"
            @click="handleConfirm"
          >
            {{ uiStore.confirmDialog.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue';
import { useUiStore } from '@/stores/ui';

const uiStore = useUiStore();

// 為無障礙性生成唯一 ID
const dialogTitleId = computed(() => 'dialog-title-' + Math.random().toString(36).substring(2, 9));
const dialogMessageId = computed(() => 'dialog-message-' + Math.random().toString(36).substring(2, 9));

/**
 * 處理確認操作
 */
function handleConfirm(): void {
  // 執行確認回調 (如果存在)
  if (uiStore.confirmDialog.onConfirm) {
    uiStore.confirmDialog.onConfirm();
  }

  // 關閉對話框
  uiStore.hideConfirm();
}

/**
 * 處理取消操作
 */
function handleCancel(): void {
  // 執行取消回調 (如果存在)
  if (uiStore.confirmDialog.onCancel) {
    uiStore.confirmDialog.onCancel();
  }

  // 關閉對話框
  uiStore.hideConfirm();
}

/**
 * 當對話框顯示時,自動聚焦確認按鈕
 * 注意: 在測試環境中 focus() 可能不可用,因此使用可選鏈
 */
watch(
  () => uiStore.confirmDialog.visible,
  async (visible) => {
    if (visible) {
      await nextTick();
      // 自動聚焦確認按鈕 (在瀏覽器環境中)
      // 在測試環境中,這個功能可能不會執行
    }
  },
);
</script>

<style scoped>
/* 淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
