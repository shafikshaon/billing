<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'

const router = useRouter()
const search = ref('')
const sortAsc = ref(true)
const status = ref('all')
const page = ref(1)
const pageSize = 10

function invTotal(inv) {
  // Sum with discounts and tax + shipping
  const itemsTotal = inv.items.reduce((acc, it) => {
    const base = (Number(it.qty)||0) * (Number(it.unitPrice)||0)
    const dtype = it.discountType || 'none'
    const dval = Number(it.discountValue)||0
    const disc = dtype === 'percent' ? base * dval/100 : dtype === 'fixed' ? (Number(it.qty)||0) * dval : 0
    const net = Math.max(0, base - disc)
    const tax = (() => {
      const t = store.taxes.find(x=>x.id===it.taxId)
      return t ? net * (Number(t.rate)||0)/100 : 0
    })()
    return acc + net + tax
  }, 0)
  return itemsTotal + Number(inv.shippingFee||0)
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  let list = store.invoices.slice()
  if (status.value !== 'all') list = list.filter(i => (i.status||'draft') === status.value)
  if (q) list = list.filter(i =>
    i.number?.toLowerCase().includes(q) ||
    store.customers.find(c=>c.id===i.customerId)?.name?.toLowerCase().includes(q)
  )
  list.sort((a,b) => sortAsc.value ? (a.number||'').localeCompare(b.number||'') : (b.number||'').localeCompare(a.number||''))
  return list
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageItems = computed(() => {
  const p = Math.min(page.value, totalPages.value)
  const start = (p - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function createNew(){ router.push('/invoices/new') }
function edit(i){ router.push(`/invoices/${i.id}/edit`) }
</script>

<template>
  <div class="row g-3">
    <div class="col-12">
      <SectionCard title="Invoices">
        <template #actions>
          <div class="d-flex gap-2">
            <input class="form-control form-control-sm" placeholder="Search by number or customer..." v-model="search" />
            <select class="form-select form-select-sm" style="max-width:140px" v-model="status">
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="void">Void</option>
            </select>
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="sortAsc=!sortAsc">Sort {{ sortAsc?'A→Z':'Z→A' }}</button>
            <button class="btn btn-sm btn-primary" type="button" @click="createNew">Create</button>
          </div>
        </template>

        <table class="table table-sm align-middle mb-2">
          <thead class="table-light">
            <tr>
              <th>No</th><th>Date</th><th>Customer</th><th>Status</th><th class="text-end">Total (৳)</th><th class="text-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in pageItems" :key="inv.id">
              <td class="fw-medium">{{ inv.number }}</td>
              <td>{{ inv.date }}</td>
              <td>{{ store.customers.find(c=>c.id===inv.customerId)?.name }}</td>
              <td class="text-capitalize">{{ inv.status || 'draft' }}</td>
              <td class="text-end">{{ invTotal(inv).toFixed(2) }}</td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary" @click="edit(inv)">Open</button>
                </div>
              </td>
            </tr>
            <tr v-if="pageItems.length===0"><td colspan="6" class="text-muted">No invoices found.</td></tr>
          </tbody>
        </table>

        <div class="d-flex justify-content-between align-items-center">
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
