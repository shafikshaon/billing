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
  let list = store.termsTemplates.slice()
  if (q) list = list.filter(t => t.name?.toLowerCase().includes(q) || t.content?.toLowerCase().includes(q))
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

function goNew(){ router.push('/terms-conditions/new') }
function editRow(t){ router.push(`/terms-conditions/${t.id}/edit`) }
function removeRow(t){
  if (confirm(`Delete template "${t.name}"?`)) {
    removeById(store.termsTemplates, t.id)
  }
}
</script>

<template>
  <div class="row g-3">
    <div class="col-12">
      <SectionCard title="Terms & Conditions">
        <template #actions>
          <div class="d-flex gap-2">
            <div class="search-bar">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                v-model="searchQuery"
                class="form-control form-control-sm"
                placeholder="Search templates..."
              />
            </div>
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="sortAsc=!sortAsc">
              Sort {{ sortAsc ? 'A→Z' : 'Z→A' }}
            </button>
            <button class="btn btn-sm btn-primary" type="button" @click="goNew">New</button>
          </div>
        </template>

        <div v-if="showEmptyState" class="empty-state">
          <div class="empty-state-icon">📄</div>
          <div class="empty-state-title">
            {{ hasSearchQuery ? 'No templates found' : 'No templates yet' }}
          </div>
          <div class="empty-state-description">
            {{ hasSearchQuery ? 'Try adjusting your search to find what you\'re looking for.' : 'Get started by adding your first terms & conditions template to include in invoices.' }}
          </div>
          <div v-if="!hasSearchQuery" class="empty-state-action">
            <button class="btn btn-primary" @click="goNew">
              Add Template
            </button>
          </div>
        </div>

        <template v-else>
          <div class="table-wrapper">
            <table class="table table-sm align-middle">
              <thead><tr><th>Name</th><th>Preview</th><th class="text-end"></th></tr></thead>
              <tbody>
                <tr v-for="t in pageItems" :key="t.id">
                  <td class="fw-medium">{{ t.name }}</td>
                  <td class="text-truncate" style="max-width: 560px;">{{ t.content }}</td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary" @click="editRow(t)">Edit</button>
                      <button class="btn btn-outline-danger" @click="removeRow(t)">Delete</button>
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
