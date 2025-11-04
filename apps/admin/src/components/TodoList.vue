<template>
  <section class="todo">
    <h2>TodoList（本地持久化）</h2>
    <form @submit.prevent="addTodo">
      <input v-model.trim="newTitle" placeholder="输入待办..." />
      <button type="submit">添加</button>
    </form>

    <ul v-if="todos.length">
      <li v-for="t in todos" :key="t.id" :class="{ done: t.completed }">
        <input type="checkbox" :checked="t.completed" @change="toggle(t.id)" />
        <input
          class="title"
          :value="t.title"
          @change="onEdit(t.id, ($event.target as HTMLInputElement).value)"
        />
        <button @click="remove(t.id)">删除</button>
      </li>
    </ul>

    <p v-else class="empty">暂无待办，先添加一个吧～</p>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

type Todo = { id: number; title: string; completed: boolean }
const STORAGE_KEY = 'todos'

const newTitle = ref('')
const todos = ref<Todo[]>(load())

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Todo[]) : []
  } catch {
    return []
  }
}

watch(
  todos,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true }
)

function addTodo() {
  if (!newTitle.value) return
  const t: Todo = { id: Date.now(), title: newTitle.value, completed: false }
  todos.value.unshift(t)
  newTitle.value = ''
}

function toggle(id: number) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.completed = !t.completed
}

function onEdit(id: number, title: string) {
  const t = todos.value.find((x) => x.id === id)
  if (t) t.title = title.trim()
}

function remove(id: number) {
  todos.value = todos.value.filter((x) => x.id !== id)
}
</script>

<style scoped>
.todo {
  max-width: 720px;
  margin: 24px auto;
}
form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}
li.done .title {
  text-decoration: line-through;
  color: #888;
}
.empty {
  color: #666;
}
</style>