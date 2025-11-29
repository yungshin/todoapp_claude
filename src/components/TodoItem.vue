<script setup lang="ts">
import type { TodoItem } from '@/types/todo';
import { useTodosStore } from '@/stores/todos';

// Props
interface Props {
  todo: TodoItem;
}

const props = defineProps<Props>();

// Store
const todosStore = useTodosStore();

// Handlers
/**
 * 處理核取方塊點擊事件，切換待辦事項的完成狀態
 */
function handleToggle() {
  todosStore.toggleTodo(props.todo.id);
}
</script>

<template>
  <div
    class="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
    :class="{ 'opacity-60': todo.completed }"
  >
    <!-- 核取方塊 -->
    <input
      type="checkbox"
      :checked="todo.completed"
      @change="handleToggle"
      class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
      :aria-label="todo.completed ? '標記為未完成' : '標記為已完成'"
    />

    <!-- 待辦事項文字 -->
    <span
      class="flex-1 text-gray-800 break-all"
      :class="{ 'line-through text-gray-500': todo.completed }"
    >
      {{ todo.text }}
    </span>
  </div>
</template>
