<script setup>
import { computed, onMounted, ref } from 'vue'
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
  const ship = Number(inv.shippingFee||0)
  return { sub, tax, shipping: ship, total: sub + tax + ship }
})

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
            { text: 'Invoice', style: 'title' },
            { text: `No: ${inv.number}` },
            { text: `Date: ${inv.date}` },
            { text: `Due: ${inv.dueDate}` }
          ],
          [
            { text: merch?.name || '', alignment: 'right', bold: true },
            { text: merch?.addresses?.length ? `${merch.addresses[0].line1}, ${merch.addresses[0].city}` : '', alignment: 'right' }
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
      text: (termsTpl.value?.content || '').trim()
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
            <button class="btn btn-primary" @click="downloadPdf">Download PDF</button>
          </div>
        </template>

        <div class="print-area" ref="printRef">
          <div class="d-flex justify-content-between mb-3">
            <div>
              <h4 class="mb-1">Invoice</h4>
              <div>No: {{ invoice.number }}</div>
              <div>Date: {{ invoice.date }}</div>
              <div>Due: {{ invoice.dueDate }}</div>
            </div>
            <div class="text-end">
              <strong>{{ merchant?.name }}</strong><br/>
              <span v-if="merchant?.addresses?.length">{{ merchant.addresses[0].line1 }}, {{ merchant.addresses[0].city }}</span>
            </div>
          </div>

          <div class="mb-2">
            <div><strong>Bill To</strong></div>
            <div>{{ customer?.name }}</div>
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

          <div class="mt-2 text-end">
            <div>Subtotal: {{ totals.sub.toFixed(2) }}</div>
            <div>Tax: {{ totals.tax.toFixed(2) }}</div>
            <div>Shipping: {{ totals.shipping.toFixed(2) }}</div>
            <div><strong>Total: {{ totals.total.toFixed(2) }}</strong></div>
          </div>
          <div class="text-muted small text-end" v-if="shippingMethod">
            Shipping via {{ shippingMethod?.name }}
          </div>

          <div class="mt-3 invoice-terms" v-if="termsTpl?.content">
            <strong>Terms</strong>
            <div style="white-space:pre-wrap;">{{ termsTpl.content }}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
  <div v-else class="text-muted">Invoice not found.</div>
</template>
