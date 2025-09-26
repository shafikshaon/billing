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
  <div class="row g-3" v-if="product">
    <div class="col-12">
      <SectionCard :title="product.name">
        <template #actions>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" @click="back">Back</button>
            <button class="btn btn-primary" @click="edit">Edit</button>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-3"><strong>SKU:</strong> {{ product.sku }}</div>
          <div class="col-md-3"><strong>Unit:</strong> <span class="text-uppercase">{{ product.unit }}</span></div>
          <div class="col-md-3"><strong>Type:</strong> <span class="text-capitalize">{{ product.type }}</span></div>
          <div class="col-md-3"><strong>Price:</strong> ৳{{ Number(product.price||0).toFixed(2) }}</div>
          <div class="col-md-3"><strong>Discount:</strong> {{ fmtDiscount(product) }}</div>
          <div class="col-md-3">
            <strong>Tax:</strong>
            <span v-if="product.taxId">{{ store.taxes.find(t => t.id === product.taxId)?.name }} ({{ store.taxes.find(t => t.id === product.taxId)?.rate }}%)</span>
            <span v-else>None</span>
          </div>
          <div class="col-12">
            <strong>Description:</strong>
            <div class="mt-1">{{ product.description || '—' }}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
  <div v-else class="text-muted">Product not found.</div>
</template>
