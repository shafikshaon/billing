<script setup>
import { computed, reactive, ref } from 'vue'
import SectionCard from '../components/SectionCard.vue'
import LineItemsEditor from '../components/LineItemsEditor.vue'
import { store, uid } from '../store'

const today = () => new Date().toISOString().slice(0,10)
const draft = reactive({
  id: '',
  number: '',
  date: today(),
  dueDate: today(),
  merchantId: '',
  customerId: '',
  paymentTermId: store.paymentTerms[0]?.id || '',
  termsTemplateId: store.termsTemplates[0]?.id || '',
  notes: '',
  items: []
})
const itemsEditor = ref(null)
const printRef = ref(null)

const merchant = computed(() => store.merchants.find(x=>x.id===draft.merchantId))
const customer = computed(() => store.customers.find(x=>x.id===draft.customerId))
const terms = computed(() => store.termsTemplates.find(x=>x.id===draft.termsTemplateId)?.content || '')
const termDef = computed(() => store.paymentTerms.find(x=>x.id===draft.paymentTermId))
const totals = computed(() => {
  let sub = 0, tax = 0
  for (const it of draft.items) {
    const line = (Number(it.qty)||0) * (Number(it.unitPrice)||0)
    sub += line
    const t = store.taxes.find(x => x.id === it.taxId)
    if (t) tax += line * (Number(t.rate)||0) / 100
  }
  return { sub, tax, total: sub + tax }
})

function reset() {
  Object.assign(draft, {
    id: '',
    number: '',
    date: today(),
    dueDate: today(),
    merchantId: '',
    customerId: '',
    paymentTermId: store.paymentTerms[0]?.id || '',
    termsTemplateId: store.termsTemplates[0]?.id || '',
    notes: '',
    items: []
  })
}
function autoNumber() {
  const n = (store.invoices.length + 1).toString().padStart(4, '0')
  draft.number = `INV-${n}`
}
function save() {
  if (!draft.merchantId || !draft.customerId) return
  if (!draft.number) autoNumber()
  if (!draft.id) draft.id = uid('inv_')
  const copy = JSON.parse(JSON.stringify(draft))
  const idx = store.invoices.findIndex(x=>x.id===copy.id)
  if (idx === -1) store.invoices.push(copy); else store.invoices.splice(idx,1,copy)
  window.alert('Invoice saved')
}
function printInvoice() {
  if (!printRef?.value) return
  const html = printRef.value.outerHTML
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) return
  w.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${draft.number || 'Invoice'}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"/>
        <style>
          body{ padding:24px; background:#fff; }
          .print-area{ border:none; padding:0; }
          *{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `)
  w.document.close()
  w.focus()
  w.onload = () => { w.print(); w.close() }
}

// Lazy-load helpers for PDF download
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.body.appendChild(s)
  })
}
async function ensurePdfLibs() {
  if (!window.html2canvas) {
    await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js')
  }
  if (!window.jspdf) {
    await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')
  }
  return window.jspdf
}
async function downloadPdf() {
  if (!printRef?.value) return
  const { jsPDF } = await ensurePdfLibs()
  const area = printRef.value
  const canvas = await window.html2canvas(area, { scale: 2, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/png')

  // PDF settings (A4 with 10mm margins)
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const margin = 10
  const imgWidth = pageWidth - margin * 2
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let position = margin
  pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, '', 'FAST')

  let heightLeft = imgHeight - (pageHeight - margin * 2)
  while (heightLeft > 0) {
    pdf.addPage()
    position = margin - heightLeft
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, '', 'FAST')
    heightLeft -= (pageHeight - margin * 2)
  }

  const filename = `invoice_${draft.number || 'draft'}.pdf`
  pdf.save(filename)
}
</script>

<template>
  <div class="row g-3">
    <div class="col-lg-7">
      <SectionCard title="Create Invoice">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Invoice Number</label>
            <div class="d-flex gap-2">
              <input class="form-control" v-model="draft.number" placeholder="e.g., INV-0001" />
              <button class="btn btn-outline-secondary" type="button" @click="autoNumber">Auto</button>
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label">Date</label>
            <input class="form-control" type="date" v-model="draft.date" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Due Date</label>
            <input class="form-control" type="date" v-model="draft.dueDate" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Merchant</label>
            <select class="form-select" v-model="draft.merchantId">
              <option value="">Select a merchant</option>
              <option v-for="m in store.merchants" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Customer</label>
            <select class="form-select" v-model="draft.customerId">
              <option value="">Select a customer</option>
              <option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Payment Terms</label>
            <select class="form-select" v-model="draft.paymentTermId">
              <option v-for="t in store.paymentTerms" :key="t.id" :value="t.id">{{ t.name }} ({{ t.days }}d)</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Terms Template</label>
            <select class="form-select" v-model="draft.termsTemplateId">
              <option v-for="t in store.termsTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>

          <div class="col-12">
            <LineItemsEditor
              ref="itemsEditor"
              :items="draft.items"
              :products="store.products"
              :taxes="store.taxes"
              @update="()=>{}"
            />
          </div>

          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea class="form-control" rows="2" v-model="draft.notes" placeholder="Optional notes to show on invoice"></textarea>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 mt-2">
          <span class="badge text-bg-light border">Subtotal: {{ totals.sub.toFixed(2) }}</span>
          <span class="badge text-bg-light border">Tax: {{ totals.tax.toFixed(2) }}</span>
          <span class="badge text-bg-light border">Total: {{ totals.total.toFixed(2) }}</span>
          <div class="ms-auto d-flex gap-2">
            <button class="btn btn-outline-secondary" type="button" @click="reset">Reset</button>
            <button class="btn btn-success" type="button" @click="save">Save</button>
            <button class="btn btn-primary" type="button" @click="downloadPdf">Download PDF</button>
            <button class="btn btn-outline-secondary" type="button" @click="printInvoice">Print</button>
          </div>
        </div>
      </SectionCard>
    </div>

    <div class="col-lg-5">
      <SectionCard title="Preview">
        <div class="print-area" ref="printRef">
          <div class="d-flex justify-content-between mb-3">
            <div>
              <h4 class="mb-1">Invoice</h4>
              <div>No: {{ draft.number || '(not set)' }}</div>
              <div>Date: {{ draft.date }}</div>
              <div>Due: {{ draft.dueDate }}</div>
            </div>
            <div class="text-end">
              <strong>{{ merchant?.name || 'Select Merchant' }}</strong><br/>
              <span v-if="merchant?.addresses?.length">{{ merchant.addresses[0].line1 }}, {{ merchant.addresses[0].city }}</span>
            </div>
          </div>

          <div class="mb-2">
            <div><strong>Bill To</strong></div>
            <div>{{ customer?.name || 'Select Customer' }}</div>
            <div v-if="customer?.addresses?.length">{{ customer.addresses[0].line1 }}, {{ customer.addresses[0].city }}</div>
          </div>

          <table class="table table-sm align-middle mt-2">
            <thead class="table-light">
              <tr>
                <th>Description</th>
                <th class="text-end">Qty</th>
                <th class="text-end">Unit</th>
                <th class="text-end">Line</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in draft.items" :key="it.id">
                <td>{{ it.description }}</td>
                <td class="text-end">{{ it.qty }}</td>
                <td class="text-end">{{ Number(it.unitPrice||0).toFixed(2) }}</td>
                <td class="text-end">{{ ((Number(it.qty)||0) * (Number(it.unitPrice)||0)).toFixed(2) }}</td>
              </tr>
              <tr v-if="draft.items.length===0">
                <td colspan="4" class="text-muted">No items</td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex justify-content-end gap-3 mt-2">
            <div>Subtotal: {{ totals.sub.toFixed(2) }}</div>
            <div>Tax: {{ totals.tax.toFixed(2) }}</div>
            <div><strong>Total: {{ totals.total.toFixed(2) }}</strong></div>
          </div>

          <div class="mt-3">
            <strong>Terms</strong>
            <div style="white-space:pre-wrap;">{{ terms }}</div>
          </div>

          <div v-if="draft.notes" class="mt-2">
            <strong>Notes</strong>
            <div style="white-space:pre-wrap;">{{ draft.notes }}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Saved Invoices">
        <table class="table table-sm align-middle">
          <thead class="table-light"><tr><th>No</th><th>Customer</th><th>Total</th><th></th></tr></thead>
          <tbody>
            <tr v-for="inv in store.invoices" :key="inv.id">
              <td>{{ inv.number }}</td>
              <td>{{ store.customers.find(c=>c.id===inv.customerId)?.name }}</td>
              <td>
                {{
                  inv.items.reduce((acc,it)=>{
                    const line=(Number(it.qty)||0)*(Number(it.unitPrice)||0)
                    const tax=(() => {
                      const t=store.taxes.find(x=>x.id===it.taxId)
                      return t? line*(Number(t.rate)||0)/100 : 0
                    })()
                    return acc+line+tax
                  },0).toFixed(2)
                }}
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary" @click="Object.assign(draft, JSON.parse(JSON.stringify(inv)))">Open</button>
              </td>
            </tr>
            <tr v-if="store.invoices.length===0"><td colspan="4" class="text-muted">No invoices yet.</td></tr>
          </tbody>
        </table>
      </SectionCard>
    </div>
  </div>
</template>
