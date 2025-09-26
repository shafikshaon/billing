<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store, uid, upsert } from '../store'

const route = useRoute()
const router = useRouter()
const isEdit = route.path.endsWith('/edit')
const editingId = isEdit ? route.params.id : null

const draft = reactive({
  id: '',
  name: '',
  provider: '',
  region: 'any', // inside_dhaka | outside_dhaka | any
  chargeType: 'fixed', // fixed | percent
  amount: 0,
  freeThreshold: 0,
  leadDaysMin: 0,
  leadDaysMax: 0,
  codAvailable: true
})

onMounted(() => {
  if (isEdit && editingId) {
    const s = store.shippingMethods.find(x => x.id === editingId)
    if (s) Object.assign(draft, JSON.parse(JSON.stringify(s)))
  }
})

function cancel(){ router.push('/shipping') }
function save(){
  if(!draft.name.trim()) return
  if(!draft.id) draft.id = uid('ship_')
  const copy = JSON.parse(JSON.stringify(draft))
  upsert(store.shippingMethods, copy)
  alert('Shipping method saved')
  router.push('/shipping')
}
</script>

<template>
  <div class="row g-3 justify-content-center">
    <div class="col-12 col-lg-8 col-xl-6">
      <SectionCard :title="isEdit ? 'Edit Shipping Method' : 'New Shipping Method'">
        <template #actions>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="cancel">Back to list</button>
        </template>

        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label">Name</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., Sundarban Courier - Inside Dhaka" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Provider</label>
            <input class="form-control form-control-sm" v-model="draft.provider" placeholder="e.g., Sundarban" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Region</label>
            <select class="form-select form-select-sm" v-model="draft.region">
              <option value="any">Any</option>
              <option value="inside_dhaka">Inside Dhaka</option>
              <option value="outside_dhaka">Outside Dhaka</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Charge Type</label>
            <select class="form-select form-select-sm" v-model="draft.chargeType">
              <option value="fixed">Fixed</option>
              <option value="percent">Percent</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Amount</label>
            <input class="form-control form-control-sm text-end" type="number" min="0" step="0.01" v-model.number="draft.amount" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Free above (৳)</label>
            <input class="form-control form-control-sm text-end" type="number" min="0" step="1" v-model.number="draft.freeThreshold" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Lead (min days)</label>
            <input class="form-control form-control-sm text-end" type="number" min="0" step="1" v-model.number="draft.leadDaysMin" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Lead (max days)</label>
            <input class="form-control form-control-sm text-end" type="number" min="0" step="1" v-model.number="draft.leadDaysMax" />
          </div>
          <div class="col-md-4">
            <label class="form-label">COD Available</label>
            <select class="form-select form-select-sm" v-model="draft.codAvailable">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
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
