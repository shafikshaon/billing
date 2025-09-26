<script setup>
import { reactive, watch } from 'vue'
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'

const form = reactive({
  prefix: store.settings.invoice?.prefix || 'INV-',
  nextNumber: store.settings.invoice?.nextNumber || 1001,
  zeroPad: store.settings.invoice?.zeroPad || 4,
  autoNumberOnSave: !!store.settings.invoice?.autoNumberOnSave,
  footerText: store.settings.invoice?.footerText || '',
  defaultPaymentTermId: store.settings.invoice?.defaultPaymentTermId || '',
  defaultTermsTemplateId: store.settings.invoice?.defaultTermsTemplateId || '',
  defaultShippingMethodId: store.settings.invoice?.defaultShippingMethodId || ''
})

function save() {
  store.settings.invoice = {
    ...store.settings.invoice,
    prefix: form.prefix,
    nextNumber: Number(form.nextNumber) || 1,
    zeroPad: Number(form.zeroPad) || 0,
    autoNumberOnSave: !!form.autoNumberOnSave,
    footerText: form.footerText,
    defaultPaymentTermId: form.defaultPaymentTermId,
    defaultTermsTemplateId: form.defaultTermsTemplateId,
    defaultShippingMethodId: form.defaultShippingMethodId
  }
  alert('Settings saved')
}
</script>

<template>
  <div class="row g-3">
    <div class="col-12 col-lg-8 col-xl-6">
      <SectionCard title="Invoice Settings">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Number Prefix</label>
            <input class="form-control form-control-sm" v-model="form.prefix" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Next Number</label>
            <input class="form-control form-control-sm" type="number" min="1" step="1" v-model.number="form.nextNumber" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Zero Pad</label>
            <select class="form-select form-select-sm" v-model.number="form.zeroPad">
              <option :value="0">None</option>
              <option :value="3">3</option>
              <option :value="4">4</option>
              <option :value="5">5</option>
              <option :value="6">6</option>
            </select>
          </div>
          <div class="col-md-6">
            <div class="form-check mt-2">
              <input class="form-check-input" type="checkbox" id="autoNum" v-model="form.autoNumberOnSave">
              <label class="form-check-label" for="autoNum">Auto-number on Save</label>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label">Default Payment Terms</label>
            <select class="form-select form-select-sm" v-model="form.defaultPaymentTermId">
              <option value="">—</option>
              <option v-for="t in store.paymentTerms" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Default Terms Template</label>
            <select class="form-select form-select-sm" v-model="form.defaultTermsTemplateId">
              <option value="">—</option>
              <option v-for="t in store.termsTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Default Shipping Method</label>
            <select class="form-select form-select-sm" v-model="form.defaultShippingMethodId">
              <option value="">—</option>
              <option v-for="s in store.shippingMethods" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div class="col-12">
            <label class="form-label">Footer Text (appears on PDF)</label>
            <textarea class="form-control" rows="3" v-model="form.footerText" placeholder="e.g., Thank you for your business. Payments via bKash/Nagad merchant or bank transfer."></textarea>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-primary" @click="save">Save Settings</button>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
