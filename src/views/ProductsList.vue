<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store, removeById } from '../store'

const router = useRouter()
const search = ref('')
const sortAsc = ref(true)
const page = ref(1)
const pageSize = 10

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  let list = store.products.slice()
  if (q) list = list.filter(p => p.name?.toLowerCase().includes(q))
  list.sort((a, b) => {
    const cmp = (a.name || '').localeCompare(b.name || '')
    return sortAsc.value ? cmp : -cmp
  })
  return list
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageItems = computed(() => {
  const p = Math.min(page.value, totalPages.value)
  const start = (p - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function goNew() { router.push('/products/new') }
function goBulkImport() { router.push('/products/bulk-import') }
function viewRow(p) { router.push(`/products/${p.id}`) }
function editRow(p) { router.push(`/products/${p.id}/edit`) }
function removeRow(p) {
  if (confirm(`Delete product "${p.name}"?`)) {
    removeById(store.products, p.id)
  }
}
function fmtDiscount(p) {
  if (!p.discountType || p.discountType === 'none' || !p.discountValue) return '—'
  return p.discountType === 'percent'
    ? `${Number(p.discountValue).toFixed(0)}%`
    : `৳${Number(p.discountValue).toFixed(2)}`
}
</script>

<template>
  <div class="row g-3">
    <div class="col-12">
      <SectionCard title="Products">
        <template #actions>
          <div class="d-flex gap-2">
            <input class="form-control form-control-sm" placeholder="Search..." v-model="search"/>
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="sortAsc = !sortAsc">
              Sort {{ sortAsc ? 'A→Z' : 'Z→A' }}
            </button>
            <button class="btn btn-sm btn-success" type="button" @click="goBulkImport">Bulk Import</button>
            <button class="btn btn-sm btn-primary" type="button" @click="goNew">New</button>
          </div>
        </template>

        <div class="table-wrapper">
          <table class="table table-sm align-middle">
            <thead>
              <tr><th>Name</th><th>Unit</th><th>Type</th><th>Price</th><th>Discount</th><th>Tax</th><th class="text-end"></th></tr>
            </thead>
            <tbody>
              <tr v-for="p in pageItems" :key="p.id">
                <td class="fw-medium">{{ p.name }}</td>
                <td class="text-uppercase">{{ p.unit }}</td>
                <td class="text-capitalize">{{ p.type }}</td>
                <td>{{ Number(p.price||0).toFixed(2) }}</td>
                <td>{{ fmtDiscount(p) }}</td>
                <td>
                  <span v-if="p.taxId">{{ store.taxes.find(t=>t.id===p.taxId)?.name }} ({{ store.taxes.find(t=>t.id===p.taxId)?.rate }}%)</span>
                  <span v-else class="text-muted">None</span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" @click="viewRow(p)">View</button>
                    <button class="btn btn-outline-secondary" @click="editRow(p)">Edit</button>
                    <button class="btn btn-outline-danger" @click="removeRow(p)">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="pageItems.length===0">
                <td colspan="7" class="text-muted">No products found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <div class="small text-muted">Page {{ page }} of {{ totalPages }}</div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" :disabled="page<=1" @click="page--">Prev</button>
            <button class="btn btn-outline-secondary" :disabled="page>=totalPages" @click="page++">Next</button>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
