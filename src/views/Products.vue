<script setup>
import { reactive, ref, computed } from 'vue'
import SectionCard from '../components/SectionCard.vue'
import { store, uid, removeById } from '../store'

const draft = reactive({
  id: '',
  name: '',
  unit: 'pcs',
  type: 'goods', // goods/service
  price: 0,
  taxId: ''
})

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.products
  return store.products.filter(p => p.name?.toLowerCase().includes(q))
})

function edit(p) { Object.assign(draft, JSON.parse(JSON.stringify(p))) }
function reset() { Object.assign(draft, { id: '', name: '', unit: 'pcs', type: 'goods', price: 0, taxId: '' }) }
function save() {
  if (!draft.name.trim()) return
  if (!draft.id) draft.id = uid('prd_')
  const copy = JSON.parse(JSON.stringify(draft))
  const idx = store.products.findIndex(x => x.id === copy.id)
  if (idx === -1) store.products.push(copy)
  else store.products.splice(idx, 1, copy)
  reset()
}
function remove(id) { removeById(store.products, id); if (draft.id === id) reset() }
</script>

<template>
  <div class="row g-3">
    <div class="col-lg-7">
      <SectionCard title="Products">
        <template #actions>
          <div class="d-flex gap-2">
            <input class="form-control form-control-sm" placeholder="Search..." v-model="search"/>
            <button class="btn btn-sm btn-primary" type="button" @click="reset">New</button>
          </div>
        </template>
        <table class="table table-sm align-middle mb-0">
          <thead class="table-light"><tr><th>Name</th><th>Unit</th><th>Type</th><th>Price</th><th>Tax</th><th class="text-end"></th></tr></thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td class="fw-medium">{{ p.name }}</td>
              <td>{{ p.unit }}</td>
              <td><span class="badge text-bg-secondary text-capitalize">{{ p.type }}</span></td>
              <td>{{ Number(p.price||0).toFixed(2) }}</td>
              <td>
                <span v-if="p.taxId">{{ store.taxes.find(t=>t.id===p.taxId)?.name }} ({{ store.taxes.find(t=>t.id===p.taxId)?.rate }}%)</span>
                <span v-else class="text-muted">None</span>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary" @click="edit(p)">Edit</button>
                  <button class="btn btn-outline-danger" @click="remove(p.id)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length===0"><td colspan="6" class="text-muted">No products found.</td></tr>
          </tbody>
        </table>
      </SectionCard>
    </div>

    <div class="col-lg-5">
      <SectionCard :title="draft.id ? 'Edit Product' : 'New Product'">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Name</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., Web design" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Unit</label>
            <input class="form-control form-control-sm" v-model="draft.unit" placeholder="e.g., pcs, hr, kg" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Type</label>
            <select class="form-select form-select-sm" v-model="draft.type">
              <option value="goods">Goods</option>
              <option value="service">Service</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Price</label>
            <input class="form-control form-control-sm" type="number" min="0" step="0.01" v-model.number="draft.price" />
          </div>
          <div class="col-12">
            <label class="form-label">Default Tax</label>
            <select class="form-select form-select-sm" v-model="draft.taxId">
              <option value="">None</option>
              <option v-for="t in store.taxes" :key="t.id" :value="t.id">{{ t.name }} ({{ t.rate }}%)</option>
            </select>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-2">
          <button class="btn btn-outline-secondary" @click="reset" type="button">Reset</button>
          <button class="btn btn-primary" @click="save" type="button">{{ draft.id ? 'Update' : 'Create' }}</button>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
