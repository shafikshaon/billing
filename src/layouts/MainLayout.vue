<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import { resetStore } from '../store'

const route = useRoute()
const routes = computed(() =>
  router.getRoutes()
    .filter(r => r.meta && r.name && r.path !== '/')
    .map(r => ({
      name: r.name,
      path: r.path,
      icon: r.meta.icon || '•',
    }))
)

function onResetClick() {
  if (confirm('Reset sample data? This will overwrite current data in this browser.')) {
    resetStore()
  }
}
</script>

<template>
  <div class="d-flex min-vh-100">
    <!-- Sidebar -->
    <aside class="border-end bg-light p-3 d-flex flex-column" style="width: 240px;">
      <div class="d-flex align-items-center mb-3">
        <span class="fs-4 me-2">💼</span>
        <span class="fw-bold">Invoice</span>
      </div>

      <nav class="nav nav-pills flex-column gap-1">
        <router-link
          v-for="r in routes"
          :key="r.path"
          :to="r.path"
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: route.path.startsWith(r.path) }"
        >
          <span class="text-center" style="width:22px">{{ r.icon }}</span>
          <span>{{ r.name }}</span>
        </router-link>
      </nav>

      <div class="mt-auto small text-muted">
        <button type="button" class="btn btn-sm btn-outline-secondary w-100 mt-3" @click="onResetClick">
          Reset sample data
        </button>
        <div class="mt-2">v1.0</div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-grow-1 d-flex flex-column">
      <header class="border-bottom bg-white sticky-top">
        <div class="container-fluid py-2 d-flex justify-content-between align-items-center">
          <div class="h5 mb-0"><slot name="title" /></div>
          <div><slot name="actions" /></div>
        </div>
      </header>
      <main class="container-fluid py-3">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Keep styles minimal; Bootstrap handles most styling */
@media (max-width: 992px) {
  aside[style] { width: 200px !important; }
}
</style>
