
<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'

const route = useRoute()
const router = useRouter()
const printRef = ref(null)

const creditNote = computed(() => (store.creditNotes || []).find(i => i.id === route.params.id))
const merchant = computed(() => store.merchants.find(x => x.id === creditNote.value?.merchantId))
const customer = computed(() => store.customers.find(x => x.id === creditNote.value?.customerId))
const refInvoice = computed(() => store.invoices.find(i => i.id === creditNote.value?.originalInvoiceId))

const merchantAddresses = computed(() => merchant.value?.addresses || [])
const merchantContacts = computed(() => merchant.value?.contacts || [])
const merchantSelectedAddress = computed(() =>
  merchantAddresses.value.find(a => a.id === creditNote.value?.merchantAddressId) || merchantAddresses.value?.[0]
)
const merchantSelectedContact = computed(() =>
  merchantContacts.value.find(c => c.id === creditNote.value?.merchantContactId) || merchantContacts.value?.[0]
)

const customerAddresses = computed(() => customer.value?.addresses || [])
const customerContacts = computed(() => customer.value?.contacts || [])
const customerSelectedAddress = computed(() =>
  customerAddresses.value.find(a => a.id === creditNote.value?.customerAddressId) || customerAddresses.value?.[0]
)
const customerSelectedContact = computed(() =>
  customerContacts.value.find(c => c.id === creditNote.value?.customerContactId) || customerContacts.value?.[0]
)

function lineNet(it) {
  const base = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0)
  const dtype = it.discountType || 'none'
  const dval = Number(it.discountValue) || 0
  const disc = dtype === 'percent' ? base * dval / 100 : dtype === 'fixed' ? (Number(it.qty) || 0) * dval : 0
  return Math.max(0, base - disc)
}
const totals = computed(() => {
  const cn = creditNote.value
  if (!cn) return { sub: 0, tax: 0, total: 0 }
  let sub = 0, tax = 0
  for (const it of (cn.items || [])) {
    const net = lineNet(it)
    sub += net
    const t = store.taxes.find(x => x.id === it.taxId)
    if (t) tax += net * (Number(t.rate) || 0) / 100
  }
  return { sub, tax, total: sub + tax }
})

function editCN() {
  if (creditNote.value) router.push(`/credit-notes/${creditNote.value.id}/edit`)
}

function printCN() {
  if (!printRef?.value) return
  const html = printRef.value.outerHTML
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) return
  w.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${creditNote.value?.number || 'Credit Note'}</title>
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


function printPosReceipt() {
  const cn = creditNote.value
  if (!cn) return
  const merch = merchant.value
  const cust = customer.value

  const sub = Number(totals.value.sub.toFixed(2))
  const tax = Number(totals.value.tax.toFixed(2))
  const grand = Number(totals.value.total.toFixed(2))

  // Compute overall discount from items
  const discount = (cn.items || []).reduce((acc, it) => {
    const base = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0)
    const net = lineNet(it)
    return acc + Math.max(0, base - net)
  }, 0)

  // Amount in words (simple English)
  function toWords(num) {
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
    function n2w(n) {
      if (n < 20) return a[n]
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
      if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + n2w(n % 100) : '')
      if (n < 1_000_000) return n2w(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + n2w(n % 1000) : '')
      if (n < 1_000_000_000) return n2w(Math.floor(n / 1_000_000)) + ' million' + (n % 1_000_000 ? ' ' + n2w(n % 1_000_000) : '')
      return String(n)
    }
    const i = Math.floor(num)
    const d = Math.round((num - i) * 100)
    let s = i === 0 ? 'zero' : n2w(i)
    if (d) s += ` and ${d}/100`
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  const amountInWords = toWords(grand) + ' only'

  const itemsRows = (cn.items || []).map((it, idx) => {
    const name = (store.products.find(p => p.id === it.productId)?.name || it.description || '—')
    const qty = Number(it.qty || 0)
    const rate = Number(it.unitPrice || 0).toFixed(2)
    const net = Number(lineNet(it) || 0).toFixed(2)
    const discTxt = (it.discountType || 'none') === 'percent'
      ? ` · -${Number(it.discountValue || 0).toFixed(0)}%`
      : (it.discountType || 'none') === 'fixed'
        ? ` · -${(Number(it.discountValue || 0) * Number(it.qty || 0)).toFixed(2)}`
        : ''
    return `
      <tr>
        <td class="sl">${String(idx + 1).padStart(2,'0')}</td>
        <td class="desc">
          <div class="nm">${name}</div>
          <div class="muted small">${qty} x ${rate}${discTxt}</div>
        </td>
        <td class="amt">${net}</td>
      </tr>
    `
  }).join('')

  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) return
  w.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Credit Note ${cn.number || ''}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { margin: 0; padding: 0; background: #fff; }
          body { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }
          .rcpt { width: 80mm; padding: 4mm 3mm 8mm; box-sizing: border-box; color: #000; font-size: 12px; }
          .center { text-align: center; }
          .title { font-weight: 700; letter-spacing: .5px; }
          .muted { color: #444; }
          .small { font-size: 11px; }
          hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 2px 0; }
          th { text-align: left; font-weight: 700; }
          .items .sl { width: 18px; }
          .items .desc .nm { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 52mm; }
          .items .amt { text-align: right; white-space: nowrap; }
          .totals .line { display: flex; justify-content: space-between; }
          .totals .grand { font-weight: 700; }
          @media print { .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="rcpt">
          <div class="center">
            <div class="title">${merch?.name || ''}</div>
            ${merch?.addresses?.[0] ? `<div class="small muted">${merch.addresses[0].line1}, ${merch.addresses[0].city}</div>` : ''}
            ${merch?.taxId ? `<div class="small muted">VAT/TAX: ${merch.taxId}</div>` : ''}
          </div>

          <hr />
          <div class="center title">CREDIT NOTE</div>
          <div class="line small" style="display:flex;justify-content:space-between;"><span>No:</span><span>${cn.number || ''}</span></div>
          <div class="line small" style="display:flex;justify-content:space-between;"><span>Date:</span><span>${cn.date || ''}</span></div>
          ${refInvoice.value ? `<div class="line small" style="display:flex;justify-content:space-between;"><span>Ref Inv:</span><span>${refInvoice.value.number}</span></div>` : ''}
          ${cust?.name ? `<div class="line small" style="display:flex;justify-content:space-between;"><span>Customer:</span><span>${cust.name}</span></div>` : ''}
          ${cn.reason ? `<div class="small muted">Reason: ${cn.reason}</div>` : ''}

          <hr />

          <table class="items">
            <thead>
              <tr>
                <th class="sl">SL</th>
                <th>Item Description</th>
                <th class="amt">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows || `<tr><td colspan="3" class="small muted">No items</td></tr>`}
            </tbody>
          </table>

          <hr />

          <div class="totals">
            <div class="line"><span>Subtotal</span><span>${sub.toFixed(2)}</span></div>
            ${discount > 0 ? `<div class="line"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>` : ''}
            <div class="line"><span>VAT</span><span>${tax.toFixed(2)}</span></div>
            <div class="line grand"><span>Total Credit</span><span>${grand.toFixed(2)}</span></div>
          </div>

          <hr />

          <div class="small"><strong>In words:</strong> ${amountInWords}</div>

          <hr />

          ${store.settings?.creditNote?.footerText ? `<div class="center small muted">${store.settings.creditNote.footerText}</div>` : ''}
          <div class="center small" style="margin-top:6px">Thank you!</div>
        </div>

        <script>
          window.addEventListener('load', function(){
            setTimeout(function(){
              try { window.focus(); window.print(); } finally { window.close(); }
            }, 120);
          });
        <\/script>
      </body>
    </html>
  `)
  w.document.close()
  try { w.focus(); } catch (e) {}
  const triggerPrint = () => setTimeout(() => { try { w.focus(); w.print(); } catch(_) {} }, 300)
  if (w.document.readyState === 'complete') { triggerPrint() } else { w.addEventListener('load', triggerPrint) }
}

async function downloadPdf() {
  if (!printRef?.value || !creditNote.value) return

  async function ensurePdfMake() {
    if (!window.pdfMake) {
      await new Promise((res, rej) => { const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s) })
      await new Promise((res, rej) => { const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.min.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s) })
    }
    return window.pdfMake
  }
  await ensurePdfMake()

  const cn = creditNote.value
  const merch = merchant.value
  const cust = customer.value

  const body = [
    [{ text: 'Product / Description', bold: true }, { text: 'Qty', alignment: 'right', bold: true }, { text: 'Unit', alignment: 'right', bold: true }, { text: 'Discount', alignment: 'right', bold: true }, { text: 'Line', alignment: 'right', bold: true }],
    ...(cn.items || []).map(it => [
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
            { text: `No: ${cn.number}`, bold: true, alignment: 'right' },
            { text: `Date: ${cn.date}`, alignment: 'right' },
            refInvoice.value ? { text: `Ref Invoice: ${refInvoice.value.number}`, alignment: 'right' } : {}
          ]
        ]
      },
      { text: ' ', margin: [0,6] },
      { text: 'Bill To', bold: true },
      { text: cust?.name || '' },
      { text: cust?.addresses?.length ? `${cust.addresses[0].line1}, ${cust.addresses[0].city}` : '' },
      cn.reason ? { text: `Reason: ${cn.reason}`, margin: [0, 6, 0, 0] } : {},
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
  window.pdfMake.createPdf(docDefinition).download(`credit_note_${cn.number || 'view'}.pdf`)
}
</script>

<template>
  <div class="row g-3" v-if="creditNote">
    <div class="col-12">
      <SectionCard :title="`Credit Note ${creditNote.number}`">
        <template #actions>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" @click="editCN">Edit</button>
            <button class="btn btn-outline-secondary" @click="printCN">Print</button>
            <button class="btn btn-outline-secondary" @click="printPosReceipt">Receipt</button>
            <button class="btn btn-primary" @click="downloadPdf">Download PDF</button>
          </div>
        </template>

        <div class="print-area" ref="printRef">
          <div class="d-flex justify-content-between mb-3">
            <div>
              <strong>{{ merchant?.name }}</strong><br />
              <span v-if="merchantSelectedAddress">{{ merchantSelectedAddress.line1 }}, {{ merchantSelectedAddress.city }}</span><br v-if="merchantSelectedAddress" />
              <span v-if="merchant?.taxId" class="text-muted small">VAT/TAX ID: {{ merchant.taxId }}</span><br v-if="merchant?.taxId" />
              <span v-if="merchantSelectedContact" class="text-muted small">{{ merchantSelectedContact.name }}<span v-if="merchantSelectedContact.email"> · {{ merchantSelectedContact.email }}</span><span v-if="merchantSelectedContact.phone"> · {{ merchantSelectedContact.phone }}</span></span>
            </div>
            <div class="text-end">
              <h4 class="mb-1">Credit Note</h4>
              <div><strong>No: {{ creditNote.number }}</strong></div>
              <div>Date: {{ creditNote.date }}</div>
              <div v-if="refInvoice">Ref Invoice: {{ refInvoice?.number }}</div>
            </div>
          </div>

          <div class="mb-2 info-block">
            <div class="text-uppercase muted-label">Bill To</div>
            <div class="fw-semibold">{{ customer?.name }}</div>
            <div v-if="customerSelectedAddress">{{ customerSelectedAddress.line1 }}, {{ customerSelectedAddress.city }}</div>
            <div v-if="customer?.taxId" class="text-muted small">VAT/TAX ID: {{ customer.taxId }}</div>
            <div v-if="creditNote.reason" class="text-muted small">Reason: {{ creditNote.reason }}</div>
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
              <tr v-for="it in creditNote.items" :key="it.id">
                <td>
                  <div class="fw-medium">{{ store.products.find(p => p.id === it.productId)?.name || it.description || '—' }}</div>
                  <div v-if="it.description && store.products.find(p => p.id === it.productId)?.name !== it.description" class="text-muted small">{{ it.description }}</div>
                </td>
                <td class="text-end">{{ it.qty }}</td>
                <td class="text-end">{{ Number(it.unitPrice || 0).toFixed(2) }}</td>
                <td class="text-end">
                  <span v-if="(it.discountType || 'none') === 'percent'">-{{ Number(it.discountValue || 0).toFixed(0) }}%</span>
                  <span v-else-if="(it.discountType || 'none') === 'fixed'">-{{ (Number(it.discountValue || 0) * Number(it.qty || 0)).toFixed(2) }}</span>
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
              <div class="line grand"><span>Total Credit</span><span>{{ totals.total.toFixed(2) }}</span></div>
            </div>
          </div>

          <div class="mt-3 invoice-terms" v-if="store.settings?.creditNote?.footerText">
            <div class="text-muted">{{ store.settings.creditNote.footerText }}</div>
          </div>

          <div class="mt-2" v-if="creditNote.notes">
            <strong>Notes</strong>
            <div style="white-space: pre-wrap;">{{ creditNote.notes }}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
  <div v-else class="text-muted">Credit Note not found.</div>
</template>