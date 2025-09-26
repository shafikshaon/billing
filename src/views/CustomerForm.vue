<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import AddressListEditor from '../components/AddressListEditor.vue'
import ContactListEditor from '../components/ContactListEditor.vue'
import { store, uid, upsert } from '../store'

const route = useRoute()
const router = useRouter()

const isEdit = route.path.endsWith('/edit')
const editingId = isEdit ? route.params.id : null

const draft = reactive({
  id: '',
  type: 'company',
  name: '',
  taxId: '',
  nid: '',
  website: '',
  addresses: [],
  contacts: [],
  notes: ''
})

onMounted(() => {
  if (isEdit && editingId) {
    const c = store.customers.find(x => x.id === editingId)
    if (c) Object.assign(draft, JSON.parse(JSON.stringify(c)))
  }
})

function cancel() { router.push('/customers') }
function save() {
  if (!draft.name.trim()) return
  if (!draft.id) draft.id = uid('cus_')
  const copy = JSON.parse(JSON.stringify(draft))
  upsert(store.customers, copy)
  alert('Customer saved')
  router.push('/customers')
}
</script>

<template>
  <div class="row g-3 justify-content-center">
    <div class="col-12 col-lg-8 col-xl-6">
      <SectionCard :title="isEdit ? 'Edit Customer' : 'New Customer'">
        <template #actions>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="cancel">Back to list</button>
        </template>

        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Type</label>
            <select class="form-select form-select-sm" v-model="draft.type">
              <option value="company">Company</option>
              <option value="person">Individual</option>
            </select>
          </div>
          <div class="col-md-8">
            <label class="form-label">{{ draft.type === 'company' ? 'Company Name' : 'Full Name' }}</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., Noor Traders Ltd. / Sabiha Ahmed" />
          </div>

          <template v-if="draft.type === 'company'">
            <div class="col-md-6">
              <label class="form-label">VAT / TAX ID</label>
              <input class="form-control form-control-sm" v-model="draft.taxId" placeholder="e.g., BD-1234567" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Website</label>
              <input class="form-control form-control-sm" v-model="draft.website" placeholder="https://example.com.bd" />
            </div>
          </template>
          <template v-else>
            <div class="col-md-6">
              <label class="form-label">National ID (NID)</label>
              <input class="form-control form-control-sm" v-model="draft.nid" placeholder="e.g., 1234567890" />
            </div>
          </template>

          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea class="form-control" rows="2" v-model="draft.notes" placeholder="Internal notes (optional)"></textarea>
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
          <button class="btn btn-outline-secondary" type="button" @click="cancel">Cancel</button>
          <button class="btn btn-primary" type="button" @click="save">Save</button>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
