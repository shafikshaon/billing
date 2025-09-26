import { reactive, watch } from 'vue'

const LS_KEY = 'invoice_app_store_v1'

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9)
}

// Build a fresh default state with rich sample data
function createDefaultState() {
  // Taxes
  const taxVat = { id: uid('tax_'), name: 'VAT', rate: 10 }
  const taxGst = { id: uid('tax_'), name: 'GST', rate: 5 }

  // Payment terms
  const termDue = { id: uid('term_'), name: 'Due on Receipt', days: 0 }
  const term15 = { id: uid('term_'), name: 'Net 15', days: 15 }
  const term30 = { id: uid('term_'), name: 'Net 30', days: 30 }

  // Terms & conditions templates
  const tcStandard = {
    id: uid('tc_'),
    name: 'Standard',
    content:
      'Payment is due as per the chosen terms. Late payments may incur a fee. Goods sold are non-refundable unless defective.'
  }
  const tcServices = {
    id: uid('tc_'),
    name: 'Services',
    content:
      'Service delivery as scheduled. Cancellations require 48 hours notice. All work product remains property until full payment.'
  }

  // Merchants (the issuers of invoices)
  const merchantA = {
    id: uid('mrc_'),
    name: 'BluePeak Solutions LLC',
    type: 'company',
    email: 'billing@bluepeak.io',
    phone: '+1 (555) 120-3344',
    taxId: 'US-99-1234567',
    website: 'https://bluepeak.io',
    addresses: [
      {
        id: uid('addr_'),
        type: 'primary',
        isPrimary: true,
        line1: '500 Market Street',
        line2: 'Suite 320',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA'
      },
      {
        id: uid('addr_'),
        type: 'billing',
        isPrimary: false,
        line1: 'PO Box 245',
        line2: '',
        city: 'San Mateo',
        state: 'CA',
        zip: '94401',
        country: 'USA'
      }
    ],
    contacts: [
      { id: uid('ct_'), type: 'primary', name: 'Alex Miller', email: 'alex@bluepeak.io', phone: '+1 (555) 222-1111' },
      { id: uid('ct_'), type: 'billing', name: 'Finance Desk', email: 'finance@bluepeak.io', phone: '+1 (555) 222-2222' }
    ]
  }

  const merchantB = {
    id: uid('mrc_'),
    name: 'Nova Retail Co.',
    type: 'company',
    email: 'hello@novaretail.com',
    phone: '+1 (555) 430-9988',
    taxId: 'US-11-7654321',
    website: 'https://novaretail.com',
    addresses: [
      {
        id: uid('addr_'),
        type: 'primary',
        isPrimary: true,
        line1: '88 Madison Ave',
        line2: '',
        city: 'New York',
        state: 'NY',
        zip: '10016',
        country: 'USA'
      }
    ],
    contacts: [
      { id: uid('ct_'), type: 'primary', name: 'Taylor Reed', email: 'taylor@novaretail.com', phone: '+1 (555) 430-1122' }
    ]
  }

  // Customers (invoice receivers)
  const customerA = {
    id: uid('cus_'),
    name: 'Acme Manufacturing Inc.',
    kind: 'company',
    email: 'ap@acmemfg.com',
    phone: '+1 (555) 880-2244',
    taxId: 'US-55-4321098',
    addresses: [
      {
        id: uid('addr_'),
        type: 'primary',
        isPrimary: true,
        line1: '1200 Industrial Parkway',
        line2: '',
        city: 'Cleveland',
        state: 'OH',
        zip: '44114',
        country: 'USA'
      },
      {
        id: uid('addr_'),
        type: 'shipping',
        isPrimary: false,
        line1: 'Warehouse 3, Dock B',
        line2: '4800 Supply Rd',
        city: 'Cleveland',
        state: 'OH',
        zip: '44112',
        country: 'USA'
      }
    ],
    contacts: [
      { id: uid('ct_'), type: 'primary', name: 'Morgan Yu', email: 'morgan.yu@acmemfg.com', phone: '+1 (555) 880-9911' },
      { id: uid('ct_'), type: 'billing', name: 'AP Desk', email: 'ap@acmemfg.com', phone: '+1 (555) 880-2244' }
    ]
  }

  const customerB = {
    id: uid('cus_'),
    name: 'Jamie Rivera',
    kind: 'person',
    email: 'jamie.rivera@example.com',
    phone: '+1 (555) 701-4455',
    taxId: '',
    addresses: [
      {
        id: uid('addr_'),
        type: 'primary',
        isPrimary: true,
        line1: '742 Evergreen Terrace',
        line2: '',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'USA'
      }
    ],
    contacts: [
      { id: uid('ct_'), type: 'primary', name: 'Jamie Rivera', email: 'jamie.rivera@example.com', phone: '+1 (555) 701-4455' }
    ]
  }

  // Products
  const productA = {
    id: uid('prd_'),
    name: 'Consulting Hours',
    sku: 'CONS-HR',
    unit: 'hrs',
    type: 'service',
    price: 120,
    taxId: taxGst.id,
    active: true,
    description: 'Professional consulting services billed per hour.'
  }
  const productB = {
    id: uid('prd_'),
    name: 'Widget Pro',
    sku: 'WGT-PRO',
    unit: 'pcs',
    type: 'good',
    price: 45,
    taxId: taxVat.id,
    active: true,
    description: 'High-quality hardware widget.'
  }
  const productC = {
    id: uid('prd_'),
    name: 'Maintenance Plan',
    sku: 'MNT-PLN',
    unit: 'mo',
    type: 'service',
    price: 60,
    taxId: taxGst.id,
    active: true,
    description: 'Monthly maintenance subscription.'
  }

  // Invoices (sample draft)
  const inv1Id = uid('inv_')
  const line1 = { id: uid('li_'), productId: productA.id, description: 'Kickoff workshop & planning', qty: 8, unitPrice: 120, taxId: productA.taxId }
  const line2 = { id: uid('li_'), productId: productB.id, description: 'Widget Pro units', qty: 10, unitPrice: 45, taxId: productB.taxId }
  const inv1 = {
    id: inv1Id,
    number: 'INV-1001',
    date: new Date().toISOString().slice(0, 10),
    merchantId: merchantA.id,
    customerId: customerA.id,
    paymentTermId: term15.id,
    dueDate: null, // can be derived by UI from paymentTermId
    status: 'draft', // draft | sent | paid | void
    currency: 'USD',
    items: [line1, line2],
    notes: 'Thank you for your business!',
    termsTemplateId: tcStandard.id,
    attachments: []
  }

  return {
    merchants: [merchantA, merchantB],
    customers: [customerA, customerB],
    products: [productA, productB, productC],
    taxes: [taxVat, taxGst],
    paymentTerms: [termDue, term15, term30],
    termsTemplates: [tcStandard, tcServices],
    invoices: [inv1],
    settings: {
      currency: 'USD',
      dateFormat: 'YYYY-MM-DD'
    }
  }
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return createDefaultState()
    const parsed = JSON.parse(raw)
    // Shallow merge to ensure new defaults appear while keeping saved values
    return { ...createDefaultState(), ...parsed }
  } catch {
    return createDefaultState()
  }
}

export const store = reactive(load())

watch(
  store,
  (val) => {
    localStorage.setItem(LS_KEY, JSON.stringify(val))
  },
  { deep: true }
)

// Helpers
export function upsert(array, item, idKey = 'id') {
  const i = array.findIndex(x => x[idKey] === item[idKey])
  if (i === -1) array.push(item)
  else array.splice(i, 1, item)
}

export function removeById(array, id) {
  const i = array.findIndex(x => x.id === id)
  if (i !== -1) array.splice(i, 1)
}

// Expose utilities for UI
export function getDefaultState() {
  return createDefaultState()
}

export function resetStore() {
  const fresh = createDefaultState()
  Object.keys(fresh).forEach(k => {
    // preserve reactivity by assigning to existing keys
    // Arrays/objects replaced by new references (fine for reactive)
    store[k] = fresh[k]
  })
}

export { uid }
