<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import { resetStore } from '../store'

const route = useRoute()

const sectionOrder = ['main', 'transactions', 'planning', 'settings']

const sectionTitles = {
  main: 'ACCOUNTS & TRANSACTIONS',
  transactions: '',
  planning: 'PLANNING & BUDGETS',
  settings: 'SETTINGS'
}

const groupedRoutes = computed(() => {
  const allRoutes = router.getRoutes()
    .filter(r => r.meta && r.name && r.path !== '/' && !r.meta?.hidden)
    .map(r => ({
      name: r.name,
      path: r.path,
      icon: r.meta.icon || '•',
      section: r.meta.section || 'main'
    }))

  const groups = {}
  allRoutes.forEach(r => {
    if (!groups[r.section]) groups[r.section] = []
    groups[r.section].push(r)
  })

  // Return groups in the correct order
  const orderedGroups = {}
  sectionOrder.forEach(section => {
    if (groups[section]) {
      orderedGroups[section] = groups[section]
    }
  })

  return orderedGroups
})

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
        <template v-for="(routes, section) in groupedRoutes" :key="section">
          <div v-if="sectionTitles[section]" class="nav-section-title">{{ sectionTitles[section] }}</div>
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
        </template>
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
  background: var(--bg-primary);
}

/* ========================================
   STRIPE EXACT SIDEBAR
   ======================================== */

.stripe-sidebar {
  width: 240px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--sidebar-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-purple);
  border-radius: var(--radius-md);
  color: white;
  flex-shrink: 0;
}

.brand-icon svg {
  width: 16px;
  height: 16px;
}

.brand-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.sidebar-nav {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-section-title {
  padding: 16px 12px 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
  position: relative;
  letter-spacing: -0.01em;
}

.nav-item:hover {
  background: var(--sidebar-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
  width: 18px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-footer .btn {
  font-size: 13px;
  padding: 8px 12px;
  width: 100%;
}

.version {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.02em;
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
  background: var(--bg-primary);
}

.main-header {
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: var(--shadow-xs);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  min-height: 64px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.main-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
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
    padding: 16px 20px;
  }

  .main-body {
    padding: 20px;
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
    font-size: 14px;
  }

  .nav-item {
    padding: 8px 10px;
    font-size: 13px;
  }

  .header-content {
    padding: 12px 16px;
    min-height: 56px;
  }

  .header-title {
    font-size: 18px;
  }

  .main-body {
    padding: 16px;
  }
}
</style>
