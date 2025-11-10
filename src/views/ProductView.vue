<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'

const route = useRoute()
const router = useRouter()
const product = computed(() => store.products.find(x => x.id === route.params.id))

function back() { router.push('/products') }
function edit() { router.push(`/products/${route.params.id}/edit`) }

function fmtDiscount(p) {
  if (!p?.discountType || p.discountType === 'none' || !p.discountValue) return '—'
  return p.discountType === 'percent'
    ? `${Number(p.discountValue).toFixed(0)}%`
    : `৳${Number(p.discountValue).toFixed(2)}`
}
</script>

<template>
  <div v-if="product">
    <SectionCard :title="product.name">
      <template #actions>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" @click="back">Back</button>
          <button class="btn btn-primary" @click="edit">Edit</button>
        </div>
      </template>

      <!-- Basic Information -->
      <div class="detail-section">
        <h3 class="detail-section-title">Product Details</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">SKU</div>
            <div class="detail-value">{{ product.sku }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Unit</div>
            <div class="detail-value text-uppercase">{{ product.unit }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Product Type</div>
            <div class="detail-value text-capitalize">{{ product.type }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Description</div>
            <div class="detail-value">{{ product.description || '—' }}</div>
          </div>
        </div>
      </div>

      <!-- Pricing Information -->
      <div class="detail-section">
        <h3 class="detail-section-title">Pricing Information</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">Price</div>
            <div class="detail-value large">৳{{ Number(product.price||0).toFixed(2) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Discount</div>
            <div class="detail-value">{{ fmtDiscount(product) }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Tax</div>
            <div class="detail-value">
              <span v-if="product.taxId">{{ store.taxes.find(t => t.id === product.taxId)?.name }} ({{ store.taxes.find(t => t.id === product.taxId)?.rate }}%)</span>
              <span v-else>None</span>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  </div>
  <div v-else class="empty-state">Product not found.</div>
</template>

<style scoped>
.detail-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.detail-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 400;
}

.detail-value.large {
  font-size: 18px;
  font-weight: 600;
}

.empty-state {
  color: var(--text-secondary);
  font-size: 14px;
  text-align: center;
  padding: 32px;
  font-style: italic;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
