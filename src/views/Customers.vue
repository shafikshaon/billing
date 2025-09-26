<script setup>
import { reactive, ref, computed } from 'vue'
import SectionCard from '../components/SectionCard.vue'
import AddressListEditor from '../components/AddressListEditor.vue'
import ContactListEditor from '../components/ContactListEditor.vue'
import { store, uid, removeById } from '../store'

const draft = reactive({
  id: '',
  type: 'company',
  name: '',
  addresses: [],
  contacts: [],
  notes: ''
})

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.customers
  return store.customers.filter(x => x.name?.toLowerCase().includes(q))
})

function edit(m) { Object.assign(draft, JSON.parse(JSON.stringify(m))) }
function reset() { Object.assign(draft, { id: '', type: 'company', name: '', addresses: [], contacts: [], notes: '' }) }
function save() {
  if (!draft.name.trim()) return
  if (!draft.id) draft.id = uid('cus_')
  const copy = JSON.parse(JSON.stringify(draft))
  const idx = store.customers.findIndex(x => x.id === copy.id)
  if (idx === -1) store.customers.push(copy)
  else store.customers.splice(idx, 1, copy)
  reset()
}
function remove(id) {
  removeById(store.customers, id)
  if (draft.id === id) reset()
}
</script>

<template>
  <div class="row g-3">
    <div class="col-lg-6">
      <SectionCard title="Customers">
        <template #actions>
          <div class="d-flex gap-2">
            <input class="form-control form-control-sm" placeholder="Search..." v-model="search" />
            <button class="btn btn-sm btn-primary" type="button" @click="reset">New</button>
          </div>
        </template>

        <table class="table table-sm align-middle mb-0">
          <thead class="table-light">
            <tr><th>Name</th><th>Type</th><th>Addresses</th><th>Contacts</th><th class="text-end"></th></tr>
          </thead>
          <tbody>
            <tr v-for="m in filtered" :key="m.id">
              <td class="fw-medium">{{ m.name }}</td>
              <td><span class="badge text-bg-secondary text-capitalize">{{ m.type }}</span></td>
              <td>{{ m.addresses?.length || 0 }}</td>
              <td>{{ m.contacts?.length || 0 }}</td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary" @click="edit(m)">Edit</button>
                  <button class="btn btn-outline-danger" @click="remove(m.id)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length===0"><td colspan="5" class="text-muted">No customers found.</td></tr>
          </tbody>
        </table>
      </SectionCard>
    </div>

    <div class="col-lg-6">
      <SectionCard :title="draft.id ? 'Edit Customer' : 'New Customer'">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Type</label>
            <select class="form-select form-select-sm" v-model="draft.type">
              <option value="company">Company</option>
              <option value="person">Person</option>
            </select>
          </div>
          <div class="col-md-8">
            <label class="form-label">{{ draft.type === 'company' ? 'Company Name' : 'Full Name' }}</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., Widgets LLC" />
          </div>
          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea class="form-control" rows="2" v-model="draft.notes" placeholder="Optional notes"></textarea>
          </div>
          <div class="col-12">
            <h6 class="text-secondary">Addresses</h6>
            <AddressListEditor v-model="draft.addresses" />
          </div>
          <div class="col-12">
            <h6 class="text-secondary">Contacts</h6>
            <ContactListEditor v-model="draft.contacts" />
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
