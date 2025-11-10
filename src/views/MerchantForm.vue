<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import AddressListEditor from '../components/AddressListEditor.vue'
import ContactListEditor from '../components/ContactListEditor.vue'
import { store, uid, upsert } from '../store'
import { useToast } from '../utils/toast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEdit = route.path.endsWith('/edit')
const editingId = isEdit ? route.params.id : null

const draft = reactive({
  id: '',
  type: 'company',
  name: '',
  taxId: '',
  addresses: [],
  contacts: [],
  notes: ''
})

onMounted(() => {
  if (isEdit && editingId) {
    const m = store.merchants.find(x => x.id === editingId)
    if (m) Object.assign(draft, JSON.parse(JSON.stringify(m)))
  }
})

function validateForm() {
  if (!draft.name?.trim()) {
    toast.error('Validation Error', 'Merchant name is required')
    return false
  }
  return true
}

function cancel() { router.push('/merchants') }
function save() {
  if (!validateForm()) return

  if (!draft.id) draft.id = uid('mrc_')
  const copy = JSON.parse(JSON.stringify(draft))
  upsert(store.merchants, copy)
  toast.success('Saved', 'Merchant saved successfully')
  router.push('/merchants')
}
</script>

<template>
  <div class="row g-3 justify-content-center">
    <div class="col-12 col-lg-8 col-xl-6">
      <SectionCard :title="isEdit ? 'Edit Merchant' : 'New Merchant'">
        <template #actions>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="cancel">Back to list</button>
        </template>

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
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., Dhaka Tech Ltd." />
          </div>

          <div class="col-md-6">
            <label class="form-label">VAT / TAX ID</label>
            <input class="form-control form-control-sm" v-model="draft.taxId" placeholder="e.g., US-12-3456789" />
          </div>
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
