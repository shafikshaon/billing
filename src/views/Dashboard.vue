<script setup>
import { computed } from 'vue'
import { store } from '../store'

const paidInvoices = computed(() =>
  store.invoices.filter(inv => inv.status === 'paid').length
)

const draftInvoices = computed(() =>
  store.invoices.filter(inv => inv.status === 'draft').length
)

const totalRevenue = computed(() => {
  return store.invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => {
      const items = inv.items || []
      const subtotal = items.reduce((s, item) => {
        const price = item.unitPrice || 0
        const qty = item.qty || 0
        let lineTotal = price * qty

        if (item.discountType === 'fixed') {
          lineTotal -= (item.discountValue || 0)
        } else if (item.discountType === 'percent') {
          lineTotal -= lineTotal * ((item.discountValue || 0) / 100)
        }

        return s + lineTotal
      }, 0)
      return sum + subtotal
    }, 0)
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: store.settings?.currency || 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Revenue</div>
        <div class="metric-value">{{ formatCurrency(totalRevenue) }}</div>
        <div class="metric-change neutral">From paid invoices</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Invoices</div>
        <div class="metric-value">{{ store.invoices.length }}</div>
        <div class="metric-change positive" v-if="paidInvoices > 0">
          {{ paidInvoices }} paid
        </div>
        <div class="metric-change neutral" v-else>No paid invoices</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Customers</div>
        <div class="metric-value">{{ store.customers.length }}</div>
        <div class="metric-change neutral">Active customers</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Products</div>
        <div class="metric-value">{{ store.products.length }}</div>
        <div class="metric-change neutral">In catalog</div>
      </div>
    </div>

    <!-- Quick Links Grid -->
    <div class="quick-links-section">
      <div class="section-header">
        <h3 class="section-title">Quick Actions</h3>
      </div>

      <div class="quick-links-grid">
        <router-link to="/invoices/new" class="quick-link-card">
          <div class="quick-link-icon">📄</div>
          <div class="quick-link-content">
            <div class="quick-link-title">Create Invoice</div>
            <div class="quick-link-description">Generate a new invoice for your customers</div>
          </div>
        </router-link>

        <router-link to="/customers/new" class="quick-link-card">
          <div class="quick-link-icon">👥</div>
          <div class="quick-link-content">
            <div class="quick-link-title">Add Customer</div>
            <div class="quick-link-description">Register a new customer account</div>
          </div>
        </router-link>

        <router-link to="/products/new" class="quick-link-card">
          <div class="quick-link-icon">📦</div>
          <div class="quick-link-content">
            <div class="quick-link-title">Add Product</div>
            <div class="quick-link-description">Add new product to your catalog</div>
          </div>
        </router-link>

        <router-link to="/merchants" class="quick-link-card">
          <div class="quick-link-icon">🏢</div>
          <div class="quick-link-content">
            <div class="quick-link-title">Manage Merchants</div>
            <div class="quick-link-description">Update merchant information</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Getting Started Guide -->
    <div class="getting-started-section">
      <div class="section-header">
        <h3 class="section-title">Getting Started</h3>
      </div>

      <div class="getting-started-card">
        <div class="getting-started-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">Set up your merchant profile</div>
              <div class="step-description">Add your business information and branding</div>
            </div>
          </div>

          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">Add customers</div>
              <div class="step-description">Import or create customer records</div>
            </div>
          </div>

          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-title">Configure products and pricing</div>
              <div class="step-description">Set up your product catalog, taxes, and payment terms</div>
            </div>
          </div>

          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <div class="step-title">Create your first invoice</div>
              <div class="step-description">Generate and send invoices to your customers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* Section Headers */
.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  margin: 0;
}

/* Quick Links Section */
.quick-links-section {
  margin-bottom: 32px;
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.quick-link-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all var(--transition-base);
  text-decoration: none;
  box-shadow: var(--shadow-sm);
}

.quick-link-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-purple);
  transform: translateY(-2px);
}

.quick-link-icon {
  font-size: 32px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: var(--radius-md);
}

.quick-link-content {
  flex: 1;
  min-width: 0;
}

.quick-link-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.quick-link-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Getting Started Section */
.getting-started-section {
  margin-bottom: 32px;
}

.getting-started-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.getting-started-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-purple);
  color: white;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
}

.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.step-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 992px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .quick-links-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .quick-link-card {
    padding: 16px;
  }

  .quick-link-icon {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }

  .getting-started-card {
    padding: 20px;
  }

  .step-number {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }
}
</style>
