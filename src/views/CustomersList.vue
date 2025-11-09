<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store, removeById } from '../store'

const router = useRouter()
const search = ref('')
const sortAsc = ref(true)
const page = ref(1)
const pageSize = 8

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  let list = store.customers.slice()
  if (q) list = list.filter(c => c.name?.toLowerCase().includes(q))
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

function goNew() { router.push('/customers/new') }
function goBulkImport() { router.push('/customers/bulk-import') }
function viewRow(c) { router.push(`/customers/${c.id}`) }
function editRow(c) { router.push(`/customers/${c.id}/edit`) }
function removeRow(c) {
  if (confirm(`Delete customer "${c.name}"?`)) {
    removeById(store.customers, c.id)
  }
}
</script>

<template>
  <div class="row g-3">
    <div class="col-12">
      <SectionCard title="Customers">
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

        <table class="table table-sm align-middle mb-2">
          <thead class="table-light">
            <tr><th>Name</th><th>Type</th><th>Addresses</th><th>Contacts</th><th class="text-end"></th></tr>
          </thead>
          <tbody>
            <tr v-for="c in pageItems" :key="c.id">
              <td class="fw-medium">{{ c.name }}</td>
              <td><span class="badge text-bg-secondary text-capitalize">{{ c.type }}</span></td>
              <td>{{ c.addresses?.length || 0 }}</td>
              <td>{{ c.contacts?.length || 0 }}</td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary" @click="viewRow(c)">View</button>
                  <button class="btn btn-outline-secondary" @click="editRow(c)">Edit</button>
                  <button class="btn btn-outline-danger" @click="removeRow(c)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="pageItems.length===0">
              <td colspan="5" class="text-muted">No customers found.</td>
            </tr>
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
