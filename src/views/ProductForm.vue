<script setup>
import { reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store, uid, upsert } from '../store'

const route = useRoute()
const router = useRouter()
const isEdit = route.path.endsWith('/edit')
const editingId = isEdit ? route.params.id : null

const UNITS = [
  { value: 'pcs', label: 'Pcs (Pieces)' },
  { value: 'ea', label: 'Each (Ea)' },
  { value: 'units', label: 'Units' },
  { value: 'items', label: 'Items' },
  { value: 'doz', label: 'Dozen (Doz)' },
  { value: 'pair', label: 'Pair' },
  { value: 'set', label: 'Set' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'carton', label: 'Carton' },
]
const TYPES = ['goods', 'service', 'digital', 'rental/lease', 'subscription', 'fee', 'license', 'expense', 'material', 'labor']
const DISCOUNT_TYPES = ['none', 'fixed', 'percent']

const draft = reactive({
  id: '',
  name: '',
  unit: UNITS[0].value,
  type: TYPES[0],
  price: 0,
  discountType: 'none',
  discountValue: 0,
  taxId: '',
  description: ''
})

onMounted(() => {
  if (isEdit && editingId) {
    const p = store.products.find(x => x.id === editingId)
    if (p) Object.assign(draft, JSON.parse(JSON.stringify(p)))
  }
})

const isPercent = computed(() => draft.discountType === 'percent')

function cancel() { router.push('/products') }
function save() {
  if (!draft.name.trim()) return
  if (!draft.id) draft.id = uid('prd_')
  const copy = JSON.parse(JSON.stringify(draft))
  upsert(store.products, copy)
  alert('Product saved')
  router.push('/products')
}
</script>

<template>
  <div class="row g-3 justify-content-center">
    <div class="col-12 col-lg-8 col-xl-6">
      <SectionCard :title="isEdit ? 'Edit Product' : 'New Product'">
        <template #actions>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="cancel">Back to list</button>
        </template>

        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Name</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., Web design" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Unit</label>
            <select class="form-select form-select-sm" v-model="draft.unit">
              <option v-for="u in UNITS" :key="u.value" :value="u.value">{{ u.label }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Type</label>
            <select class="form-select form-select-sm" v-model="draft.type">
              <option v-for="t in TYPES" :key="t" :value="t">{{ t[0].toUpperCase() + t.slice(1) }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Price</label>
            <input class="form-control form-control-sm text-end" type="number" min="0" step="0.01" v-model.number="draft.price" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Discount Type</label>
            <select class="form-select form-select-sm" v-model="draft.discountType">
              <option v-for="dt in DISCOUNT_TYPES" :key="dt" :value="dt">{{ dt[0].toUpperCase() + dt.slice(1) }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Discount Value</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text" v-if="!isPercent">৳</span>
              <input class="form-control" type="number" min="0" step="0.01" v-model.number="draft.discountValue" />
              <span class="input-group-text" v-if="isPercent">%</span>
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label">Default Tax</label>
            <select class="form-select form-select-sm" v-model="draft.taxId">
              <option value="">None</option>
              <option v-for="t in store.taxes" :key="t.id" :value="t.id">{{ t.name }} ({{ t.rate }}%)</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Description</label>
            <textarea class="form-control" rows="2" v-model="draft.description" placeholder="Optional"></textarea>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-2">
          <button class="btn btn-outline-secondary" @click="cancel" type="button">Cancel</button>
          <button class="btn btn-primary" @click="save" type="button">Save</button>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
