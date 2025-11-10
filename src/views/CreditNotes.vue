<script setup>
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import LineItemsEditor from '../components/LineItemsEditor.vue'
import { store, uid, upsert } from '../store'
import { useToast } from '../utils/toast'

const today = () => new Date().toISOString().slice(0,10)
const route = useRoute()
const router = useRouter()
const toast = useToast()
const printRef = ref(null)

const draft = reactive({
  id: '',
  number: '',
  date: today(),
  merchantId: '',
  merchantAddressId: '',
  merchantContactId: '',
  customerId: '',
  customerAddressId: '',
  customerContactId: '',
  originalInvoiceId: '',
  reason: '',
  status: 'draft',
  notes: '',
  currency: 'BDT',
  items: []
})

const isEdit = computed(() => !!route.params.id)

// Load existing for edit or bind to invoice for create
onMounted(() => {
  if (route.params.id) {
    const cn = (store.creditNotes || []).find(i => i.id === route.params.id)
    if (cn) Object.assign(draft, JSON.parse(JSON.stringify(cn)))
  } else if (route.query.invoiceId) {
    draft.originalInvoiceId = String(route.query.invoiceId || '')
  }
  if (draft.originalInvoiceId && (!draft.merchantId || !draft.customerId)) applyFromInvoice()
})

// Lookups
const merchant = computed(() => store.merchants.find(x=>x.id===draft.merchantId))
const merchantAddresses = computed(() => merchant.value?.addresses || [])
const merchantContacts = computed(() => merchant.value?.contacts || [])
const merchantSelectedAddress = computed(() => merchantAddresses.value.find(a => a.id === draft.merchantAddressId))
const merchantSelectedContact = computed(() => merchantContacts.value.find(c => c.id === draft.merchantContactId))

const customer = computed(() => store.customers.find(x=>x.id===draft.customerId))
const customerAddresses = computed(() => customer.value?.addresses || [])
const customerContacts = computed(() => customer.value?.contacts || [])
const customerSelectedAddress = computed(() => customerAddresses.value.find(a => a.id === draft.customerAddressId))
const customerSelectedContact = computed(() => customerContacts.value.find(c => c.id === draft.customerContactId))

const invoices = computed(() => store.invoices.slice().sort((a,b)=>(a.number||'').localeCompare(b.number||'')))
const selectedInvoice = computed(() => store.invoices.find(inv => inv.id === draft.originalInvoiceId))

function setMerchantDefaults() {
  const m = merchant.value
  if (!m) return
  draft.merchantAddressId = m.addresses?.find(a => a.type === 'primary')?.id || m.addresses?.[0]?.id || ''
  draft.merchantContactId = m.contacts?.find(c => c.type === 'primary')?.id || m.contacts?.[0]?.id || ''
}
function setCustomerDefaults() {
  const c = customer.value
  if (!c) return
  draft.customerAddressId = c.addresses?.find(a => a.type === 'primary')?.id || c.addresses?.[0]?.id || ''
  draft.customerContactId = c.contacts?.find(cn => cn.type === 'primary')?.id || c.contacts?.[0]?.id || ''
}

watch(() => draft.merchantId, () => setMerchantDefaults())
watch(() => draft.customerId, () => setCustomerDefaults())
watch(() => draft.originalInvoiceId, () => applyFromInvoice())

function applyFromInvoice() {
  const inv = selectedInvoice.value
  if (!inv) return
  // Parties
  draft.merchantId = inv.merchantId || draft.merchantId
  draft.customerId = inv.customerId || draft.customerId
  draft.merchantAddressId = inv.merchantAddressId || draft.merchantAddressId
  draft.merchantContactId = inv.merchantContactId || draft.merchantContactId
  draft.customerAddressId = inv.customerAddressId || draft.customerAddressId
  draft.customerContactId = inv.customerContactId || draft.customerContactId
  if (!draft.merchantAddressId || !draft.merchantContactId) setMerchantDefaults()
  if (!draft.customerAddressId || !draft.customerContactId) setCustomerDefaults()
  // Items (copy from invoice; user can adjust)
  draft.items = (inv.items || []).map(it => ({
    id: uid('cnli_'),
    productId: it.productId,
    description: it.description,
    qty: it.qty,
    unitPrice: Number(it.unitPrice || 0),
    discountType: it.discountType || 'none',
    discountValue: Number(it.discountValue || 0),
    taxId: it.taxId || ''
  }))
}

function lineNet(it) {
  const base = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0)
  const dtype = it.discountType || 'none'
  const dval = Number(it.discountValue) || 0
  const disc = dtype === 'percent' ? base * dval / 100 : dtype === 'fixed' ? (Number(it.qty) || 0) * dval : 0
  return Math.max(0, base - disc)
}
const totals = computed(() => {
  let sub = 0, tax = 0
  for (const it of (draft.items || [])) {
    const net = lineNet(it)
    sub += net
    const t = store.taxes.find(x => x.id === it.taxId)
    if (t) tax += net * (Number(t.rate) || 0) / 100
  }
  return { sub, tax, total: sub + tax }
})

function autoNumber() {
  const s = store.settings?.creditNote || {}
  const next = Number(s.nextNumber || 1)
  const pad = Math.max(0, Number(s.zeroPad || 0))
  const prefix = s.prefix || 'CN-'
  draft.number = `${prefix}${String(next).padStart(pad, '0')}`
  s.nextNumber = next + 1
}

function validateForm() {
  // Validate credit note number
  if (!draft.number && !store.settings?.creditNote?.autoNumberOnSave) {
    toast.error('Validation Error', 'Credit note number is required')
    return false
  }

  // Validate date
  if (!draft.date) {
    toast.error('Validation Error', 'Date is required')
    return false
  }

  // Validate merchant
  if (!draft.merchantId) {
    toast.error('Validation Error', 'Please select a merchant')
    return false
  }

  // Validate customer
  if (!draft.customerId) {
    toast.error('Validation Error', 'Please select a customer')
    return false
  }

  // Validate line items exist
  if (!draft.items || draft.items.length === 0) {
    toast.error('Validation Error', 'At least one line item is required')
    return false
  }

  // Validate each line item
  for (let i = 0; i < draft.items.length; i++) {
    const item = draft.items[i]
    if (!item.productId && !item.description) {
      toast.error('Validation Error', `Line item ${i + 1}: Product or description is required`)
      return false
    }
    if (!item.qty || Number(item.qty) <= 0) {
      toast.error('Validation Error', `Line item ${i + 1}: Quantity must be greater than 0`)
      return false
    }
  }

  return true
}

function ensureWindow() { return typeof window !== 'undefined' ? window : null }

function printCN() {
  const w = ensureWindow()
  if (!w || !printRef?.value) return
  const html = printRef.value.outerHTML
  const win = w.open('', '_blank', 'noopener,noreferrer')
  if (!win) return
  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${draft.number || 'Credit Note'}</title>
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
  win.document.close()
}

async function downloadPdf() {
  if (!printRef?.value) return

  async function ensurePdfMake() {
    if (!window.pdfMake) {
      await new Promise((res, rej) => { const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s) })
      await new Promise((res, rej) => { const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.min.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s) })
    }
    return window.pdfMake
  }
  await ensurePdfMake()

  const merch = merchant.value
  const cust = customer.value

  const body = [
    [{ text: 'Product / Description', bold: true }, { text: 'Qty', alignment: 'right', bold: true }, { text: 'Unit', alignment: 'right', bold: true }, { text: 'Discount', alignment: 'right', bold: true }, { text: 'Line', alignment: 'right', bold: true }],
    ...(draft.items || []).map(it => [
      store.products.find(p => p.id === it.productId)?.name || it.description || '—',
      { text: String(it.qty || 0), alignment: 'right' },
      { text: (Number(it.unitPrice || 0)).toFixed(2), alignment: 'right' },
      { text: (it.discountType || 'none') === 'percent' ? ('-' + Number(it.discountValue || 0).toFixed(0) + '%') : (it.discountType || 'none') === 'fixed' ? ('- ' + (Number(it.discountValue || 0) * Number(it.qty || 0)).toFixed(2)) : '—', alignment: 'right' },
      { text: lineNet(it).toFixed(2), alignment: 'right' }
    ])
  ]

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [28, 28, 28, 28],
    content: [
      {
        columns: [
          [
            { text: merch?.name || '', bold: true },
            { text: merch?.addresses?.length ? `${merch.addresses[0].line1}, ${merch.addresses[0].city}` : '' },
            merch?.taxId ? { text: `VAT/TAX ID: ${merch.taxId}`, color: '#6c757d', fontSize: 9 } : {}
          ],
          [
            { text: 'Credit Note', style: 'title', alignment: 'right' },
            { text: `No: ${draft.number || ''}`, bold: true, alignment: 'right' },
            { text: `Date: ${draft.date || ''}`, alignment: 'right' },
            selectedInvoice.value ? { text: `Ref Invoice: ${selectedInvoice.value.number}`, alignment: 'right' } : {}
          ]
        ]
      },
      { text: ' ', margin: [0,6] },
      { text: 'Bill To', bold: true },
      { text: cust?.name || '' },
      { text: cust?.addresses?.length ? `${cust.addresses[0].line1}, ${cust.addresses[0].city}` : '' },
      draft.reason ? { text: `Reason: ${draft.reason}`, margin: [0, 6, 0, 0] } : {},
      {
        table: { headerRows: 1, widths: ['*', 40, 50, 55, 60], body },
        layout: 'lightHorizontalLines',
        margin: [0, 6, 0, 0]
      },
      {
        columns: [
          { text: ' ' },
          {
            width: 180,
            alignment: 'right',
            stack: [
              { text: `Subtotal: ${totals.value.sub.toFixed(2)}` },
              { text: `Tax: ${totals.value.tax.toFixed(2)}` },
              { text: `Total Credit: ${totals.value.total.toFixed(2)}`, bold: true }
            ]
          }
        ],
        margin: [0, 8, 0, 0]
      }
    ],
    footer: (currentPage, pageCount) => ({
      margin: [28, 8, 28, 16],
      fontSize: 9,
      text: store.settings?.creditNote?.footerText || ''
    }),
    styles: {
      title: { fontSize: 18, color: '#4a148c', bold: true }
    },
    defaultStyle: { fontSize: 10 }
  }
  window.pdfMake.createPdf(docDefinition).download(`credit_note_${draft.number || 'edit'}.pdf`)
}

function save() {
  // Validate form before saving
  if (!validateForm()) return

  // Assign id for new CN
  if (!draft.id) draft.id = uid('cn_')
  // Auto number on save if configured and number empty
  if (!draft.number && store.settings?.creditNote?.autoNumberOnSave) {
    autoNumber()
  }
  const payload = JSON.parse(JSON.stringify(draft))
  upsert(store.creditNotes, payload, 'id')
  toast.success('Saved', 'Credit note saved successfully')
  router.push(`/credit-notes/${draft.id}`)
}
</script>

<template>
  <div class="row g-3">
    <div class="col-lg-6">
      <SectionCard :title="isEdit ? 'Edit Credit Note' : 'Create Credit Note'">
        <div class="row g-3">
          <div class="col-12"><div class="subsection-title">Credit Note Info</div></div>
          <div class="col-md-4">
            <label class="form-label">Credit Note Number</label>
            <div class="d-flex gap-2">
              <input class="form-control" v-model="draft.number" placeholder="e.g., CN-0001" />
              <button class="btn btn-outline-secondary" type="button" @click="autoNumber">Auto</button>
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label">Date</label>
            <input class="form-control" type="date" v-model="draft.date" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Status</label>
            <select class="form-select" v-model="draft.status">
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="applied">Applied</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          <div class="col-12"><div class="subsection-title mt-1">Reference Invoice</div></div>
          <div class="col-md-12">
            <label class="form-label">Original Invoice</label>
            <select class="form-select" v-model="draft.originalInvoiceId">
              <option value="">—</option>
              <option v-for="inv in invoices" :key="inv.id" :value="inv.id">
                {{ inv.number }} — {{ inv.date }} — {{ store.customers.find(c=>c.id===inv.customerId)?.name }}
              </option>
            </select>
            <div class="form-text">Selecting an invoice will auto-fill parties and items (adjust as needed).</div>
          </div>

          <div class="col-12"><div class="subsection-title mt-1">Parties</div></div>
          <div class="col-md-6">
            <label class="form-label">Merchant</label>
            <select class="form-select" v-model="draft.merchantId" :disabled="!!draft.originalInvoiceId">
              <option value="">Select merchant</option>
              <option v-for="m in store.merchants" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
            <div class="row g-2 mt-1" v-if="merchant">
              <div class="col-7">
                <label class="form-label small mb-1">Address</label>
                <select class="form-select form-select-sm" v-model="draft.merchantAddressId">
                  <option v-for="a in merchantAddresses" :key="a.id" :value="a.id">{{ a.type }} — {{ a.city }}</option>
                </select>
              </div>
              <div class="col-5">
                <label class="form-label small mb-1">Contact</label>
                <select class="form-select form-select-sm" v-model="draft.merchantContactId">
                  <option v-for="c in merchantContacts" :key="c.id" :value="c.id">{{ c.type }} — {{ c.name }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Customer</label>
            <select class="form-select" v-model="draft.customerId" :disabled="!!draft.originalInvoiceId">
              <option value="">Select customer</option>
              <option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <div class="row g-2 mt-1" v-if="customer">
              <div class="col-7">
                <label class="form-label small mb-1">Address</label>
                <select class="form-select form-select-sm" v-model="draft.customerAddressId">
                  <option v-for="a in customerAddresses" :key="a.id" :value="a.id">{{ a.type }} — {{ a.city }}</option>
                </select>
              </div>
              <div class="col-5">
                <label class="form-label small mb-1">Contact</label>
                <select class="form-select form-select-sm" v-model="draft.customerContactId">
                  <option v-for="c in customerContacts" :key="c.id" :value="c.id">{{ c.type }} — {{ c.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="col-md-12">
            <label class="form-label">Reason</label>
            <select class="form-select" v-model="draft.reason">
              <option value="">—</option>
              <option>Goods returned (within 7 days)</option>
              <option>Damaged goods (Sundarban transit)</option>
              <option>Pricing adjustment</option>
              <option>Promotional discount</option>
              <option>Service cancellation</option>
              <option>Advance refund</option>
            </select>
          </div>

          <div class="col-12"><div class="subsection-title mt-2">Items & Notes</div></div>
          <div class="col-12">
            <LineItemsEditor
              :items="draft.items"
              :products="store.products"
              :taxes="store.taxes"
              @update="val => draft.items = val"
            />
          </div>
          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea class="form-control" rows="2" v-model="draft.notes" placeholder="Optional notes to show on credit note"></textarea>
          </div>
        </div>

        <div class="form-sticky-actions mt-3">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="badge">Subtotal: {{ totals.sub.toFixed(2) }}</span>
              <span class="badge">Tax: {{ totals.tax.toFixed(2) }}</span>
              <span class="badge">Total Credit: {{ totals.total.toFixed(2) }}</span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary" type="button" @click="printCN">Print</button>
              <button class="btn btn-primary" type="button" @click="downloadPdf">Download PDF</button>
              <button class="btn btn-success" type="button" @click="save">Save</button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <div class="col-lg-6">
      <SectionCard title="Preview">
        <div class="print-area" ref="printRef">
          <div class="invoice-header d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
            <div class="invoice-brand">
              <strong>{{ merchant?.name || 'Select Merchant' }}</strong><br/>
              <span v-if="merchantSelectedAddress">{{ merchantSelectedAddress.line1 }}, {{ merchantSelectedAddress.city }}</span><br v-if="merchantSelectedAddress"/>
              <span v-if="merchant?.taxId" class="text-muted small">VAT/TAX ID: {{ merchant.taxId }}</span><br v-if="merchant?.taxId"/>
              <span v-if="merchantSelectedContact" class="text-muted small">{{ merchantSelectedContact.name }}<span v-if="merchantSelectedContact.email"> · {{ merchantSelectedContact.email }}</span><span v-if="merchantSelectedContact.phone"> · {{ merchantSelectedContact.phone }}</span></span>
            </div>
            <div class="text-end">
              <h4 class="mb-1">Credit Note</h4>
              <div><span class="text-muted">No:</span> {{ draft.number || '(not set)' }}</div>
              <div><span class="text-muted">Date:</span> {{ draft.date }}</div>
              <div v-if="selectedInvoice"><span class="text-muted">Ref Invoice:</span> {{ selectedInvoice?.number }}</div>
            </div>
          </div>

          <div class="mb-2 info-block">
            <div class="text-uppercase muted-label">Bill To</div>
            <div class="fw-semibold">{{ customer?.name || 'Select Customer' }}</div>
            <div v-if="customerSelectedAddress">{{ customerSelectedAddress.line1 }}, {{ customerSelectedAddress.city }}</div>
            <div v-if="customer?.taxId" class="text-muted small">VAT/TAX ID: {{ customer.taxId }}</div>
            <div v-if="draft.reason" class="text-muted small">Reason: {{ draft.reason }}</div>
            <div v-if="customerSelectedContact" class="text-muted small">{{ customerSelectedContact.name }}<span v-if="customerSelectedContact.email"> · {{ customerSelectedContact.email }}</span><span v-if="customerSelectedContact.phone"> · {{ customerSelectedContact.phone }}</span></div>
          </div>

          <table class="table table-sm table-invoice align-middle mt-2">
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
                  <div class="fw-medium">{{ store.products.find(p=>p.id===it.productId)?.name || it.description || '—' }}</div>
                  <div v-if="it.description && store.products.find(p=>p.id===it.productId)?.name !== it.description" class="text-muted small">{{ it.description }}</div>
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

          <div class="mt-2 d-flex">
            <div class="flex-grow-1"></div>
            <div class="totals-card">
              <div class="line"><span>Subtotal</span><span>{{ totals.sub.toFixed(2) }}</span></div>
              <div class="line"><span>Tax</span><span>{{ totals.tax.toFixed(2) }}</span></div>
              <div class="line grand"><span>Total Credit</span><span>{{ totals.total.toFixed(2) }}</span></div>
            </div>
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
