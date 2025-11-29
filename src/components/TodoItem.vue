<script setup lang="ts">
import type { TodoItem } from '@/types/todo';

// Props
interface Props {
  todo: TodoItem;
}

defineProps<Props>();
</script>

<template>
  <div
    class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
    :class="{ 'opacity-60': todo.completed }"
  >
    <!-- 核取方塊 (目前僅顯示,尚未實作互動) -->
    <input
      type="checkbox"
      :checked="todo.completed"
      class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
      aria-label="標記為已完成"
      disabled
    />

    <!-- 待辦事項文字 -->
    <span
      class="flex-1 text-gray-800 break-words"
      :class="{ 'line-through text-gray-500': todo.completed }"
    >
      {{ todo.text }}
    </span>
  </div>
</template>
