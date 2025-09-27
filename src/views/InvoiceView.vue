<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'

const route = useRoute()
const router = useRouter()
const printRef = ref(null)

const invoice = computed(() => store.invoices.find(i => i.id === route.params.id))

const merchant = computed(() => store.merchants.find(x => x.id === invoice.value?.merchantId))
const customer = computed(() => store.customers.find(x => x.id === invoice.value?.customerId))
const paymentTerm = computed(() => store.paymentTerms.find(x => x.id === invoice.value?.paymentTermId))
const termsTpl = computed(() => store.termsTemplates.find(x => x.id === invoice.value?.termsTemplateId))
const shippingMethod = computed(() => store.shippingMethods.find(s => s.id === invoice.value?.shippingMethodId))
function productById(id) { return store.products.find(p => p.id === id) }

// Resolve selected merchant/customer address & contact
const merchantAddresses = computed(() => merchant.value?.addresses || [])
const merchantContacts = computed(() => merchant.value?.contacts || [])
const merchantSelectedAddress = computed(() =>
  merchantAddresses.value.find(a => a.id === invoice.value?.merchantAddressId) || merchantAddresses.value[0]
)
const merchantSelectedContact = computed(() =>
  merchantContacts.value.find(c => c.id === invoice.value?.merchantContactId) || merchantContacts.value[0]
)

const customerAddresses = computed(() => customer.value?.addresses || [])
const customerContacts = computed(() => customer.value?.contacts || [])
const customerSelectedAddress = computed(() =>
  customerAddresses.value.find(a => a.id === invoice.value?.customerAddressId) || customerAddresses.value[0]
)
const customerSelectedContact = computed(() =>
  customerContacts.value.find(c => c.id === invoice.value?.customerContactId) || customerContacts.value[0]
)

function lineNet(it) {
  const base = (Number(it.qty)||0) * (Number(it.unitPrice)||0)
  const dtype = it.discountType || 'none'
  const dval = Number(it.discountValue)||0
  const disc = dtype === 'percent' ? base * dval/100 : dtype === 'fixed' ? (Number(it.qty)||0) * dval : 0
  return Math.max(0, base - disc)
}
const totals = computed(() => {
  const inv = invoice.value
  if (!inv) return { sub:0, tax:0, shipping:0, total:0 }
  let sub = 0, tax = 0
  for (const it of inv.items || []) {
    const net = lineNet(it)
    sub += net
    const t = store.taxes.find(x => x.id === it.taxId)
    if (t) tax += net * (Number(t.rate)||0) / 100
  }
  const ship = Number(inv.shippingFree ? 0 : (inv.shippingAmount ?? inv.shippingFee ?? 0))
  return { sub, tax, shipping: ship, total: sub + tax + ship }
})

// Payment schedule (hide when fully paid)
function addDaysStr(dateStr, days){ const [y,m,d]=String(dateStr||'').split('-').map(Number); const dt=new Date(y||0,(m||1)-1,d||1); dt.setDate(dt.getDate()+(Number(days)||0)); const yy=dt.getFullYear(), mm=String(dt.getMonth()+1).padStart(2,'0'), dd=String(dt.getDate()).padStart(2,'0'); return `${yy}-${mm}-${dd}` }
function nextDayOfMonthStr(dateStr, day){ const [y,m,d]=String(dateStr||'').split('-').map(Number); const dt=new Date(y||0,(m||1)-1,d||1); const nd=new Date(dt.getFullYear(), dt.getMonth()+1, 1); const last=new Date(nd.getFullYear(), nd.getMonth()+1, 0).getDate(); nd.setDate(Math.min(Number(day)||1,last)); const yy=nd.getFullYear(), mm=String(nd.getMonth()+1).padStart(2,'0'), dd=String(nd.getDate()).padStart(2,'0'); return `${yy}-${mm}-${dd}` }
const scheduleRows = computed(() => {
  const inv = invoice.value
  const term = paymentTerm.value
  if (!inv || !term || inv.paidInFull) return []
  const total = totals.value.total
  const lines = (term.schedule || []).slice().sort((a,b)=> (a.sequence||0)-(b.sequence||0))
  let remaining = total
  return lines.map((l, idx) => {
    const date = l.dateType === 'day_of_month' ? nextDayOfMonthStr(inv.date, l.dayOfMonth||1) : addDaysStr(inv.date, l.days||0)
    let amount = l.valueType === 'percent' ? total * (Number(l.valueAmount)||0)/100 : Number(l.valueAmount)||0
    if (idx === lines.length - 1) amount = remaining
    remaining = Math.max(0, remaining - amount)
    return [l.description || `Installment ${idx+1}`, date, amount]
  })
})

// Linked Credit Notes
const creditNotes = computed(() =>
  (store.creditNotes || []).filter(cn =>
    cn.originalInvoiceId === invoice.value?.id &&
    (cn.status === 'issued' || cn.status === 'applied')
  )
)
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
const creditsTotal = computed(() => creditNotes.value.reduce((sum, cn) => sum + cnTotal(cn), 0))

// Print and PDF
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
  if (!window.html2canvas) await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js')
  if (!window.jspdf) await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')
  return window.jspdf
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
        <title>${invoice.value?.number || 'Invoice'}</title>
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
  // Show only POS receipt markup and invoke browser print dialog
  document.body.classList.add('pos-print')
  const cleanup = () => document.body.classList.remove('pos-print')

  // Ensure cleanup even if user cancels print or browser doesn't fire afterprint
  window.addEventListener('afterprint', cleanup, { once: true })
  setTimeout(() => {
    try { window.print() } finally {
      // Fallback cleanup in case afterprint doesn't trigger (Safari etc.)
      setTimeout(cleanup, 1200)
    }
  }, 50)
}

async function downloadPdf() {
  if (!printRef?.value || !invoice.value) return

  async function ensurePdfMake() {
    if (!window.pdfMake) {
      await new Promise((res, rej) => { const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s) })
      await new Promise((res, rej) => { const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.min.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s) })
    }
    return window.pdfMake
  }
  await ensurePdfMake()

  const inv = invoice.value
  const merch = merchant.value
  const cust = customer.value
  function discText(it) {
    return (it.discountType||'none')==='percent'
      ? `-${Number(it.discountValue||0).toFixed(0)}%`
      : (it.discountType||'none')==='fixed'
        ? `- ${(Number(it.discountValue||0)*Number(it.qty||0)).toFixed(2)}`
        : '—'
  }
  const body = [
    [{ text: 'Product / Description', bold: true }, { text: 'Qty', alignment: 'right', bold: true }, { text: 'Unit', alignment: 'right', bold: true }, { text: 'Discount', alignment: 'right', bold: true }, { text: 'Line', alignment: 'right', bold: true }],
    ...(inv.items||[]).map(it => [
      productById(it.productId)?.name || it.description || '—',
      { text: String(it.qty||0), alignment: 'right' },
      { text: (Number(it.unitPrice||0)).toFixed(2), alignment: 'right' },
      { text: discText(it), alignment: 'right' },
      { text: lineNet(it).toFixed(2), alignment: 'right' }
    ])
  ]
  const scheduleRows = [] // keep simple; detail view may not need schedule

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
            { text: 'Invoice', style: 'title', alignment: 'right' },
            { text: `No: ${inv.number}`, bold: true, alignment: 'right' },
            { text: `Date: ${inv.date}`, alignment: 'right' },
            { text: `Due: ${inv.dueDate}`, alignment: 'right' }
          ]
        ]
      },
      { text: ' ', margin: [0,6] },
      { text: 'Bill To', bold: true },
      { text: cust?.name || '' },
      { text: cust?.addresses?.length ? `${cust.addresses[0].line1}, ${cust.addresses[0].city}` : '' },
      { text: ' ', margin: [0,6] },
      {
        table: { headerRows: 1, widths: ['*', 40, 50, 55, 60], body },
        layout: 'lightHorizontalLines'
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
              { text: `Shipping: ${totals.value.shipping.toFixed(2)}` },
              { text: `Total: ${totals.value.total.toFixed(2)}`, bold: true }
            ]
          }
        ],
        margin: [0, 8, 0, 0]
      }
    ],
    footer: (currentPage, pageCount) => ({
      margin: [28, 8, 28, 16],
      fontSize: 9,
      text: [
        (termsTpl.value?.content || '').trim(),
        store.settings?.invoice?.footerText ? ('\n' + store.settings.invoice.footerText) : ''
      ].join('')
    }),
    styles: {
      title: { fontSize: 18, color: '#4a148c', bold: true }
    },
    defaultStyle: { fontSize: 10 }
  }
  window.pdfMake.createPdf(docDefinition).download(`invoice_${inv.number || 'view'}.pdf`)
}

// Actions
function editInvoice() {
  if (invoice.value) router.push(`/invoices/${invoice.value.id}/edit`)
}
</script>

<template>
  <div class="row g-3" v-if="invoice">
    <div class="col-12">
      <SectionCard :title="`Invoice ${invoice.number}`">
        <template #actions>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" @click="editInvoice">Edit</button>
            <button class="btn btn-outline-secondary" @click="printInvoice">Print</button>
              <button class="btn btn-outline-secondary" @click="printReceipt">Receipt</button>
            <button class="btn btn-outline-secondary" @click="() => router.push(`/credit-notes/new?invoiceId=${invoice.id}`)">New Credit Note</button>
            <button class="btn btn-primary" @click="downloadPdf">Download PDF</button>
          </div>
        </template>

        <div class="print-area" ref="printRef">
          <div class="d-flex justify-content-between mb-3">
            <div>
              <strong>{{ merchant?.name }}</strong><br/>
              <span v-if="merchantSelectedAddress">{{ merchantSelectedAddress.line1 }}, {{ merchantSelectedAddress.city }}</span><br v-if="merchantSelectedAddress"/>
              <span v-if="merchant?.taxId" class="text-muted small">VAT/TAX ID: {{ merchant.taxId }}</span><br v-if="merchant?.taxId"/>
              <span v-if="merchantSelectedContact" class="text-muted small">{{ merchantSelectedContact.name }}<span v-if="merchantSelectedContact.email"> · {{ merchantSelectedContact.email }}</span><span v-if="merchantSelectedContact.phone"> · {{ merchantSelectedContact.phone }}</span></span>
            </div>
            <div class="text-end">
              <h4 class="mb-1">Invoice</h4>
              <div><strong>No: {{ invoice.number }}</strong></div>
              <div>Date: {{ invoice.date }}</div>
              <div>Due: {{ invoice.dueDate }}</div>
            </div>
          </div>

          <div class="mb-2 info-block">
            <div class="text-uppercase muted-label">Bill To</div>
            <div class="fw-semibold">{{ customer?.name }}</div>
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
              <tr v-for="it in invoice.items" :key="it.id">
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
                  <template v-if="invoice.shippingFree">
                    <span class="text-decoration-line-through">{{ Number(invoice.shippingAmount||0).toFixed(2) }}</span>
                    <span class="ms-1">0.00</span>
                  </template>
                  <template v-else>
                    {{ totals.shipping.toFixed(2) }}
                  </template>
                </span>
              </div>
              <div class="line grand"><span>Total</span><span>{{ totals.total.toFixed(2) }}</span></div>
              <div class="line" v-if="creditsTotal > 0"><span>Credits</span><span>-{{ creditsTotal.toFixed(2) }}</span></div>
              <div class="line" v-if="invoice.paidInFull || Number(invoice.receivedAmount||0) > 0"><span>Received</span><span>{{ Number(invoice.receivedAmount||0).toFixed(2) }}</span></div>
              <div class="line" v-if="Number(invoice.changeAmount||0) > 0"><span>Change</span><span>{{ Number(invoice.changeAmount||0).toFixed(2) }}</span></div>
              <div class="line" v-if="invoice.paidInFull || Number(invoice.receivedAmount||0) > 0 || creditsTotal>0"><span class="fw-semibold">Balance Due</span><span class="fw-semibold">{{ Math.max(0, totals.total - creditsTotal - Number(invoice.receivedAmount||0)).toFixed(2) }}</span></div>
              <div class="muted small mt-1" v-if="shippingMethod">
                Shipping via {{ shippingMethod?.name }}
              </div>
            </div>
          </div>

          <div class="mt-2" v-if="paymentTerm && !invoice.paidInFull && scheduleRows.length">
            <strong>Payment Schedule — {{ paymentTerm?.name }}</strong>
            <table class="table table-sm mt-1">
              <thead class="table-light"><tr><th>Installment</th><th>Date</th><th class="text-end">Amount</th></tr></thead>
              <tbody>
                <tr v-for="r in scheduleRows" :key="r[0] + r[1]">
                  <td>{{ r[0] }}</td>
                  <td>{{ r[1] }}</td>
                  <td class="text-end">{{ Number(r[2]).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-3 invoice-terms" v-if="termsTpl?.content">
            <strong>Terms</strong>
            <div style="white-space:pre-wrap;">{{ termsTpl.content }}</div>
          </div>
          <div class="mt-2 text-muted" v-if="store.settings?.invoice?.footerText">
            {{ store.settings.invoice.footerText }}
          </div>

          <div class="mt-2" v-if="invoice.notes">
            <strong>Notes</strong>
            <div style="white-space:pre-wrap;">{{ invoice.notes }}</div>
          </div>
        </div>

        <!-- Hidden POS receipt; will be revealed only during print -->
        <div class="pos-receipt" aria-hidden="true">
          <div class="pos-head center">
            <div class="title">{{ merchant?.name }}</div>
            <div class="small muted" v-if="merchantSelectedAddress">{{ merchantSelectedAddress.line1 }}, {{ merchantSelectedAddress.city }}</div>
            <div class="small muted" v-if="merchant?.taxId">VAT/TAX: {{ merchant.taxId }}</div>
          </div>

          <hr class="pos-hr" />
          <div class="center title">TAX INVOICE</div>
          <div class="pos-line small"><span>No:</span><span>{{ invoice?.number }}</span></div>
          <div class="pos-line small"><span>Date:</span><span>{{ invoice?.date }}</span></div>
          <div class="pos-line small" v-if="customer?.name"><span>Customer:</span><span>{{ customer.name }}</span></div>

          <hr class="pos-hr" />

          <table class="pos-items">
            <thead>
              <tr>
                <th class="sl">SL</th>
                <th>Item Description</th>
                <th class="amt">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in invoice.items" :key="it.id">
                <td class="sl">{{ String(idx+1).padStart(2,'0') }}</td>
                <td class="desc">
                  <div class="nm">{{ productById(it.productId)?.name || it.description || '—' }}</div>
                  <div class="muted small">{{ Number(it.qty||0) }} x {{ Number(it.unitPrice||0).toFixed(2) }}</div>
                </td>
                <td class="amt">{{ lineNet(it).toFixed(2) }}</td>
              </tr>
              <tr v-if="!invoice.items || !invoice.items.length"><td colspan="3" class="small muted">No items</td></tr>
            </tbody>
          </table>

          <hr class="pos-hr" />

          <div class="pos-totals">
            <div class="pos-line"><span>Subtotal</span><span>{{ totals.sub.toFixed(2) }}</span></div>
            <div class="pos-line"><span>VAT</span><span>{{ totals.tax.toFixed(2) }}</span></div>
            <div class="pos-line" v-if="totals.shipping > 0"><span>Shipping</span><span>{{ totals.shipping.toFixed(2) }}</span></div>
            <div class="pos-line grand"><span>Net Amount</span><span>{{ totals.total.toFixed(2) }}</span></div>
            <div class="pos-line" v-if="creditsTotal > 0"><span>Credits</span><span>-{{ creditsTotal.toFixed(2) }}</span></div>
            <div class="pos-line" v-if="invoice.paidInFull || Number(invoice.receivedAmount||0) > 0"><span>Received</span><span>{{ Number(invoice.receivedAmount||0).toFixed(2) }}</span></div>
            <div class="pos-line" v-if="Number(invoice.changeAmount||0) > 0"><span>Change</span><span>{{ Number(invoice.changeAmount||0).toFixed(2) }}</span></div>
            <div class="pos-line" v-if="invoice.paidInFull || Number(invoice.receivedAmount||0) > 0 || creditsTotal>0"><span>Balance</span><span>{{ Math.max(0, totals.total - creditsTotal - Number(invoice.receivedAmount||0)).toFixed(2) }}</span></div>
          </div>

          <hr class="pos-hr" />

          <div class="small muted" v-if="shippingMethod">Shipping via {{ shippingMethod?.name }}</div>
          <div class="small muted">Prices inclusive of VAT where applicable.</div>
          <div class="center small muted" v-if="store.settings?.invoice?.footerText" style="margin-top:4px;">{{ store.settings.invoice.footerText }}</div>
          <div class="center small" style="margin-top:6px">Thank you!</div>
        </div>


        <!-- Hidden POS receipt; will be revealed only during print -->
        <div class="pos-receipt" aria-hidden="true">
          <div class="pos-head center">
            <div class="title">{{ merchant?.name }}</div>
            <div class="small muted" v-if="merchantSelectedAddress">{{ merchantSelectedAddress.line1 }}, {{ merchantSelectedAddress.city }}</div>
            <div class="small muted" v-if="merchant?.taxId">VAT/TAX: {{ merchant.taxId }}</div>
          </div>

          <hr class="pos-hr" />
          <div class="center title">TAX INVOICE</div>
          <div class="pos-line small"><span>No:</span><span>{{ invoice?.number }}</span></div>
          <div class="pos-line small"><span>Date:</span><span>{{ invoice?.date }}</span></div>
          <div class="pos-line small" v-if="customer?.name"><span>Customer:</span><span>{{ customer.name }}</span></div>

          <hr class="pos-hr" />

          <table class="pos-items">
            <thead>
              <tr>
                <th class="sl">SL</th>
                <th>Item Description</th>
                <th class="amt">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in invoice.items" :key="it.id">
                <td class="sl">{{ String(idx+1).padStart(2,'0') }}</td>
                <td class="desc">
                  <div class="nm">{{ productById(it.productId)?.name || it.description || '—' }}</div>
                  <div class="muted small">{{ Number(it.qty||0) }} x {{ Number(it.unitPrice||0).toFixed(2) }}</div>
                </td>
                <td class="amt">{{ lineNet(it).toFixed(2) }}</td>
              </tr>
              <tr v-if="!invoice.items || !invoice.items.length"><td colspan="3" class="small muted">No items</td></tr>
            </tbody>
          </table>

          <hr class="pos-hr" />

          <div class="pos-totals">
            <div class="pos-line"><span>Subtotal</span><span>{{ totals.sub.toFixed(2) }}</span></div>
            <div class="pos-line"><span>VAT</span><span>{{ totals.tax.toFixed(2) }}</span></div>
            <div class="pos-line" v-if="totals.shipping > 0"><span>Shipping</span><span>{{ totals.shipping.toFixed(2) }}</span></div>
            <div class="pos-line grand"><span>Net Amount</span><span>{{ totals.total.toFixed(2) }}</span></div>
            <div class="pos-line" v-if="creditsTotal > 0"><span>Credits</span><span>-{{ creditsTotal.toFixed(2) }}</span></div>
            <div class="pos-line" v-if="invoice.paidInFull || Number(invoice.receivedAmount||0) > 0"><span>Received</span><span>{{ Number(invoice.receivedAmount||0).toFixed(2) }}</span></div>
            <div class="pos-line" v-if="Number(invoice.changeAmount||0) > 0"><span>Change</span><span>{{ Number(invoice.changeAmount||0).toFixed(2) }}</span></div>
            <div class="pos-line" v-if="invoice.paidInFull || Number(invoice.receivedAmount||0) > 0 || creditsTotal>0"><span>Balance</span><span>{{ Math.max(0, totals.total - creditsTotal - Number(invoice.receivedAmount||0)).toFixed(2) }}</span></div>
          </div>

          <hr class="pos-hr" />

          <div class="small muted" v-if="shippingMethod">Shipping via {{ shippingMethod?.name }}</div>
          <div class="small muted">Prices inclusive of VAT where applicable.</div>
          <div class="center small muted" v-if="store.settings?.invoice?.footerText" style="margin-top:4px;">{{ store.settings.invoice.footerText }}</div>
          <div class="center small" style="margin-top:6px">Thank you!</div>
        </div>

      </SectionCard>
    </div>
  </div>
  <div v-else class="text-muted">Invoice not found.</div>
</template>

<style>
/* POS receipt base (hidden on screen) */
.pos-receipt { display: none; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; color: #000; }
.pos-receipt .center { text-align: center; }
.pos-receipt .title { font-weight: 700; letter-spacing: .5px; }
.pos-receipt .small { font-size: 11px; }
.pos-receipt .muted { color: #444; }
.pos-receipt .pos-line { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
.pos-receipt .pos-items { width: 100%; border-collapse: collapse; font-size: 12px; }
.pos-receipt .pos-items th, .pos-receipt .pos-items td { padding: 2px 0; }
.pos-receipt .pos-items .sl { width: 18px; }
.pos-receipt .pos-items .desc .nm { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 52mm; }
.pos-receipt .pos-items .amt { text-align: right; white-space: nowrap; }
.pos-receipt .pos-hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
.pos-receipt .pos-totals .grand { font-weight: 700; }

/* Print-only rules for POS mode */
@media print {
  body.pos-print { margin: 0 !important; padding: 0 !important; }
  @page { size: 80mm auto; margin: 0; }

  /* Hide everything by default when printing in POS mode */
  body.pos-print * { visibility: hidden !important; }

  /* Show only the receipt */
  body.pos-print .pos-receipt,
  body.pos-print .pos-receipt * { visibility: visible !important; }

  /* Ensure layout and dimensions for receipt */
  body.pos-print .pos-receipt {
    display: block !important;
    position: fixed;
    left: 0; top: 0;
    width: 80mm;
    padding: 4mm 3mm 8mm;
    box-sizing: border-box;
    background: #fff;
  }
}
</style>

<style>
/* POS receipt base (hidden on screen) */
.pos-receipt { display: none; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; color: #000; }
.pos-receipt .center { text-align: center; }
.pos-receipt .title { font-weight: 700; letter-spacing: .5px; }
.pos-receipt .small { font-size: 11px; }
.pos-receipt .muted { color: #444; }
.pos-receipt .pos-line { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
.pos-receipt .pos-items { width: 100%; border-collapse: collapse; font-size: 12px; }
.pos-receipt .pos-items th, .pos-receipt .pos-items td { padding: 2px 0; }
.pos-receipt .pos-items .sl { width: 18px; }
.pos-receipt .pos-items .desc .nm { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 52mm; }
.pos-receipt .pos-items .amt { text-align: right; white-space: nowrap; }
.pos-receipt .pos-hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
.pos-receipt .pos-totals .grand { font-weight: 700; }

/* Print-only rules for POS mode */
@media print {
  body.pos-print { margin: 0 !important; padding: 0 !important; }
  @page { size: 80mm auto; margin: 0; }

  /* Hide everything by default when printing in POS mode */
  body.pos-print * { visibility: hidden !important; }

  /* Show only the receipt */
  body.pos-print .pos-receipt,
  body.pos-print .pos-receipt * { visibility: visible !important; }

  /* Ensure layout and dimensions for receipt */
  body.pos-print .pos-receipt {
    display: block !important;
    position: fixed;
    left: 0; top: 0;
    width: 80mm;
    padding: 4mm 3mm 8mm;
    box-sizing: border-box;
    background: #fff;
  }
}
</style>
