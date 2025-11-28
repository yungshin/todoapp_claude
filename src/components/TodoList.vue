<script setup lang="ts">
import { computed } from 'vue';
import { useTodosStore } from '@/stores/todos';
import TodoInput from './TodoInput.vue';
import TodoItem from './TodoItem.vue';
import EmptyState from './EmptyState.vue';

// 使用 Pinia store
const todosStore = useTodosStore();

// 取得分組後的待辦事項
const activeTodos = computed(() => todosStore.activeTodos);
const completedTodos = computed(() => todosStore.completedTodos);
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <TodoInput />

    <!-- 進行中組別 -->
    <section v-if="activeTodos.length > 0" class="space-y-3">
      <h2 class="text-lg font-semibold text-gray-700 pb-2 border-b border-gray-200">
        進行中
      </h2>
      <div class="space-y-2">
        <TodoItem
          v-for="todo in activeTodos"
          :key="todo.id"
          :todo="todo"
        />
      </div>
    </section>

    <!-- 已完成組別 -->
    <section v-if="completedTodos.length > 0" class="space-y-3">
      <h2 class="text-lg font-semibold text-gray-500 pb-2 border-b border-gray-200">
        已完成
      </h2>
      <div class="space-y-2">
        <TodoItem
          v-for="todo in completedTodos"
          :key="todo.id"
          :todo="todo"
        />
      </div>
    </section>

    <!-- 空白狀態 -->
    <EmptyState v-if="activeTodos.length === 0 && completedTodos.length === 0" />
  </div>
</template>
