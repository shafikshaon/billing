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
  description: '',
  active: true,
  sequence: 0,
  settings: {
    earlyDiscountEnabled: false,
    earlyDiscountPercent: 0,
    earlyDiscountDays: 0,
    showInstallmentDates: true,
    showOnInvoice: true,
    lateFeeEnabled: false,
    lateFeeType: 'percent', // percent | fixed
    lateFeeAmount: 0,
    lateFeeGraceDays: 0
  },
  schedule: [
    { id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'days_after', days: 0, dayOfMonth: null, description: 'Due on receipt' }
  ]
})

onMounted(() => {
  if (isEdit && editingId) {
    const t = store.paymentTerms.find(x => x.id === editingId)
    if (t) Object.assign(draft, JSON.parse(JSON.stringify(t)))
  }
})

function addLine() {
  draft.schedule.push({
    id: uid('ptl_'),
    sequence: draft.schedule.length + 1,
    valueType: 'percent',
    valueAmount: 50,
    dateType: 'days_after',
    days: 30,
    dayOfMonth: null,
    description: ''
  })
}
function removeLine(i) {
  draft.schedule.splice(i, 1)
  draft.schedule.forEach((l, idx) => (l.sequence = idx + 1))
}

function cancel(){ router.push('/payment-terms') }
function save(){
  if (!draft.name.trim()) return
  if (!draft.id) draft.id = uid('term_')
  const copy = JSON.parse(JSON.stringify(draft))
  upsert(store.paymentTerms, copy)
  alert('Payment term saved')
  router.push('/payment-terms')
}
</script>

<template>
  <div class="row g-3 justify-content-center">
    <div class="col-12 col-lg-8 col-xl-7">
      <SectionCard :title="isEdit ? 'Edit Payment Term' : 'New Payment Term'">
        <template #actions>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="cancel">Back to list</button>
        </template>

        <div class="row g-3">
          <div class="col-md-7">
            <label class="form-label">Name</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., 2/10 Net 30 or 50/50 in 30d" />
          </div>
          <div class="col-md-5">
            <label class="form-label">Active</label>
            <select class="form-select form-select-sm" v-model="draft.active">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Description</label>
            <textarea class="form-control" rows="2" v-model="draft.description" placeholder="Optional description"></textarea>
          </div>

          <div class="col-12">
            <h6 class="text-secondary mb-1">Schedule</h6>
            <div class="table-responsive">
              <table class="table table-sm align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width:10%;">#</th>
                    <th style="width:18%;">Value Type</th>
                    <th style="width:16%;">Value</th>
                    <th style="width:20%;">Date Type</th>
                    <th style="width:16%;">Days / Day</th>
                    <th>Description</th>
                    <th class="text-end" style="width:8%;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(l,i) in draft.schedule" :key="l.id">
                    <td>{{ i+1 }}</td>
                    <td>
                      <select class="form-select form-select-sm" v-model="l.valueType">
                        <option value="percent">Percent</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </td>
                    <td>
                      <input class="form-control form-control-sm text-end" type="number" min="0" step="0.01" v-model.number="l.valueAmount" />
                    </td>
                    <td>
                      <select class="form-select form-select-sm" v-model="l.dateType">
                        <option value="days_after">Days After</option>
                        <option value="day_of_month">Day of Month (next)</option>
                      </select>
                    </td>
                    <td>
                      <input v-if="l.dateType==='days_after'" class="form-control form-control-sm text-end" type="number" min="0" step="1" v-model.number="l.days" />
                      <input v-else class="form-control form-control-sm text-end" type="number" min="1" max="31" step="1" v-model.number="l.dayOfMonth" />
                    </td>
                    <td><input class="form-control form-control-sm" v-model="l.description" placeholder="Optional" /></td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" type="button" @click="removeLine(i)">Remove</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="addLine">+ Add line</button>
          </div>

          <div class="col-12">
            <h6 class="text-secondary mb-1">Options</h6>
            <div class="row g-2">
              <div class="col-md-4">
                <label class="form-label">Early Discount?</label>
                <select class="form-select form-select-sm" v-model="draft.settings.earlyDiscountEnabled">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Discount %</label>
                <input class="form-control form-control-sm text-end" type="number" min="0" step="0.01" v-model.number="draft.settings.earlyDiscountPercent" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Within (days)</label>
                <input class="form-control form-control-sm text-end" type="number" min="0" step="1" v-model.number="draft.settings.earlyDiscountDays" />
              </div>

              <div class="col-md-4">
                <label class="form-label">Show Schedule Dates</label>
                <select class="form-select form-select-sm" v-model="draft.settings.showInstallmentDates">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Show on Invoice</label>
                <select class="form-select form-select-sm" v-model="draft.settings.showOnInvoice">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Late Fee Enabled</label>
                <select class="form-select form-select-sm" v-model="draft.settings.lateFeeEnabled">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Late Fee Type</label>
                <select class="form-select form-select-sm" v-model="draft.settings.lateFeeType">
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Late Fee Amount</label>
                <input class="form-control form-control-sm text-end" type="number" min="0" step="0.01" v-model.number="draft.settings.lateFeeAmount" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Late Fee Grace (days)</label>
                <input class="form-control form-control-sm text-end" type="number" min="0" step="1" v-model.number="draft.settings.lateFeeGraceDays" />
              </div>
            </div>
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
