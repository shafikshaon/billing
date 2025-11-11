<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import { resetStore } from '../store'

const route = useRoute()
const sidebarCollapsed = ref(false)

const sectionOrder = ['main', 'transactions', 'planning', 'reports']

const sectionTitles = {
  main: '',
  transactions: 'ACCOUNTS & TRANSACTIONS',
  planning: 'PLANNING & BUDGETS',
  reports: 'REPORTS & ANALYTICS'
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

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

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
          <button class="hamburger-menu" @click="toggleSidebar">☰</button>
          <div class="brand-icon">💰</div>
          <span class="brand-text">Expense Tracker</span>
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

/* Custom scrollbar for sidebar - Stripe style */
.stripe-sidebar::-webkit-scrollbar {
  width: 6px;
}

.stripe-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.stripe-sidebar::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 3px;
}

.stripe-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--sidebar-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity var(--transition-fast);
}

.hamburger-menu {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
  border-radius: var(--radius-sm);
  margin-right: 4px;
}

.hamburger-menu:hover {
  background: var(--sidebar-hover);
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 18px;
  flex-shrink: 0;
}

.brand-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

/* User Profile Section */
.user-profile {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--sidebar-border);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: #635bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  padding: 20px 12px 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.nav-section-title:first-child {
  padding-top: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin: 0 0 1px 0;
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
  box-shadow: inset 3px 0 0 0 var(--primary-purple);
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
  padding: 12px;
  border-top: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.sidebar-footer .btn {
  font-size: 13px;
  padding: 8px 12px;
  width: 100%;
  border-radius: var(--radius-sm);
}

.version {
  text-align: center;
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.03em;
  padding: 4px 0;
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
  gap: 16px;
  align-items: center;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: var(--radius-full);
}

.header-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: #635bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.header-user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
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
