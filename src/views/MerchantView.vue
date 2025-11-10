<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'

const route = useRoute()
const router = useRouter()
const merchant = computed(() => store.merchants.find(x => x.id === route.params.id))

function back() { router.push('/merchants') }
function edit() { router.push(`/merchants/${route.params.id}/edit`) }
</script>

<template>
  <div v-if="merchant">
    <SectionCard :title="merchant.name">
      <template #actions>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" @click="back">Back</button>
          <button class="btn btn-primary" @click="edit">Edit</button>
        </div>
      </template>

      <!-- Basic Information -->
      <div class="detail-section">
        <h3 class="detail-section-title">Basic Information</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">Merchant Type</div>
            <div class="detail-value text-capitalize">{{ merchant.type }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Notes</div>
            <div class="detail-value">{{ merchant.notes || '—' }}</div>
          </div>
        </div>
      </div>

      <!-- Addresses -->
      <div class="detail-section">
        <h3 class="detail-section-title">Addresses</h3>
        <div v-if="merchant.addresses?.length" class="address-list">
          <div class="address-card" v-for="a in merchant.addresses" :key="a.id">
            <div class="address-type">{{ a.type }}</div>
            <div class="address-content">
              <div>{{ a.line1 }}</div>
              <div v-if="a.line2">{{ a.line2 }}</div>
              <div>{{ a.city }} {{ a.zip }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">No addresses on record</div>
      </div>

      <!-- Contacts -->
      <div class="detail-section">
        <h3 class="detail-section-title">Contacts</h3>
        <div v-if="merchant.contacts?.length" class="contact-list">
          <div class="contact-card" v-for="c in merchant.contacts" :key="c.id">
            <div class="contact-type">{{ c.type }}</div>
            <div class="contact-content">
              <div class="contact-name">{{ c.name }}</div>
              <div v-if="c.email" class="contact-detail">{{ c.email }}</div>
              <div v-if="c.phone" class="contact-detail">{{ c.phone }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">No contacts on record</div>
      </div>
    </SectionCard>
  </div>
  <div v-else class="empty-state">Merchant not found.</div>
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

.address-list,
.contact-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.address-card,
.contact-card {
  background: var(--bg-secondary, #f8f9fa);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.address-type,
.contact-type {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.address-content,
.contact-content {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
}

.contact-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.contact-detail {
  color: var(--text-secondary);
  font-size: 13px;
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

  .address-list,
  .contact-list {
    grid-template-columns: 1fr;
  }
}
</style>
