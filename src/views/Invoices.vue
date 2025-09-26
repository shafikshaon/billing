<script setup>
import {computed, reactive, ref, watch, onMounted} from 'vue'
import { useRoute } from 'vue-router'
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
  shippingMethodId: '',
  shippingAmount: 0,   // editable per invoice
  shippingCod: false,  // editable per invoice
  shippingFree: false, // if true => charge 0 but show struck-through amount
  shippingFee: 0,      // persisted computed fee for list/summary
  notes: '',
  items: []
})
const itemsEditor = ref(null)
const printRef = ref(null)
const route = useRoute()

onMounted(() => {
  if (route.params.id) {
    const inv = store.invoices.find(i => i.id === route.params.id)
    if (inv) Object.assign(draft, JSON.parse(JSON.stringify(inv)))
  }
})

// Helper to resolve product info in preview reliably
function productById(id) {
  return store.products.find(p => p.id === id)
}

const merchant = computed(() => store.merchants.find(x=>x.id===draft.merchantId))
const customer = computed(() => store.customers.find(x=>x.id===draft.customerId))
const terms = computed(() => store.termsTemplates.find(x=>x.id===draft.termsTemplateId)?.content || '')
const termDef = computed(() => store.paymentTerms.find(x=>x.id===draft.paymentTermId))

// Compute per-line net after discount
function lineNet(it) {
  const base = (Number(it.qty)||0) * (Number(it.unitPrice)||0)
  const dtype = it.discountType || 'none'
  const dval = Number(it.discountValue)||0
  const disc = dtype === 'percent' ? base * dval/100 : dtype === 'fixed' ? (Number(it.qty)||0) * dval : 0
  return Math.max(0, base - disc)
}

const totals = computed(() => {
  let sub = 0, tax = 0
  for (const it of draft.items) {
    const net = lineNet(it)
    sub += net
    const t = store.taxes.find(x => x.id === it.taxId)
    if (t) tax += net * (Number(t.rate)||0) / 100
  }
  const ship = shippingFee.value
  return { sub, tax, shipping: ship, total: sub + tax + ship }
})

// Shipping helpers
const customerRegion = computed(() => {
  const city = (customer.value?.addresses?.[0]?.city || '').toLowerCase()
  if (!city) return 'any'
  return city.includes('dhaka') ? 'inside_dhaka' : 'outside_dhaka'
})
const shippingOptions = computed(() => {
  const region = customerRegion.value
  return store.shippingMethods.filter(s => s.region === 'any' || s.region === region)
})
const shippingMethod = computed(() => store.shippingMethods.find(s => s.id === draft.shippingMethodId))
function autoShippingFor(method) {
  if (!method) return 0
  const sub = totalsNoShip.value.sub
  if (method.freeThreshold && sub >= Number(method.freeThreshold)) return 0
  if (method.chargeType === 'percent') {
    return Number((sub * (Number(method.amount) || 0) / 100).toFixed(2))
  }
  return Number(method.amount) || 0
}
const shippingFee = computed(() => {
  const method = shippingMethod.value
  if (!method) return 0
  const base = Number(draft.shippingAmount ?? 0)
  return draft.shippingFree ? 0 : base
})
// Initialize shipping values when method changes
watch(() => draft.shippingMethodId, () => {
  const m = shippingMethod.value
  if (m) {
    draft.shippingAmount = autoShippingFor(m)
    draft.shippingCod = !!m.codAvailable
    draft.shippingFree = false
  } else {
    draft.shippingAmount = 0
    draft.shippingCod = false
    draft.shippingFree = false
  }
})
// sub/tax without shipping to avoid circular dependency
const totalsNoShip = computed(() => {
  let sub = 0, tax = 0
  for (const it of draft.items) {
    const net = lineNet(it)
    sub += net
    const t = store.taxes.find(x => x.id === it.taxId)
    if (t) tax += net * (Number(t.rate) || 0) / 100
  }
  return { sub, tax, total: sub + tax }
})

// Helpers for schedule/dates
function toDate(str){ const [y,m,d] = str.split('-').map(Number); return new Date(y, m-1, d) }
function fmt(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}` }
function addDays(str, days){ const d=toDate(str); d.setDate(d.getDate() + (Number(days)||0)); return fmt(d) }
function nextDayOfMonth(str, day){
  const d=toDate(str); const y=d.getFullYear(), m=d.getMonth()
  const nd=new Date(y, m+1, Math.min(Number(day)||1, 31))
  // Clamp day to last day of next month
  const last=new Date(nd.getFullYear(), nd.getMonth()+1, 0).getDate()
  nd.setDate(Math.min(Number(day)||1, last)); return fmt(nd)
}

// Build payment schedule from term and totals
const paymentSchedule = computed(() => {
  const term = termDef.value
  const issue = draft.date
  const total = totals.value.total
  if (!term || !issue) {
    return [{ label: 'Due', date: addDays(issue, 0), amount: total }]
  }
  const lines = (term.schedule || []).slice().sort((a,b)=> (a.sequence||0)-(b.sequence||0))
  let remaining = total
  const rows = lines.map((l, idx) => {
    const date = l.dateType === 'day_of_month' ? nextDayOfMonth(issue, l.dayOfMonth||1) : addDays(issue, l.days||0)
    let amount = 0
    if (l.valueType === 'percent') {
      amount = total * (Number(l.valueAmount)||0) / 100
    } else {
      amount = Number(l.valueAmount)||0
    }
    if (idx === lines.length - 1) amount = remaining // adjust last to avoid rounding drift
    remaining = Math.max(0, remaining - amount)
    return { label: l.description || `Installment ${idx+1}`, date, amount }
  })
  return rows.length ? rows : [{ label: 'Due', date: addDays(issue, 0), amount: total }]
})
const dueDateComputed = computed(() => {
  // latest date in schedule
  let max = draft.date
  for (const r of paymentSchedule.value) {
    if (r.date && r.date > max) max = r.date
  }
  return max
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
// keep due date updated
watch([() => draft.date, () => draft.paymentTermId, totals], () => {
  draft.dueDate = dueDateComputed.value
})
function autoNumber() {
  const n = (store.invoices.length + 1).toString().padStart(4, '0')
  draft.number = `INV-${n}`
}
function save() {
  if (!draft.merchantId || !draft.customerId) return
  if (!draft.number) autoNumber()
  if (!draft.id) draft.id = uid('inv_')
  // compute and persist fee based on editable amount / free flag
  draft.shippingFee = shippingFee.value
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
        <link rel="stylesheet" href="https://bootswatch.com/5/pulse/bootstrap.min.css"/>
        <style>
          @page { size: A4; margin: 10mm; }
          body { background:#fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
          .print-area { width: 190mm; margin: 0 auto; padding: 10mm; border: none; }
          .print-area h4 { font-size: 20px; color: #4a148c; }
          .print-area table { font-size: 12px; }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.addEventListener('load', function(){
            setTimeout(function(){
              try { window.focus(); window.print(); } finally { window.close(); }
            }, 150);
          });
        <\/script>
      </body>
    </html>
  `)
  w.document.close()
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

  // Load pdfmake (text-based PDFs = selectable/copyable)
  async function ensurePdfMake() {
    if (!window.pdfMake) {
      await new Promise((res, rej) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js'
        s.onload = res; s.onerror = rej; document.body.appendChild(s)
      })
      await new Promise((res, rej) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.min.js'
        s.onload = res; s.onerror = rej; document.body.appendChild(s)
      })
    }
    return window.pdfMake
  }
  await ensurePdfMake()

  // Build content
  const merch = merchant.value
  const cust = customer.value
  const scheduleRows = paymentSchedule.value.map(r => [r.label, r.date, { text: r.amount.toFixed(2), alignment: 'right' }])

  const body = [
    [{ text: 'Product / Description', bold: true }, { text: 'Qty', alignment: 'right', bold: true }, { text: 'Unit', alignment: 'right', bold: true }, { text: 'Discount', alignment: 'right', bold: true }, { text: 'Line', alignment: 'right', bold: true }],
    ...draft.items.map(it => {
      const disc = (it.discountType||'none') === 'percent'
        ? `-${Number(it.discountValue||0).toFixed(0)}%`
        : (it.discountType||'none') === 'fixed'
          ? `- ${(Number(it.discountValue||0)*Number(it.qty||0)).toFixed(2)}`
          : '—'
      return [
        productById(it.productId)?.name || it.description || '—',
        { text: String(it.qty || 0), alignment: 'right' },
        { text: (Number(it.unitPrice||0)).toFixed(2), alignment: 'right' },
        { text: disc, alignment: 'right' },
        { text: lineNet(it).toFixed(2), alignment: 'right' }
      ]
    })
  ]

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [28, 28, 28, 28], // ~10mm
    content: [
      {
        columns: [
          [
            { text: 'Invoice', style: 'title' },
            { text: `No: ${draft.number || '(not set)'}` },
            { text: `Date: ${draft.date}` },
            { text: `Due: ${draft.dueDate}` }
          ],
          [
            { text: merch?.name || 'Select Merchant', alignment: 'right', bold: true },
            { text: merch?.addresses?.length ? `${merch.addresses[0].line1}, ${merch.addresses[0].city}` : '', alignment: 'right' }
          ]
        ]
      },
      { text: ' ', margin: [0,6] },
      { text: 'Bill To', bold: true },
      { text: cust?.name || 'Select Customer' },
      { text: cust?.addresses?.length ? `${cust.addresses[0].line1}, ${cust.addresses[0].city}` : '' },
      { text: ' ', margin: [0,6] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 40, 50, 55, 60],
          body
        },
        layout: 'lightHorizontalLines'
      },
      {
        columns: [
          { text: ' ' },
          {
            width: 200,
            alignment: 'right',
            stack: [
              { text: `Subtotal: ${totals.value.sub.toFixed(2)}` },
              { text: `Tax: ${totals.value.tax.toFixed(2)}` },
              draft.shippingFree
                ? { text: [
                    'Shipping: 0.00 ',
                    { text: `(was ${Number(draft.shippingAmount||0).toFixed(2)})`, decoration: 'lineThrough' }
                  ] }
                : { text: `Shipping: ${(totals.value.shipping||0).toFixed(2)}` },
              { text: `Total: ${totals.value.total.toFixed(2)}`, bold: true }
            ]
          }
        ],
        margin: [0, 8, 0, 0]
      },
      ...(scheduleRows.length ? [
        { text: `Payment Schedule — ${termDef.value?.name || ''}`, bold: true, margin: [0,8,0,4] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, 80],
            body: [
              [{ text: 'Installment', bold: true }, { text: 'Date', bold: true }, { text: 'Amount', alignment: 'right', bold: true }],
              ...scheduleRows
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ] : [])
    ],
    footer: (currentPage, pageCount) => ({
      margin: [28, 8, 28, 16],
      fontSize: 9,
      text: (store.termsTemplates.find(t => t.id === draft.termsTemplateId)?.content || '').trim()
    }),
    styles: {
      title: { fontSize: 18, color: '#4a148c', bold: true }
    },
    defaultStyle: { fontSize: 10 }
  }

  window.pdfMake.createPdf(docDefinition).download(`invoice_${draft.number || 'draft'}.pdf`)
}
</script>

<template>
  <div class="row g-3">
    <div class="col-lg-6">
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
            <select class="form-select" v-model="draft.merchantId" :disabled="!!draft.id">
              <option value="">Select a merchant</option>
              <option v-for="m in store.merchants" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
            <div v-if="draft.id" class="form-text">Locked for existing invoice</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Customer</label>
            <select class="form-select" v-model="draft.customerId" :disabled="!!draft.id">
              <option value="">Select a customer</option>
              <option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <div v-if="draft.id" class="form-text">Locked for existing invoice</div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Payment Terms</label>
            <select class="form-select" v-model="draft.paymentTermId">
              <option v-for="t in store.paymentTerms" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Terms Template</label>
            <select class="form-select" v-model="draft.termsTemplateId">
              <option v-for="t in store.termsTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Shipping Method</label>
            <select class="form-select" v-model="draft.shippingMethodId">
              <option value="">Select shipping</option>
              <option v-for="s in shippingOptions" :key="s.id" :value="s.id">
                {{ s.name }} — {{ s.chargeType==='fixed' ? ('৳'+Number(s.amount).toFixed(0)) : (Number(s.amount)+'%') }}
              </option>
            </select>
            <div v-if="shippingMethod" class="mt-2">
              <div class="row g-2">
                <div class="col-6">
                  <label class="form-label">Amount (৳)</label>
                  <input class="form-control form-control-sm text-end" type="number" min="0" step="0.01" v-model.number="draft.shippingAmount" />
                  <div class="form-text">Auto: {{ autoShippingFor(shippingMethod).toFixed(2) }}</div>
                </div>
                <div class="col-6 d-flex align-items-end gap-3">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="codSwitch" v-model="draft.shippingCod">
                    <label class="form-check-label" for="codSwitch">COD</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="freeShip" v-model="draft.shippingFree">
                    <label class="form-check-label" for="freeShip">Shipping free</label>
                  </div>
                </div>
              </div>
              <div class="form-text">
                Estimated {{ shippingMethod?.leadDaysMin }}–{{ shippingMethod?.leadDaysMax }} days. Provider COD default: {{ shippingMethod?.codAvailable ? 'Yes' : 'No' }}.
              </div>
            </div>
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

        <!-- Totals badges -->
        <div class="d-flex align-items-center gap-2 mt-2 flex-wrap">
          <span class="badge text-bg-light border">Subtotal: {{ totals.sub.toFixed(2) }}</span>
          <span class="badge text-bg-light border">Tax: {{ totals.tax.toFixed(2) }}</span>
          <span class="badge text-bg-light border">Shipping: {{ (totals.shipping||0).toFixed(2) }}</span>
          <span class="badge text-bg-light border">Total: {{ totals.total.toFixed(2) }}</span>
        </div>

        <!-- Centered primary actions -->
        <div class="d-flex justify-content-center gap-3 mt-3">
          <button class="btn btn-outline-secondary px-4" type="button" @click="reset">Reset</button>
          <button class="btn btn-success px-4" type="button" @click="save">Save</button>
        </div>

        <!-- Secondary actions (centered) -->
        <div class="d-flex justify-content-center gap-3 mt-2">
          <button class="btn btn-primary px-4" type="button" @click="downloadPdf">Download PDF</button>
          <button class="btn btn-outline-secondary px-4" type="button" @click="printInvoice">Print</button>
        </div>
      </SectionCard>
    </div>

    <div class="col-lg-6">
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
                <th>Product / Description</th>
                <th class="text-end">Qty</th>
                <th class="text-end">Unit</th>
                <th class="text-end">Discount</th>
                <th class="text-end">Line</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in draft.items" :key="it.id">
                <td>
                  <div class="fw-medium">{{ productById(it.productId)?.name || it.description || '—' }}</div>
                  <div v-if="it.description && productById(it.productId)?.name !== it.description" class="text-muted small">{{ it.description }}</div>
                </td>
                <td class="text-end">{{ it.qty }}</td>
                <td class="text-end">{{ Number(it.unitPrice||0).toFixed(2) }}</td>
                <td class="text-end">
                  <span v-if="(it.discountType||'none')==='percent'">-{{ Number(it.discountValue||0).toFixed(0) }}%</span>
                  <span v-else-if="(it.discountType||'none')==='fixed'">-{{ (Number(it.discountValue||0)*Number(it.qty||0)).toFixed(2) }}</span>
                  <span v-else>—</span>
                </td>
                <td class="text-end">{{ lineNet(it).toFixed(2) }}</td>
              </tr>
              <tr v-if="draft.items.length===0">
                <td colspan="5" class="text-muted">No items</td>
              </tr>
            </tbody>
          </table>

          <div class="mt-2 text-end">
            <div>Subtotal: {{ totals.sub.toFixed(2) }}</div>
            <div>Tax: {{ totals.tax.toFixed(2) }}</div>
            <div>
              Shipping:
              <template v-if="draft.shippingFree">
                <span class="text-decoration-line-through">{{ Number(draft.shippingAmount||0).toFixed(2) }}</span>
                <span class="ms-1">0.00</span>
              </template>
              <template v-else>
                {{ (totals.shipping||0).toFixed(2) }}
              </template>
            </div>
            <div><strong>Total: {{ totals.total.toFixed(2) }}</strong></div>
          </div>
          <div class="text-muted small text-end" v-if="shippingMethod">
            Shipping via {{ shippingMethod?.name }} ({{ shippingMethod?.leadDaysMin }}–{{ shippingMethod?.leadDaysMax }} days)
          </div>

          <div class="mt-2" v-if="termDef">
            <strong>Payment Schedule — {{ termDef?.name }}</strong>
            <table class="table table-sm mt-1">
              <thead class="table-light"><tr><th>Installment</th><th>Date</th><th class="text-end">Amount</th></tr></thead>
              <tbody>
                <tr v-for="r in paymentSchedule" :key="r.label + r.date">
                  <td>{{ r.label }}</td>
                  <td>{{ r.date }}</td>
                  <td class="text-end">{{ r.amount.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
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
    </div>
  </div>
</template>
