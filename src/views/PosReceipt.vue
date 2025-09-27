<script setup>
import { reactive, ref, computed, watch, onMounted, nextTick } from 'vue'
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'

// Store data
const merchants = computed(() => store.merchants || [])
const customers = computed(() => store.customers || [])
const products = computed(() => store.products || [])

// Selected references
const selectedMerchantId = ref('')
const selectedCustomerId = ref('')

// Header (persisted locally)
const header = reactive({
  shopName: '',
  address: '',
  taxId: '',
  phone: '',
  cashier: '',
  currency: 'BDT',
})

// Ad-hoc receipt info
const receipt = reactive({
  number: '',
  date: new Date().toISOString().slice(0, 10),
  customerName: '',
  customerPhone: '',
  note: '',
})

// Payments (Cash, Card, MFS + reference)
const payments = reactive({
  cash: 0,
  card: 0,
  mfs: 0,
  ref: ''
})

// Items
const items = ref([
  { id: 1, productId: '', name: '', qty: 1, unitPrice: 0, discountType: 'none', discountValue: 0, taxRate: 0 }
])
function addItem() {
  items.value.push({ id: Date.now() + Math.random(), productId: '', name: '', qty: 1, unitPrice: 0, discountType: 'none', discountValue: 0, taxRate: 0 })
}
function removeItem(i) {
  items.value.splice(i, 1)
  if (!items.value.length) addItem()
}

// Utility: primary address/contact
function primaryAddress(list) {
  const arr = Array.isArray(list) ? list : []
  return arr.find(a => a.isPrimary) || arr[0]
}
function primaryContact(list) {
  const arr = Array.isArray(list) ? list : []
  return arr.find(c => c.isPrimary) || arr[0]
}

// Auto-populate header from merchant
watch(selectedMerchantId, (id) => {
  const m = merchants.value.find(x => x.id === id)
  if (!m) return
  header.shopName = m.name || header.shopName
  const addr = primaryAddress(m.addresses)
  header.address = addr ? [addr.line1, addr.city].filter(Boolean).join(', ') : (m.address || header.address || '')
  header.taxId = m.taxId || header.taxId
  const contact = primaryContact(m.contacts)
  header.phone = contact?.phone || m.phone || header.phone
  saveHeader()
})

// Auto-populate customer info
watch(selectedCustomerId, (id) => {
  const c = customers.value.find(x => x.id === id)
  if (!c) return
  receipt.customerName = c.name || receipt.customerName
  const contact = primaryContact(c.contacts)
  receipt.customerPhone = contact?.phone || receipt.customerPhone
})

// Product change handler
function productDefaultPrice(p) {
  if (!p) return null
  const keys = ['price', 'unitPrice', 'sellingPrice', 'rate', 'mrp']
  for (const k of keys) {
    const v = Number(p[k])
    if (!Number.isNaN(v) && v > 0) return v
  }
  return null
}
function onProductChange(it) {
  const p = products.value.find(x => x.id === it.productId)
  if (p) {
    it.name = p.name || it.name
    const v = productDefaultPrice(p)
    if (v != null) it.unitPrice = v
  }
}

// Math
function lineBase(it) { return (Number(it.qty) || 0) * (Number(it.unitPrice) || 0) }
function lineDiscount(it) {
  const base = lineBase(it)
  const t = it.discountType || 'none'
  let v = Number(it.discountValue) || 0
  if (t === 'percent') {
    v = Math.min(100, Math.max(0, v))
    return base * v / 100
  }
  if (t === 'fixed') {
    const disc = (Number(it.qty) || 0) * Math.max(0, v)
    return Math.min(base, disc)
  }
  return 0
}
function lineNet(it) { return Math.max(0, lineBase(it) - lineDiscount(it)) }
function lineTax(it) { return lineNet(it) * (Number(it.taxRate) || 0) / 100 }

const totals = computed(() => {
  const disc = items.value.reduce((s, it) => s + lineDiscount(it), 0)
  const sub = items.value.reduce((s, it) => s + lineNet(it), 0) // sum net amounts
  const tax = items.value.reduce((s, it) => s + lineTax(it), 0)
  const total = Math.max(0, sub + tax)
  const paid = Number(payments.cash || 0) + Number(payments.card || 0) + Number(payments.mfs || 0)
  const change = Math.max(0, paid - total)
  const due = Math.max(0, total - paid)
  return { disc, sub, tax, total, paid, change, due }
})

function toWords(num) {
  const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  function n2w(n) {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
    if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + n2w(n % 100) : '')
    if (n < 1e6) return n2w(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + n2w(n % 1000) : '')
    if (n < 1e9) return n2w(Math.floor(n / 1e6)) + ' million' + (n % 1e6 ? ' ' + n2w(n % 1e6) : '')
    return String(n)
  }
  const i = Math.floor(num || 0)
  const d = Math.round(((num || 0) - i) * 100)
  let s = i === 0 ? 'zero' : n2w(i)
  if (d) s += ` and ${d}/100`
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const amountInWords = computed(() => toWords(totals.value.total) + ' only')
function fmt(n) { return Number(n || 0).toFixed(2) }

// Print (native dialog, same page)
function printReceipt() {
  document.body.classList.add('pos-print')
  const cleanup = () => document.body.classList.remove('pos-print')
  window.addEventListener('afterprint', cleanup, { once: true })
  nextTick(() => setTimeout(() => { try { window.print() } finally { setTimeout(cleanup, 1000) } }, 50))
}

// Helpers
function autoNumber() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `RC-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}
function resetReceipt() {
  receipt.number = autoNumber()
  receipt.date = new Date().toISOString().slice(0, 10)
  selectedCustomerId.value = ''
  receipt.customerName = ''
  receipt.customerPhone = ''
  receipt.note = ''
  payments.cash = 0; payments.card = 0; payments.mfs = 0
  items.value = [{ id: 1, productId: '', name: '', qty: 1, unitPrice: 0, discountType: 'none', discountValue: 0, taxRate: 0 }]
}

// Persist header and sample cashier names (Bangladesh)
onMounted(() => {
  receipt.number = autoNumber()
  try { Object.assign(header, JSON.parse(localStorage.getItem('posReceiptHeader') || '{}') || {}) } catch {}
})
function saveHeader() { localStorage.setItem('posReceiptHeader', JSON.stringify(header)) }

const cashierSuggestions = [
  'Md. Rahim', 'Abdul Karim', 'Ayesha Sultana', 'Sakib Hasan',
  'Sharmin Akter', 'Tanvir Ahmed', 'Taslima Begum', 'Shafiul Islam'
]
</script>

<template>
  <div class="row g-3">
    <div class="col-12">
      <SectionCard title="POS Receipt">
        <template #actions>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" @click="resetReceipt">New</button>
            <button class="btn btn-primary" @click="printReceipt">Print Receipt</button>
          </div>
        </template>

        <div class="row g-3">
          <!-- Left: Header and Customer -->
          <div class="col-12 col-lg-4">
            <div class="mb-2">
              <label class="form-label small">Shop (Merchant)</label>
              <select class="form-select form-select-sm" v-model="selectedMerchantId">
                <option value="">Select shop (optional)</option>
                <option v-for="m in merchants" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>

            <div class="mb-2">
              <label class="form-label small">Shop Name</label>
              <input class="form-control form-control-sm" v-model="header.shopName" @change="saveHeader" placeholder="Store / Company">
            </div>
            <div class="mb-2">
              <label class="form-label small">Address</label>
              <textarea class="form-control form-control-sm" rows="2" v-model="header.address" @change="saveHeader" placeholder="Street, City"></textarea>
            </div>
            <div class="row">
              <div class="col-6 mb-2">
                <label class="form-label small">VAT/TAX ID</label>
                <input class="form-control form-control-sm" v-model="header.taxId" @change="saveHeader" placeholder="Optional">
              </div>
              <div class="col-6 mb-2">
                <label class="form-label small">Phone</label>
                <input class="form-control form-control-sm" v-model="header.phone" @change="saveHeader" placeholder="Contact phone">
              </div>
            </div>
            <div class="row">
              <div class="col-6 mb-2">
                <label class="form-label small">Cashier</label>
                <input class="form-control form-control-sm" v-model="header.cashier" list="bd-cashiers" @change="saveHeader" placeholder="e.g. Md. Rahim">
                <datalist id="bd-cashiers">
                  <option v-for="c in cashierSuggestions" :key="c" :value="c">{{ c }}</option>
                </datalist>
              </div>
              <div class="col-6 mb-2">
                <label class="form-label small">Currency</label>
                <input class="form-control form-control-sm" v-model="header.currency" @change="saveHeader" placeholder="BDT">
              </div>
            </div>

            <div class="row">
              <div class="col-7 mb-2">
                <label class="form-label small">Receipt No.</label>
                <input class="form-control form-control-sm" v-model="receipt.number">
              </div>
              <div class="col-5 mb-2">
                <label class="form-label small">Date</label>
                <input type="date" class="form-control form-control-sm" v-model="receipt.date">
              </div>
            </div>

            <div class="mb-2">
              <label class="form-label small">Customer</label>
              <div class="input-group input-group-sm">
                <select class="form-select form-select-sm" style="max-width:50%" v-model="selectedCustomerId">
                  <option value="">Manual entry</option>
                  <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <input class="form-control form-control-sm" v-model="receipt.customerName" placeholder="Walk-in customer">
              </div>
            </div>
            <div class="mb-2">
              <label class="form-label small">Customer Phone</label>
              <input class="form-control form-control-sm" v-model="receipt.customerPhone" placeholder="Optional">
            </div>
            <div class="mb-2">
              <label class="form-label small">Note</label>
              <textarea class="form-control form-control-sm" rows="2" v-model="receipt.note" placeholder="Optional note for the receipt"></textarea>
            </div>
          </div>

          <!-- Right: Items and totals -->
          <div class="col-12 col-lg-8">
            <div class="table-responsive">
              <table class="table table-sm align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width:32%">Item</th>
                    <th class="text-end" style="width:8%">Qty</th>
                    <th class="text-end" style="width:14%">Rate</th>
                    <th class="text-end" style="width:18%">Discount</th>
                    <th class="text-end" style="width:10%">VAT%</th>
                    <th class="text-end" style="width:14%">Line</th>
                    <th style="width:4%"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(it, i) in items" :key="it.id">
                    <td>
                      <div class="input-group input-group-sm">
                        <select class="form-select form-select-sm" style="max-width:55%" v-model="it.productId" @change="onProductChange(it)">
                          <option value="">Custom</option>
                          <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                        </select>
                        <input class="form-control form-control-sm" v-model="it.name" placeholder="Item name">
                      </div>
                    </td>
                    <td><input class="form-control form-control-sm text-end" v-model.number="it.qty" type="number" step="1" min="0"></td>
                    <td><input class="form-control form-control-sm text-end" v-model.number="it.unitPrice" type="number" step="0.01" min="0"></td>
                    <td>
                      <div class="input-group input-group-sm">
                        <select class="form-select form-select-sm" style="max-width:90px" v-model="it.discountType">
                          <option value="none">None</option>
                          <option value="percent">%</option>
                          <option value="fixed">Fixed</option>
                        </select>
                        <input class="form-control form-control-sm text-end" v-model.number="it.discountValue" type="number" step="0.01" min="0">
                      </div>
                    </td>
                    <td><input class="form-control form-control-sm text-end" v-model.number="it.taxRate" type="number" step="0.01" min="0"></td>
                    <td class="text-end">{{ (lineNet(it) + lineTax(it)).toFixed(2) }}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-danger" @click="removeItem(i)">×</button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="7">
                      <button class="btn btn-sm btn-outline-primary" @click="addItem">+ Add Item</button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="row g-2">
              <div class="col-12 col-md-6">
                <div class="card p-2">
                  <div class="small text-muted mb-1">Payments</div>
                  <div class="mb-2">
                    <label class="form-label small">Cash</label>
                    <input class="form-control form-control-sm text-end" v-model.number="payments.cash" type="number" step="0.01" min="0">
                  </div>
                  <div class="mb-2">
                    <label class="form-label small">Card</label>
                    <input class="form-control form-control-sm text-end" v-model.number="payments.card" type="number" step="0.01" min="0">
                  </div>
                  <div class="mb-2">
                    <label class="form-label small">MFS</label>
                    <input class="form-control form-control-sm text-end" v-model.number="payments.mfs" type="number" step="0.01" min="0">
                  </div>
                  <div>
                    <label class="form-label small">Payment Ref</label>
                    <input class="form-control form-control-sm" v-model="payments.ref" placeholder="Txn ID / last 4 digits">
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="card p-2">
                  <div class="small text-muted mb-1">Totals</div>
                  <div class="d-flex justify-content-between"><span>Subtotal</span><span>{{ fmt(totals.sub) }}</span></div>
                  <div class="d-flex justify-content-between"><span>Discount</span><span>-{{ fmt(totals.disc) }}</span></div>
                  <div class="d-flex justify-content-between"><span>VAT</span><span>{{ fmt(totals.tax) }}</span></div>
                  <div class="d-flex justify-content-between fw-semibold"><span>Total</span><span>{{ fmt(totals.total) }} {{ header.currency }}</span></div>
                  <hr class="my-2">
                  <div class="d-flex justify-content-between"><span>Paid</span><span>{{ fmt(totals.paid) }} {{ header.currency }}</span></div>
                  <div class="d-flex justify-content-between" v-if="totals.change > 0"><span>Change</span><span>{{ fmt(totals.change) }} {{ header.currency }}</span></div>
                  <div class="d-flex justify-content-between" v-if="totals.due > 0"><span>Due</span><span>{{ fmt(totals.due) }} {{ header.currency }}</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Hidden thermal receipt (only shown when printing) -->
        <div class="pos-receipt" aria-hidden="true">
          <div class="center">
            <div class="title">{{ header.shopName }}</div>
            <div class="small muted" style="white-space: pre-wrap">{{ header.address }}</div>
            <div class="small muted" v-if="header.taxId">VAT/TAX: {{ header.taxId }}</div>
            <div class="small muted" v-if="header.phone">Phone: {{ header.phone }}</div>
          </div>

          <hr class="pos-hr">
          <div class="center title">TAX INVOICE</div>
          <div class="pos-line small"><span>No:</span><span>{{ receipt.number }}</span></div>
          <div class="pos-line small"><span>Date:</span><span>{{ receipt.date }}</span></div>
          <div class="pos-line small" v-if="receipt.customerName"><span>Customer:</span><span>{{ receipt.customerName }}</span></div>
          <div class="pos-line small" v-if="receipt.customerPhone"><span>Phone:</span><span>{{ receipt.customerPhone }}</span></div>
          <div class="pos-line small" v-if="header.cashier"><span>Cashier:</span><span>{{ header.cashier }}</span></div>

          <hr class="pos-hr">
          <table class="pos-items">
            <thead>
              <tr>
                <th class="sl">SL</th>
                <th>Item Description</th>
                <th class="amt">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in items" :key="it.id">
                <td class="sl">{{ String(idx + 1).padStart(2, '0') }}</td>
                <td class="desc">
                  <div class="nm">{{ it.name || '—' }}</div>
                  <div class="small muted">
                    {{ Number(it.qty || 0) }} x {{ Number(it.unitPrice || 0).toFixed(2) }}
                    <span v-if="(it.discountType || 'none') === 'percent'"> · -{{ Number(it.discountValue || 0) }}%</span>
                    <span v-else-if="(it.discountType || 'none') === 'fixed'"> · -{{ (Number(it.discountValue || 0) * Number(it.qty || 0)).toFixed(2) }}</span>
                    <span v-if="Number(it.taxRate || 0) > 0"> · VAT {{ Number(it.taxRate || 0).toFixed(2) }}%</span>
                  </div>
                </td>
                <td class="amt">{{ (lineNet(it) + lineTax(it)).toFixed(2) }}</td>
              </tr>
              <tr v-if="!items || !items.length">
                <td colspan="3" class="small muted">No items</td>
              </tr>
            </tbody>
          </table>

          <hr class="pos-hr">
          <div class="pos-totals">
            <div class="pos-line"><span>Subtotal</span><span>{{ fmt(totals.sub) }}</span></div>
            <div class="pos-line" v-if="totals.disc > 0"><span>Discount</span><span>-{{ fmt(totals.disc) }}</span></div>
            <div class="pos-line"><span>VAT</span><span>{{ fmt(totals.tax) }}</span></div>
            <div class="pos-line grand"><span>Net Amount</span><span>{{ fmt(totals.total) }} {{ header.currency }}</span></div>
          </div>

          <div class="small" style="margin:6px 0 2px 0"><strong>In words:</strong> {{ amountInWords }}</div>

          <hr class="pos-hr">
          <div class="pos-line" v-if="Number(payments.cash || 0) > 0"><span>Cash</span><span>{{ fmt(payments.cash) }} {{ header.currency }}</span></div>
          <div class="pos-line" v-if="Number(payments.card || 0) > 0"><span>Card</span><span>{{ fmt(payments.card) }} {{ header.currency }}</span></div>
          <div class="pos-line" v-if="Number(payments.mfs || 0) > 0"><span>MFS</span><span>{{ fmt(payments.mfs) }} {{ header.currency }}</span></div>
          <div class="pos-line" v-if="payments.ref"><span>Payment Ref</span><span>{{ payments.ref }}</span></div>
          <div class="pos-line"><span>Paid</span><span>{{ fmt(totals.paid) }} {{ header.currency }}</span></div>
          <div class="pos-line" v-if="totals.change > 0"><span>Change</span><span>{{ fmt(totals.change) }} {{ header.currency }}</span></div>
          <div class="pos-line" v-if="totals.due > 0"><span>Due</span><span>{{ fmt(totals.due) }} {{ header.currency }}</span></div>

          <hr class="pos-hr">
          <div class="center small muted" v-if="receipt.note" style="white-space: pre-wrap">{{ receipt.note }}</div>
          <div class="center small" style="margin-top:6px">Thank you!</div>
        </div>
      </SectionCard>
    </div>
  </div>
</template>

<style>
.table td, .table th { vertical-align: middle; }

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
  /* Force page width to receipt size */
  @page { size: 80mm auto; margin: 0; }
  html.pos-print, body.pos-print { width: 80mm !important; margin: 0 !important; padding: 0 !important; background: #fff; }

  /* Hide everything by default when printing in POS mode */
  body.pos-print * { visibility: hidden !important; }

  /* Show only the receipt */
  body.pos-print .pos-receipt,
  body.pos-print .pos-receipt * { visibility: visible !important; }

  /* Ensure the receipt is laid out at 80mm and not absolutely positioned */
  body.pos-print .pos-receipt {
    display: block !important;
    position: static !important;
    width: 80mm !important;
    padding: 4mm 3mm 8mm;
    box-sizing: border-box;
    background: #fff;
  }
}
</style>
