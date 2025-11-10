<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store, removeById } from '../store'

const router = useRouter()
const searchQuery = ref('')
const sortAsc = ref(true)
const page = ref(1)
const pageSize = 8

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
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

const hasSearchQuery = computed(() => searchQuery.value.trim().length > 0)
const showEmptyState = computed(() => pageItems.value.length === 0)

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
            <div class="search-bar">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                v-model="searchQuery"
                class="form-control form-control-sm"
                placeholder="Search customers..."
              />
            </div>
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="sortAsc = !sortAsc">
              Sort {{ sortAsc ? 'A→Z' : 'Z→A' }}
            </button>
            <button class="btn btn-sm btn-success" type="button" @click="goBulkImport">Bulk Import</button>
            <button class="btn btn-sm btn-primary" type="button" @click="goNew">New</button>
          </div>
        </template>

        <div v-if="showEmptyState" class="empty-state">
          <div class="empty-state-icon">👥</div>
          <div class="empty-state-title">
            {{ hasSearchQuery ? 'No customers found' : 'No customers yet' }}
          </div>
          <div class="empty-state-description">
            {{ hasSearchQuery ? 'Try adjusting your search to find what you\'re looking for.' : 'Get started by adding your first customer to track sales and invoices.' }}
          </div>
          <div v-if="!hasSearchQuery" class="empty-state-action">
            <button class="btn btn-primary" @click="goNew">
              Add Customer
            </button>
          </div>
        </div>

        <template v-else>
          <div class="table-wrapper">
            <table class="table table-sm align-middle">
              <thead>
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
        </template>
      </SectionCard>
    </div>
  </div>
</template>
