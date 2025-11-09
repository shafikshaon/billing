<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import { resetStore } from '../store'

const route = useRoute()
const routes = computed(() =>
  router.getRoutes()
    .filter(r => r.meta && r.name && r.path !== '/' && !r.meta?.hidden)
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
  <div class="stripe-layout">
    <!-- Modern Sidebar -->
    <aside class="stripe-sidebar">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 10H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="brand-text">Billing</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="r in routes"
          :key="r.path"
          :to="r.path"
          class="nav-item"
          :class="{ active: route.path.startsWith(r.path) }"
        >
          <span class="nav-icon">{{ r.icon }}</span>
          <span class="nav-label">{{ r.name }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button type="button" class="btn btn-sm btn-outline-secondary w-100" @click="onResetClick">
          Reset sample data
        </button>
        <div class="version">v1.0</div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-content">
      <header class="main-header">
        <div class="header-content">
          <div class="header-title"><slot name="title" /></div>
          <div class="header-actions"><slot name="actions" /></div>
        </div>
      </header>
      <main class="main-body">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   STRIPE-INSPIRED LAYOUT
   ======================================== */

.stripe-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--stripe-gray-50);
}

/* ========================================
   MODERN SIDEBAR
   ======================================== */

.stripe-sidebar {
  width: 260px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
  box-shadow: var(--shadow-sm);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--stripe-purple);
  border-radius: 0.625rem;
  color: white;
  box-shadow: var(--shadow-sm);
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all var(--transition-base);
  position: relative;
}

.nav-item:hover {
  background: var(--stripe-gray-50);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--stripe-gray-50);
  color: var(--stripe-purple);
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--stripe-purple);
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  font-size: 1.125rem;
  width: 22px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  flex: 1;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.version {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.75rem;
  font-weight: 500;
}

/* ========================================
   MAIN CONTENT AREA
   ======================================== */

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.main-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.main-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

/* ========================================
   FORM CONSTRAINTS
   ======================================== */

:deep(main form) {
  max-width: 800px;
}

:deep(main form .form-control),
:deep(main form input),
:deep(main form select),
:deep(main form textarea) {
  width: 100%;
}

/* ========================================
   RESPONSIVE
   ======================================== */

@media (max-width: 992px) {
  .stripe-sidebar {
    width: 220px;
  }

  .header-content {
    padding: 1rem 1.5rem;
  }

  .main-body {
    padding: 1.5rem;
  }

  :deep(main form) {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .stripe-sidebar {
    width: 200px;
  }

  .brand-text {
    font-size: 1.125rem;
  }

  .nav-item {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
  }
}
</style>
