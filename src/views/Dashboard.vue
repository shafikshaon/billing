<script setup>
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'
</script>

<template>
  <div class="dashboard-container">
    <div class="row g-3">
      <div class="col-md-6">
        <SectionCard title="Quick Stats">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ store.merchants.length }}</div>
              <div class="stat-label">Merchants</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ store.customers.length }}</div>
              <div class="stat-label">Customers</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ store.products.length }}</div>
              <div class="stat-label">Products</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ store.invoices.length }}</div>
              <div class="stat-label">Invoices</div>
            </div>
          </div>
        </SectionCard>
      </div>
      <div class="col-md-6">
        <SectionCard title="Get Started">
          <ol class="getting-started-list">
            <li>Add your Merchant profile</li>
            <li>Create Customers</li>
            <li>Define Products, Taxes, Payment Terms</li>
            <li>Create an Invoice</li>
          </ol>
        </SectionCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: var(--stripe-gray-50);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
  font-weight: 500;
}

.getting-started-list {
  padding: 16px 16px 16px 36px;
  margin: 0;
  line-height: 1.8;
  font-size: 14px;
  color: var(--text-primary);
}

.getting-started-list li {
  margin-bottom: 8px;
}

.col-md-6 {
  width: 50%;
  flex: 0 0 50%;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .col-md-6 {
    width: 100%;
    flex: 0 0 100%;
  }
}
</style>
