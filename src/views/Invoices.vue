<script setup>
import {computed, reactive, ref, watch, onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import LineItemsEditor from '../components/LineItemsEditor.vue'
import { store, uid } from '../store'
import { useToast } from '../utils/toast'

const today = () => new Date().toISOString().slice(0,10)
const draft = reactive({
  id: '',
  number: '',
  date: today(),
  dueDate: today(),
  merchantId: '',
  merchantAddressId: '',
  merchantContactId: '',
  customerId: '',
  customerAddressId: '',
  customerContactId: '',
  paymentTermId: store.settings?.invoice?.defaultPaymentTermId || '',
  termsTemplateId: store.settings?.invoice?.defaultTermsTemplateId || '',
  shippingMethodId: store.settings?.invoice?.defaultShippingMethodId || '',
  shippingAmount: 0,   // editable per invoice
  shippingCod: false,  // editable per invoice
  shippingFree: false, // if true => charge 0 but show struck-through amount
  shippingFee: 0,      // persisted computed fee for list/summary
  // Payment capture
  receivedAmount: 0,
  changeAmount: 0,
  paidInFull: false,
  notes: '',
  items: []
})
const itemsEditor = ref(null)
const printRef = ref(null)
const route = useRoute()
const router = useRouter()
const toast = useToast()

onMounted(() => {
  if (route.params.id) {
    const inv = store.invoices.find(i => i.id === route.params.id)
    if (inv) Object.assign(draft, JSON.parse(JSON.stringify(inv)))
  }
  // Ensure defaults if selections are missing
  if (draft.merchantId && !draft.merchantAddressId) setMerchantDefaults()
  if (draft.customerId && !draft.customerAddressId) setCustomerDefaults()
})

// Helper to resolve product info in preview reliably
function productById(id) {
  return store.products.find(p => p.id === id)
}

// Address/contact lists and selected records
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

// Update defaults when merchant/customer changes
watch(() => draft.merchantId, () => setMerchantDefaults())
watch(() => draft.customerId, () => setCustomerDefaults())

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

// Linked Credit Notes for this invoice (when editing existing)
function cnTotal(cn) {
  const itemsTotal = (cn.items || []).reduce((acc, it) => {
    const base = (Number(it.qty)||0) * (Number(it.unitPrice)||0)
    const dtype = it.discountType || 'none'
    const dval = Number(it.discountValue)||0
    const disc = dtype === 'percent' ? base * dval/100 : dtype === 'fixed' ? (Number(it.qty)||0) * dval : 0
    const net = Math.max(0, base - disc)
    const tax = (() => {
      const t = store.taxes.find(x=>x.id===it.taxId)
      return t ? net * (Number(t.rate)||0)/100 : 0
    })()
    return acc + net + tax
  }, 0)
  return itemsTotal
}
const creditNotes = computed(() =>
  (store.creditNotes || []).filter(cn =>
    !!draft.id &&
    cn.originalInvoiceId === draft.id &&
    (cn.status === 'issued' || cn.status === 'applied')
  )
)
const creditsTotal = computed(() => creditNotes.value.reduce((sum, cn) => sum + cnTotal(cn), 0))

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

// Sync "paid in full" with totals
watch([() => draft.paidInFull, totals], () => {
  if (draft.paidInFull) {
    draft.receivedAmount = Number(totals.value.total || 0)
    draft.changeAmount = 0
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
    return [] // no term => no schedule
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
  const invSet = store.settings?.invoice || { prefix: 'INV-', nextNumber: 1, zeroPad: 0 }
  const nStr = String(invSet.nextNumber).padStart(Number(invSet.zeroPad)||0, '0')
  draft.number = `${invSet.prefix || ''}${nStr}`
  // increment sequence
  invSet.nextNumber = Number(invSet.nextNumber || 1) + 1
}
function validateForm() {
  // Validate invoice number
  if (!draft.number && !store.settings?.invoice?.autoNumberOnSave) {
    toast.error('Validation Error', 'Invoice number is required')
    return false
  }

  // Validate invoice date
  if (!draft.date) {
    toast.error('Validation Error', 'Invoice date is required')
    return false
  }

  // Validate due date
  if (!draft.dueDate) {
    toast.error('Validation Error', 'Due date is required')
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
function save() {
  // Validate form before saving
  if (!validateForm()) return

  if (!draft.number && store.settings?.invoice?.autoNumberOnSave) autoNumber()
  if (!draft.id) draft.id = uid('inv_')
  // compute and persist fee based on editable amount / free flag
  draft.shippingFee = shippingFee.value
  const copy = JSON.parse(JSON.stringify(draft))
  const idx = store.invoices.findIndex(x=>x.id===copy.id)
  if (idx === -1) store.invoices.push(copy); else store.invoices.splice(idx,1,copy)
  toast.success('Saved', 'Invoice saved successfully')
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

function printReceipt() {
  const merch = merchant.value
  const cust = customer.value
  const sm = shippingMethod.value
  const creditAmt = Number((creditsTotal?.value || 0).toFixed(2))
  const sub = Number(totals.value.sub.toFixed(2))
  const tax = Number(totals.value.tax.toFixed(2))
  const ship = Number(totals.value.shipping.toFixed(2))
  const gross = Number(totals.value.total.toFixed(2))
  const received = Number(draft.paidInFull ? gross : (Number(draft.receivedAmount||0) - Number(draft.changeAmount||0)))
  const balance = Math.max(0, gross - creditAmt - received)

  const itemsHtml = (draft.items||[]).map(it => {
    const name = (productById(it.productId)?.name || it.description || '—')
    const qty = Number(it.qty||0)
    const unit = Number(it.unitPrice||0).toFixed(2)
    const net = Number(lineNet(it).toFixed(2))
    return `
      <div class="row">
        <div class="name">${name}</div>
        <div class="meta">${qty} x ${unit} = ${net.toFixed(2)}</div>
      </div>
    `
  }).join('')

  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) return
  w.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Receipt ${draft.number || ''}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          html, body { padding:0; margin:0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
          .receipt { width: 72mm; padding: 4mm 4mm 8mm; }
          .center { text-align:center; }
          .muted { color:#555; }
          .row { margin: 2px 0; }
          .name { font-size: 12px; }
          .meta { font-size: 11px; color:#444; display:flex; justify-content: space-between; }
          .hr { border-top: 1px dashed #000; margin: 6px 0; }
          .totals .line { display:flex; justify-content: space-between; font-size: 12px; }
          .totals .grand { font-weight: 700; }
          .small { font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center">
            <div style="font-weight:700">${merch?.name || ''}</div>
            <div class="small muted">${merchantSelectedAddress?.value ? (merchantSelectedAddress.value.line1 + ', ' + merchantSelectedAddress.value.city) : ''}</div>
            <div class="small">Invoice: ${draft.number || ''}</div>
            <div class="small">Date: ${draft.date || ''}</div>
          </div>

          <div class="hr"></div>

          <div class="small">Customer: ${cust?.name || ''}</div>
          ${customerSelectedAddress?.value ? `<div class="small muted">${customerSelectedAddress.value.city}</div>` : ''}

          <div class="hr"></div>

          ${itemsHtml || '<div class="small muted">No items</div>'}

          <div class="hr"></div>

          <div class="totals">
            <div class="line"><span>Subtotal</span><span>${sub.toFixed(2)}</span></div>
            <div class="line"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            ${ship > 0 ? `<div class="line"><span>Shipping</span><span>${ship.toFixed(2)}</span></div>` : ''}
            <div class="line grand"><span>Total</span><span>${gross.toFixed(2)}</span></div>
            ${creditAmt > 0 ? `<div class="line"><span>Credits</span><span>-${creditAmt.toFixed(2)}</span></div>` : ''}
            <div class="line"><span>Received</span><span>${received.toFixed(2)}</span></div>
            <div class="line"><span>Balance</span><span>${balance.toFixed(2)}</span></div>
          </div>

          ${sm ? `<div class="small muted" style="margin-top:6px">Shipping via ${sm.name}</div>` : ''}

          <div class="center small" style="margin-top:8px">— Thank you —</div>
        </div>

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
  const merchAddr = merchantSelectedAddress.value
  const custAddr = customerSelectedAddress.value
  const merchContact = merchantSelectedContact.value
  const custContact = customerSelectedContact.value
  const scheduleRows = paymentSchedule.value.map(r => [r.label, r.date, { text: r.amount.toFixed(2), alignment: 'right' }])
  const received = Number(draft.receivedAmount||0)
  const changeAmt = Number(draft.changeAmount||0)
  const netPaid = draft.paidInFull ? (totals.value.total||0) : Math.max(0, received - changeAmt)
  const balanceDue = Math.max(0, (totals.value.total||0) - netPaid)
  const termsText = (store.termsTemplates.find(t => t.id === draft.termsTemplateId)?.content || '').trim()

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
            { text: merchAddr ? `${merchAddr.line1}, ${merchAddr.city}` : '', alignment: 'right' },
            merch?.taxId ? { text: `VAT/TAX ID: ${merch.taxId}`, alignment: 'right', color: '#6c757d', fontSize: 9 } : {},
            merchContact ? { text: `${merchContact.name}${merchContact.email ? ' · '+merchContact.email : ''}${merchContact.phone ? ' · '+merchContact.phone : ''}`, alignment: 'right', color: '#6c757d', fontSize: 9 } : {}
          ]
        ]
      },
      { text: ' ', margin: [0,6] },
      { text: 'Bill To', bold: true },
      { text: cust?.name || 'Select Customer' },
      { text: custAddr ? `${custAddr.line1}, ${custAddr.city}` : '' },
      cust?.taxId ? { text: `VAT/TAX ID: ${cust.taxId}`, color: '#6c757d', fontSize: 9 } : {},
      custContact ? { text: `${custContact.name}${custContact.email ? ' · '+custContact.email : ''}${custContact.phone ? ' · '+custContact.phone : ''}`, color: '#6c757d', fontSize: 9 } : {},
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
              { text: `Total: ${totals.value.total.toFixed(2)}`, bold: true },
              (draft.paidInFull || received > 0) ? { text: `Received: ${received.toFixed(2)}` } : {},
              (changeAmt > 0) ? { text: `Change: ${changeAmt.toFixed(2)}` } : {},
              (draft.paidInFull || received > 0) ? { text: `Balance Due: ${balanceDue.toFixed(2)}`, bold: true } : {}
            ]
          }
        ],
        margin: [0, 8, 0, 0]
      },
      ...((scheduleRows.length && !draft.paidInFull) ? [
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
      ] : []),
      ...(termsText ? [
        { text: 'Terms', bold: true, margin: [0, 12, 0, 4] },
        { text: termsText, fontSize: 9 }
      ] : [])
    ],
    footer: (currentPage, pageCount) => ({
      margin: [28, 8, 28, 16],
      fontSize: 9,
      text: store.settings?.invoice?.footerText || ''
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
          <div class="col-12"><div class="subsection-title">Invoice Info</div></div>
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

          <div class="col-12"><div class="subsection-title mt-1">Parties</div></div>
          <div class="col-md-6">
            <label class="form-label">Merchant</label>
            <select class="form-select" v-model="draft.merchantId" :disabled="!!draft.id">
              <option value="">Select a merchant</option>
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
            <div v-if="draft.id" class="form-text">Locked for existing invoice</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Customer</label>
            <select class="form-select" v-model="draft.customerId" :disabled="!!draft.id">
              <option value="">Select a customer</option>
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
            <div v-if="draft.id" class="form-text">Locked for existing invoice</div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Payment Terms</label>
            <select class="form-select" v-model="draft.paymentTermId">
              <option value="">—</option>
              <option v-for="t in store.paymentTerms" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Terms Template</label>
            <select class="form-select" v-model="draft.termsTemplateId">
              <option value="">—</option>
              <option v-for="t in store.termsTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>

          <div class="col-12"><div class="subsection-title mt-2">Shipping</div></div>
          <div class="col-md-6">
            <label class="form-label">Shipping Method</label>
            <select class="form-select" v-model="draft.shippingMethodId">
              <option value="">Select shipping</option>
              <option v-for="s in shippingOptions" :key="s.id" :value="s.id">
                {{ s.name }} — ৳{{ autoShippingFor(s).toFixed(2) }}{{ s.chargeType==='percent' ? (' ('+Number(s.amount)+'%)') : '' }}{{ s.freeThreshold ? (' · free over ৳'+Number(s.freeThreshold).toFixed(0)) : '' }}
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

          <!-- Payment capture -->
          <div class="col-12"><div class="subsection-title mt-2">Payment</div></div>
          <div class="col-12">
            <div class="row g-2 align-items-end">
              <div class="col-sm-4">
                <label class="form-label">Received Amount (৳)</label>
                <input class="form-control form-control-sm text-end" type="number" min="0" step="0.01" v-model.number="draft.receivedAmount" :disabled="draft.paidInFull"/>
              </div>
              <div class="col-sm-4">
                <label class="form-label">Change (৳)</label>
                <input class="form-control form-control-sm text-end" type="number" min="0" step="0.01" v-model.number="draft.changeAmount" :disabled="draft.paidInFull"/>
              </div>
              <div class="col-sm-4">
                <div class="form-check mt-4">
                  <input class="form-check-input" type="checkbox" id="paidFull" v-model="draft.paidInFull">
                  <label class="form-check-label" for="paidFull">Mark as Fully Paid</label>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12"><div class="subsection-title mt-2">Items & Notes</div></div>
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

        <!-- Sticky actions + quick totals -->
        <div class="form-sticky-actions mt-3">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="badge">Subtotal: {{ totals.sub.toFixed(2) }}</span>
              <span class="badge">Tax: {{ totals.tax.toFixed(2) }}</span>
              <span class="badge">Shipping: {{ (totals.shipping||0).toFixed(2) }}</span>
              <span class="badge">Credits: -{{ (creditsTotal||0).toFixed(2) }}</span>
              <span class="badge">Total: {{ totals.total.toFixed(2) }}</span>
              <span class="badge">Net: {{ (totals.total - (creditsTotal||0)).toFixed(2) }}</span>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary" type="button" @click="reset">Reset</button>
              <button class="btn btn-outline-secondary" type="button" @click="printInvoice">Print</button>
                <button class="btn btn-outline-secondary" type="button" @click="printReceipt">Receipt</button>
              <button class="btn btn-primary" type="button" @click="downloadPdf">Download PDF</button>
              <button v-if="draft.id" class="btn btn-outline-secondary" type="button" @click="() => router.push(`/credit-notes/new?invoiceId=${draft.id}`)">New Credit Note</button>
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
              <h4 class="mb-1">Invoice</h4>
              <div><span class="text-muted">No:</span> {{ draft.number || '(not set)' }}</div>
              <div><span class="text-muted">Date:</span> {{ draft.date }}</div>
              <div><span class="text-muted">Due:</span> {{ draft.dueDate }}</div>
            </div>
          </div>

          <div class="mb-2 info-block">
            <div class="text-uppercase muted-label">Bill To</div>
            <div class="fw-semibold">{{ customer?.name || 'Select Customer' }}</div>
            <div v-if="customerSelectedAddress">{{ customerSelectedAddress.line1 }}, {{ customerSelectedAddress.city }}</div>
            <div v-if="customer?.taxId" class="text-muted small">VAT/TAX ID: {{ customer.taxId }}</div>
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

          <div class="mt-2 d-flex">
            <div class="flex-grow-1"></div>
            <div class="totals-card">
              <div class="line"><span>Subtotal</span><span>{{ totals.sub.toFixed(2) }}</span></div>
              <div class="line"><span>Tax</span><span>{{ totals.tax.toFixed(2) }}</span></div>
              <div class="line">
                <span>Shipping</span>
                <span>
                  <template v-if="draft.shippingFree">
                    <span class="text-decoration-line-through">{{ Number(draft.shippingAmount||0).toFixed(2) }}</span>
                    <span class="ms-1">0.00</span>
                  </template>
                  <template v-else>
                    {{ (totals.shipping||0).toFixed(2) }}
                  </template>
                </span>
              </div>
              <div class="line grand"><span>Total</span><span>{{ totals.total.toFixed(2) }}</span></div>
              <div class="line" v-if="creditsTotal > 0"><span>Credits</span><span>-{{ creditsTotal.toFixed(2) }}</span></div>
              <div class="line" v-if="draft.paidInFull || Number(draft.receivedAmount||0) > 0"><span>Received</span><span>{{ Number(draft.receivedAmount||0).toFixed(2) }}</span></div>
              <div class="line" v-if="Number(draft.changeAmount||0) > 0"><span>Change</span><span>{{ Number(draft.changeAmount||0).toFixed(2) }}</span></div>
              <div class="line" v-if="draft.paidInFull || Number(draft.receivedAmount||0) > 0 || creditsTotal>0"><span class="fw-semibold">Balance Due</span><span class="fw-semibold">{{ Math.max(0, totals.total - creditsTotal - (draft.paidInFull ? totals.total : Math.max(0, Number(draft.receivedAmount||0) - Number(draft.changeAmount||0)))).toFixed(2) }}</span></div>
              <div class="muted small mt-1" v-if="shippingMethod">
                Shipping via {{ shippingMethod?.name }} ({{ shippingMethod?.leadDaysMin }}–{{ shippingMethod?.leadDaysMax }} days)
              </div>
            </div>
          </div>

          <div class="mt-2" v-if="termDef && !draft.paidInFull">
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

          <div class="mt-3" v-if="terms">
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
