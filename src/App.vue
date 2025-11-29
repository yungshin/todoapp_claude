<script setup lang="ts">
import { onMounted } from 'vue';
import { useTodosStore } from '@/stores/todos';
import TodoList from '@/components/TodoList.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

// 使用 Pinia store
const todosStore = useTodosStore();

// 應用程式初始化時載入 localStorage 資料
onMounted(() => {
  todosStore.loadTodos();
});
</script>

<template>
  <main class="min-h-screen bg-gray-50">
    <div class="container mx-auto">
      <header class="py-8 text-center">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">待辦事項</h1>
        <p class="text-gray-600">輕鬆管理您的每日任務</p>
      </header>

      <TodoList />
    </div>

    <!-- 使用 Teleport 將 ConfirmDialog 渲染到 body,確保對話框在最上層 -->
    <Teleport to="body">
      <ConfirmDialog />
    </Teleport>
  </main>
</template>
