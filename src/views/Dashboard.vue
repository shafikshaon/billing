<script setup>
import { computed } from 'vue'
import { store } from '../store'

// Sample expense data - this will be replaced with store data later
const totalBalance = 471091.36
const monthlyIncome = 0.00
const monthlyExpenses = 48264.62

const recentTransactions = [
  { id: 1, category: 'Housing', date: 'Nov 10', amount: -320.00 },
  { id: 2, category: 'donation', date: 'Nov 10', amount: -212.00 },
  { id: 3, category: 'Transportation', date: 'Nov 10', amount: -140.00 },
  { id: 4, category: 'Transportation', date: 'Nov 10', amount: -130.00 }
]

const budgets = [
  { category: 'donation', spent: 550.00, total: 5000.00 },
  { category: 'Food & Dining', spent: 3489.81, total: 10000.00 },
  { category: 'Transportation', spent: 880.00, total: 5000.00 }
]

const formatCurrency = (amount) => {
  return '৳' + Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getProgressPercent = (spent, total) => {
  return Math.min((spent / total) * 100, 100)
}

const getProgressColor = (percent) => {
  if (percent < 50) return '#00d924'
  if (percent < 80) return '#00d4ff'
  return '#ff4d4f'
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Page Title -->
    <h1 class="page-title">Dashboard</h1>

    <!-- Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">💰</div>
        <div class="metric-value">{{ formatCurrency(totalBalance) }}</div>
        <div class="metric-label">Total Balance</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📈</div>
        <div class="metric-value">{{ formatCurrency(monthlyIncome) }}</div>
        <div class="metric-label">Monthly Income</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📉</div>
        <div class="metric-value">{{ formatCurrency(monthlyExpenses) }}</div>
        <div class="metric-label">Monthly Expenses</div>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="content-grid">
      <!-- Recent Transactions -->
      <div class="section-card">
        <h3 class="section-title">Recent Transactions</h3>
        <div class="transactions-list">
          <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-category">{{ transaction.category }}</div>
              <div class="transaction-date">{{ transaction.date }}</div>
            </div>
            <div class="transaction-amount negative">
              {{ formatCurrency(transaction.amount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Overview -->
      <div class="section-card">
        <h3 class="section-title">Budget Overview</h3>
        <div class="budgets-list">
          <div v-for="budget in budgets" :key="budget.category" class="budget-item">
            <div class="budget-header">
              <div class="budget-category">{{ budget.category }}</div>
              <div class="budget-amounts">
                {{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.total) }}
              </div>
            </div>
            <div class="budget-progress-bar">
              <div
                class="budget-progress-fill"
                :style="{
                  width: getProgressPercent(budget.spent, budget.total) + '%',
                  backgroundColor: getProgressColor(getProgressPercent(budget.spent, budget.total))
                }"
              ></div>
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

/* Page Title */
.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #635bff;
  margin: 0 0 24px 0;
  letter-spacing: -0.02em;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: var(--radius-md);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.metric-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.section-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  letter-spacing: -0.01em;
}

/* Transactions List */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.transaction-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-category {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.transaction-date {
  font-size: 13px;
  color: var(--text-muted);
}

.transaction-amount {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.transaction-amount.negative {
  color: #dc3545;
}

.transaction-amount.positive {
  color: #00d924;
}

/* Budgets List */
.budgets-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.budget-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-category {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.budget-amounts {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.budget-progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.budget-progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Responsive Design */
@media (max-width: 992px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .metric-card {
    padding: 20px;
  }

  .metric-value {
    font-size: 24px;
  }

  .section-card {
    padding: 20px;
  }
}
</style>
