import { reactive, watch } from 'vue'

const LS_KEY = 'invoice_app_store_v1'

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9)
}

// Build a fresh default state with rich sample data
function createDefaultState() {
  // Taxes (Bangladesh perspective)
  // Common VAT rates: 0% (zero-rated), 5%, 7.5%, 10%, 15% (standard)
  const vat15 = { id: uid('tax_'), name: 'VAT 15% (Standard)', rate: 15 }
  const vat10 = { id: uid('tax_'), name: 'VAT 10% (Reduced)', rate: 10 }
  const vat75 = { id: uid('tax_'), name: 'VAT 7.5% (Reduced)', rate: 7.5 }
  const vat5  = { id: uid('tax_'), name: 'VAT 5% (Reduced)', rate: 5 }
  const vat0  = { id: uid('tax_'), name: 'VAT 0% (Zero-rated)', rate: 0 }
  const taxesList = [vat15, vat10, vat75, vat5, vat0]

  // Payment terms (Bangladesh perspective) with schedules
  function termsBD() {
    const t = []
    // 1) Immediate full payment
    t.push({
      id: uid('term_'),
      name: 'Due on Receipt',
      description: 'Full payment on invoice date',
      active: true,
      sequence: 1,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'days_after', days: 0, dayOfMonth: null, description: 'Due on receipt' }]
    })
    // 2) Short net terms
    t.push({
      id: uid('term_'),
      name: 'Net 7',
      description: 'Full amount due in 7 days',
      active: true,
      sequence: 2,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'days_after', days: 7, dayOfMonth: null, description: '' }]
    })
    t.push({
      id: uid('term_'),
      name: 'Net 15',
      description: 'Full amount due in 15 days',
      active: true,
      sequence: 3,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'days_after', days: 15, dayOfMonth: null, description: '' }]
    })
    // 3) Popular BD-friendly nets
    t.push({
      id: uid('term_'),
      name: 'Net 30',
      description: 'Full amount due in 30 days',
      active: true,
      sequence: 4,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'days_after', days: 30, dayOfMonth: null, description: '' }]
    })
    t.push({
      id: uid('term_'),
      name: 'Net 45',
      description: 'Full amount due in 45 days',
      active: true,
      sequence: 5,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'days_after', days: 45, dayOfMonth: null, description: '' }]
    })
    t.push({
      id: uid('term_'),
      name: 'Net 60',
      description: 'Full amount due in 60 days',
      active: true,
      sequence: 6,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'days_after', days: 60, dayOfMonth: null, description: '' }]
    })
    // 4) Early payment discount combinations
    t.push({
      id: uid('term_'),
      name: '2/10 Net 30',
      description: '2% discount if paid within 10 days; otherwise due in 30 days',
      active: true,
      sequence: 7,
      settings: { earlyDiscountEnabled: true, earlyDiscountPercent: 2, earlyDiscountDays: 10, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'days_after', days: 30, dayOfMonth: null, description: '' }]
    })
    t.push({
      id: uid('term_'),
      name: '3/10 Net 45',
      description: '3% discount within 10 days; otherwise due in 45 days',
      active: true,
      sequence: 8,
      settings: { earlyDiscountEnabled: true, earlyDiscountPercent: 3, earlyDiscountDays: 10, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: true, lateFeeType: 'fixed', lateFeeAmount: 500, lateFeeGraceDays: 5 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'days_after', days: 45, dayOfMonth: null, description: '' }]
    })
    // 5) Split payments (percent)
    t.push({
      id: uid('term_'),
      name: '10/90 in 15d',
      description: '10% now, 90% in 15 days',
      active: true,
      sequence: 9,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: true, lateFeeType: 'percent', lateFeeAmount: 1.5, lateFeeGraceDays: 3 },
      schedule: [
        { id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 10, dateType: 'days_after', days: 0,  dayOfMonth: null, description: 'Advance' },
        { id: uid('ptl_'), sequence: 2, valueType: 'percent', valueAmount: 90, dateType: 'days_after', days: 15, dayOfMonth: null, description: 'Final' }
      ]
    })
    t.push({
      id: uid('term_'),
      name: '30/30/40 over 60d',
      description: 'Three installments over 0/30/60 days',
      active: true,
      sequence: 10,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [
        { id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 30, dateType: 'days_after', days: 0,  dayOfMonth: null, description: 'Initial' },
        { id: uid('ptl_'), sequence: 2, valueType: 'percent', valueAmount: 30, dateType: 'days_after', days: 30, dayOfMonth: null, description: 'Second' },
        { id: uid('ptl_'), sequence: 3, valueType: 'percent', valueAmount: 40, dateType: 'days_after', days: 60, dayOfMonth: null, description: 'Final' }
      ]
    })
    // 6) Fixed-amount + remainder
    t.push({
      id: uid('term_'),
      name: '৳10,000 advance + balance 30d',
      description: 'Fixed advance now, remaining in 30 days',
      active: true,
      sequence: 11,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: true, lateFeeType: 'fixed', lateFeeAmount: 250, lateFeeGraceDays: 7 },
      schedule: [
        { id: uid('ptl_'), sequence: 1, valueType: 'fixed',   valueAmount: 10000, dateType: 'days_after', days: 0,  dayOfMonth: null, description: 'Advance' },
        { id: uid('ptl_'), sequence: 2, valueType: 'percent', valueAmount: 100,   dateType: 'days_after', days: 30, dayOfMonth: null, description: 'Balance' }
      ]
    })
    // 7) Day-of-month variants
    t.push({
      id: uid('term_'),
      name: 'Monthly (1st next month)',
      description: 'Due on the 1st of next month',
      active: true,
      sequence: 12,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'day_of_month', dayOfMonth: 1, days: null, description: '' }]
    })
    t.push({
      id: uid('term_'),
      name: 'Monthly (15th next month)',
      description: 'Due on the 15th of next month',
      active: true,
      sequence: 13,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [{ id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 100, dateType: 'day_of_month', dayOfMonth: 15, days: null, description: '' }]
    })
    // 8) Quarterly-style (approx using days-after)
    t.push({
      id: uid('term_'),
      name: 'Quarterly 25/25/25/25',
      description: 'Four equal installments ~monthly',
      active: true,
      sequence: 14,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: true, showOnInvoice: true, lateFeeEnabled: false, lateFeeType: 'percent', lateFeeAmount: 0, lateFeeGraceDays: 0 },
      schedule: [
        { id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 25, dateType: 'days_after', days: 0,  dayOfMonth: null, description: 'Q1' },
        { id: uid('ptl_'), sequence: 2, valueType: 'percent', valueAmount: 25, dateType: 'days_after', days: 30, dayOfMonth: null, description: 'Q2' },
        { id: uid('ptl_'), sequence: 3, valueType: 'percent', valueAmount: 25, dateType: 'days_after', days: 60, dayOfMonth: null, description: 'Q3' },
        { id: uid('ptl_'), sequence: 4, valueType: 'percent', valueAmount: 25, dateType: 'days_after', days: 90, dayOfMonth: null, description: 'Q4' }
      ]
    })
    // 9) Hidden-on-invoice + no schedule dates (for internal)
    t.push({
      id: uid('term_'),
      name: 'Internal Plan 20/30/50',
      description: 'Internal use only; hide on invoice',
      active: true,
      sequence: 15,
      settings: { earlyDiscountEnabled: false, earlyDiscountPercent: 0, earlyDiscountDays: 0, showInstallmentDates: false, showOnInvoice: false, lateFeeEnabled: true, lateFeeType: 'percent', lateFeeAmount: 3, lateFeeGraceDays: 10 },
      schedule: [
        { id: uid('ptl_'), sequence: 1, valueType: 'percent', valueAmount: 20, dateType: 'days_after', days: 0,  dayOfMonth: null, description: 'Phase 1' },
        { id: uid('ptl_'), sequence: 2, valueType: 'percent', valueAmount: 30, dateType: 'days_after', days: 20, dayOfMonth: null, description: 'Phase 2' },
        { id: uid('ptl_'), sequence: 3, valueType: 'percent', valueAmount: 50, dateType: 'days_after', days: 40, dayOfMonth: null, description: 'Phase 3' }
      ]
    })
    return t
  }
  const paymentTermsList = termsBD()

  // Terms & Conditions templates (Bangladesh perspective)
  function generateTermsBD() {
    const list = []
    list.push({
      id: uid('tc_'),
      name: 'Standard B2B (Bangladesh)',
      content:
`- Prices are quoted in BDT; VAT applicable as per NBR regulations (typically 15%) unless stated otherwise.
- Payment via bank transfer (BEFTN/RTGS), bKash/Nagad merchant, or cheque. Banking details are provided on the invoice.
- Title to goods passes upon full payment. Risk transfers on delivery to courier or upon site handover.
- Returns accepted within 7 days for manufacturing defects only; Advance or service fees are non-refundable.
- Late payments may incur a late fee as per the selected payment terms.
- Governing law and jurisdiction: Courts of Dhaka, Bangladesh.`
    })
    list.push({
      id: uid('tc_'),
      name: 'Professional Services',
      content:
`- Work is delivered on a time & materials basis unless a fixed-price SOW is attached.
- Client will provide timely approvals and access. Delays beyond our control may shift timelines.
- Invoices are issued weekly/monthly; travel and out-of-pocket expenses are billed at cost.
- Intellectual property transfers upon full payment.`
    })
    list.push({
      id: uid('tc_'),
      name: 'Software Subscription (SaaS)',
      content:
`- Subscription is billed monthly/annually in advance; auto-renews unless cancelled 7 days before renewal.
- Downtime SLAs and support response targets apply as per our Support Policy.
- Data remains the customer's property; upon termination, limited-time export is available.
- Fair use policy applies; accounts may be rate-limited for abuse.`
    })
    list.push({
      id: uid('tc_'),
      name: 'Goods Sale & Delivery',
      content:
`- Goods inspected prior to dispatch; delivery via Sundarban/SA Paribahan or courier within Bangladesh.
- Any transit damage must be reported within 48 hours with photos and delivery confirmation.
- Warranty as per manufacturer or 6 months limited (whichever is longer).`
    })
    list.push({
      id: uid('tc_'),
      name: 'International Supply (Export)',
      content:
`- Payment in USD/EUR via bank transfer; Incoterms: FCA Dhaka or as agreed.
- Customer handles import duties/taxes at destination.
- Export documentation (Commercial Invoice, Packing List, COO) will be provided.`
    })
    return list
  }
  const termsList = generateTermsBD()

// Shipping methods (Bangladesh perspective)
function generateShippingBD() {
  const list = []
  const base = [
    { name: 'Sundarban Courier - Inside Dhaka',  provider: 'Sundarban', region: 'inside_dhaka',  chargeType: 'fixed',   amount: 80,  freeThreshold: 5000, leadDaysMin: 1, leadDaysMax: 3, codAvailable: true },
    { name: 'Sundarban Courier - Outside Dhaka', provider: 'Sundarban', region: 'outside_dhaka', chargeType: 'fixed',   amount: 120, freeThreshold: 7000, leadDaysMin: 2, leadDaysMax: 5, codAvailable: true },
    { name: 'SA Paribahan - Outside Dhaka',      provider: 'SA Paribahan', region: 'outside_dhaka', chargeType: 'fixed', amount: 140, freeThreshold: 8000, leadDaysMin: 2, leadDaysMax: 5, codAvailable: true },
    { name: 'Steadfast Express (Dhaka City)',    provider: 'Steadfast', region: 'inside_dhaka',  chargeType: 'fixed',   amount: 60,  freeThreshold: 4000, leadDaysMin: 1, leadDaysMax: 2, codAvailable: true },
    { name: 'Pathao Courier (Nationwide)',       provider: 'Pathao', region: 'any',  chargeType: 'fixed',   amount: 110, freeThreshold: 6500, leadDaysMin: 2, leadDaysMax: 4, codAvailable: true },
    { name: 'RedX (Nationwide)',                 provider: 'RedX',   region: 'any',  chargeType: 'fixed',   amount: 100, freeThreshold: 6000, leadDaysMin: 2, leadDaysMax: 4, codAvailable: true },
    { name: 'Home Delivery (Dhaka Metro)',       provider: 'In-house', region: 'inside_dhaka', chargeType: 'percent', amount: 1.5, freeThreshold: 8000, leadDaysMin: 1, leadDaysMax: 1, codAvailable: false },
    { name: 'Pickup from Office',                provider: 'In-house', region: 'any', chargeType: 'fixed', amount: 0, freeThreshold: 0, leadDaysMin: 0, leadDaysMax: 0, codAvailable: false }
  ]
  for (const b of base) {
    list.push({
      id: uid('ship_'),
      ...b
    })
  }
  return list
}
const shippingMethods = generateShippingBD()

  // Merchants (the issuers of invoices) — Bangladesh specific sample data
  function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  function bdPhone() {
    const prefixes = ['013', '014', '015', '016', '017', '018', '019']
    const p = prefixes[Math.floor(Math.random() * prefixes.length)]
    const rest = Math.floor(10000000 + Math.random() * 89999999).toString().slice(0, 8)
    return `+880${p}${rest}`
  }
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)] }

  const bdCities = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Barishal', 'Rangpur', 'Gazipur', 'Narayanganj', 'Cumilla']
  const bdAreas = ['Banani', 'Gulshan', 'Dhanmondi', 'Uttara', 'Mirpur', 'Bashundhara', 'Motijheel', 'Agrabad', 'Zinda Bazar', 'Nawabganj']
  const bdZips = ['1205', '1212', '1230', '1216', '1229', '4100', '3100', '9000', '6200', '8200']
  const companyPrefixes = ['Dhaka', 'Bangla', 'Delta', 'River', 'Green', 'Skyline', 'Prime', 'Trust', 'Metro', 'Royal']
  const companySuffixes = ['Tech Ltd.', 'Foods Ltd.', 'Logistics Ltd.', 'Solutions Ltd.', 'Retail Ltd.', 'Trading Ltd.', 'Industries Ltd.', 'Pharma Ltd.', 'Consulting Ltd.', 'Garments Ltd.']

  function generateBdMerchants(count = 15) {
    const list = []
    for (let i = 0; i < count; i++) {
      const name = `${rand(companyPrefixes)} ${rand(companySuffixes)}`
      const slug = slugify(name.replace(/\s+Ltd\./, ''))
      const city = rand(bdCities)
      const area = rand(bdAreas)

      // Addresses: primary + 1-2 more (billing/shipping/secondary)
      const addresses = []
      addresses.push({
        id: uid('addr_'),
        type: 'primary',
        isPrimary: true,
        line1: `House ${Math.ceil(Math.random() * 200)}, Road ${Math.ceil(Math.random() * 30)}, ${area}`,
        line2: '',
        city,
        zip: rand(bdZips)
      })
      const extraAddrTypes = ['billing', 'shipping', 'secondary']
      const extraAddrCount = 1 + Math.floor(Math.random() * 2) // 1-2
      for (let j = 0; j < extraAddrCount; j++) {
        const t = extraAddrTypes[j % extraAddrTypes.length]
        const eCity = rand(bdCities)
        const eArea = rand(bdAreas)
        addresses.push({
          id: uid('addr_'),
          type: t,
          isPrimary: false,
          line1: `House ${Math.ceil(Math.random() * 300)}, Road ${Math.ceil(Math.random() * 40)}, ${eArea}`,
          line2: '',
          city: eCity,
          zip: rand(bdZips)
        })
      }

      // Contacts: primary + 1-2 more (billing/support)
      const contacts = []
      contacts.push({
        id: uid('ct_'),
        type: 'primary',
        name: 'Accounts Desk',
        email: `accounts@${slug}.com.bd`,
        phone: bdPhone()
      })
      const extraContactTypes = ['billing', 'support']
      const extraContactNames = ['Billing Desk', 'Customer Support', 'Sales Desk']
      const extraContactCount = 1 + Math.floor(Math.random() * 2) // 1-2
      for (let k = 0; k < extraContactCount; k++) {
        const t = extraContactTypes[k % extraContactTypes.length]
        contacts.push({
          id: uid('ct_'),
          type: t,
          name: extraContactNames[k % extraContactNames.length],
          email: `${t}@${slug}.com.bd`,
          phone: bdPhone()
        })
      }

      list.push({
        id: uid('mrc_'),
        name,
        type: 'company',
        email: `info@${slug}.com.bd`,
        phone: bdPhone(),
        taxId: `BD-${Math.floor(1000000 + Math.random() * 8999999)}`,
        website: `https://${slug}.com.bd`,
        addresses,
        contacts
      })
    }
    return list
  }
  const merchantsList = generateBdMerchants(15)

  // Customers (invoice receivers) — Bangladesh specific
  const personFirst = ['Ayesha', 'Rahim', 'Karim', 'Nusrat', 'Tanvir', 'Mehedi', 'Sumaiya', 'Farhan', 'Shanta', 'Jamal', 'Sadia', 'Hasan']
  const personLast = ['Ahmed', 'Hossain', 'Karim', 'Rahman', 'Khan', 'Islam', 'Chowdhury', 'Sultana', 'Akter', 'Sarkar', 'Mondal']
  function fullName() { return `${rand(personFirst)} ${rand(personLast)}` }
  function generateBdCustomers(count = 15) {
    const list = []
    for (let i = 0; i < count; i++) {
      const company = `${rand(companyPrefixes)} ${rand(companySuffixes)}`
      const slug = slugify(company.replace(/\s+Ltd\./, ''))
      const city = rand(bdCities)
      const area = rand(bdAreas)
      const isCompany = Math.random() > 0.35

      // Addresses: primary + 1-2 extra (shipping/secondary)
      const addresses = []
      addresses.push({
        id: uid('addr_'),
        type: 'primary',
        isPrimary: true,
        line1: `House ${Math.ceil(Math.random() * 300)}, Road ${Math.ceil(Math.random() * 40)}, ${area}`,
        line2: '',
        city,
        zip: rand(bdZips)
      })
      const extraAddrTypes = ['shipping', 'secondary']
      const extraAddrCount = 1 + Math.floor(Math.random() * 2) // 1-2
      for (let j = 0; j < extraAddrCount; j++) {
        const t = extraAddrTypes[j % extraAddrTypes.length]
        const eCity = rand(bdCities)
        const eArea = rand(bdAreas)
        addresses.push({
          id: uid('addr_'),
          type: t,
          isPrimary: false,
          line1: `House ${Math.ceil(Math.random() * 300)}, Road ${Math.ceil(Math.random() * 40)}, ${eArea}`,
          line2: '',
          city: eCity,
          zip: rand(bdZips)
        })
      }

      // Contacts: primary + 1-2 extra (billing/support/secondary)
      const contacts = []
      contacts.push({
        id: uid('ct_'),
        type: 'primary',
        name: isCompany ? 'AP Desk' : fullName(),
        email: isCompany ? `ap@${slug}.com.bd` : `${slug}@example.com.bd`,
        phone: bdPhone()
      })
      const extraContactTypes = ['billing', 'secondary', 'support']
      const extraContactNames = isCompany
        ? ['Billing Desk', 'Operations', 'Support']
        : ['Spouse', 'Sibling', 'Friend']
      const extraContactCount = 1 + Math.floor(Math.random() * 2) // 1-2
      for (let k = 0; k < extraContactCount; k++) {
        const t = extraContactTypes[k % extraContactTypes.length]
        contacts.push({
          id: uid('ct_'),
          type: t,
          name: extraContactNames[k % extraContactNames.length],
          email: isCompany ? `${t}@${slug}.com.bd` : `${slug}.${t}@example.com.bd`,
          phone: bdPhone()
        })
      }

      list.push({
        id: uid('cus_'),
        name: isCompany ? company : fullName(),
        type: isCompany ? 'company' : 'person',
        email: isCompany ? `ap@${slug}.com.bd` : `${slug}@example.com.bd`,
        phone: bdPhone(),
        taxId: isCompany ? `BD-${Math.floor(1000000 + Math.random() * 8999999)}` : '',
        nid: isCompany ? '' : `${Math.floor(1000000000 + Math.random() * 8999999999)}`,
        website: isCompany ? `https://${slug}.com.bd` : '',
        addresses,
        contacts
      })
    }
    return list
  }
  const customersList = generateBdCustomers(15)

  // Products — generate a diverse Bangladesh-focused catalog
  const UNIT_OPTIONS = [
    { value: 'pcs', label: 'Pcs (Pieces)' },
    { value: 'ea', label: 'Each (Ea)' },
    { value: 'units', label: 'Units' },
    { value: 'items', label: 'Items' },
    { value: 'doz', label: 'Dozen (Doz)' },
    { value: 'pair', label: 'Pair' },
    { value: 'set', label: 'Set' },
    { value: 'pack', label: 'Pack' },
    { value: 'box', label: 'Box' },
    { value: 'carton', label: 'Carton' }
  ]
  const TYPE_OPTIONS = ['goods', 'service', 'digital', 'rental/lease', 'subscription', 'fee', 'license', 'expense', 'material', 'labor']
  const ADJ = ['Premium', 'Basic', 'Eco', 'Deluxe', 'Ultra', 'Smart', 'Quick', 'Pro', 'Lite', 'Max']
  const NOUN = ['Service', 'Support', 'Design', 'Consulting', 'Hosting', 'Software', 'Widget', 'Toolkit', 'Subscription', 'Plan', 'Cable', 'Adapter', 'Bag', 'Bottle', 'Gloves', 'Mask', 'Sensor', 'Module', 'License', 'Template']

  function skuFrom(name) {
    return name
      .split(/\s+/)
      .map(w => w.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase())
      .filter(Boolean)
      .slice(0, 3)
      .join('-') + '-' + Math.floor(100 + Math.random() * 900)
  }

  function generateBdProducts(count = 100) {
    const list = []
    for (let i = 0; i < count; i++) {
      const nm = `${rand(ADJ)} ${rand(NOUN)}`
      const unit = rand(UNIT_OPTIONS).value
      const type = rand(TYPE_OPTIONS)
      const price = Number((50 + Math.random() * 5000).toFixed(2)) // ৳50–৳5050
      const discountType = rand(['none', 'fixed', 'percent'])
      const discountValue = discountType === 'percent'
        ? Math.floor(Math.random() * 21) // 0-20%
        : discountType === 'fixed'
          ? Number((Math.random() * (price * 0.3)).toFixed(2)) // up to 30% of price
          : 0
      const taxId = Math.random() > 0.3 ? rand(taxesList).id : '' // some without tax

      list.push({
        id: uid('prd_'),
        name: nm,
        sku: skuFrom(nm),
        unit,
        type,
        price,
        discountType,
        discountValue,
        taxId,
        active: true,
        description: `${nm} for Bangladesh market.`
      })
    }
    return list
  }
  const productsList = generateBdProducts(100)

  // Invoices (sample set)
  function subTaxFromItems(items) {
    let sub = 0, tax = 0
    for (const it of items) {
      const base = (Number(it.qty)||0) * (Number(it.unitPrice)||0)
      const dtype = it.discountType || 'none'
      const dval = Number(it.discountValue) || 0
      const disc = dtype === 'percent' ? base * dval/100 : dtype === 'fixed' ? (Number(it.qty)||0) * dval : 0
      const net = Math.max(0, base - disc)
      sub += net
      const t = taxesList.find(x => x.id === it.taxId)
      if (t) tax += net * (Number(t.rate) || 0) / 100
    }
    return { sub, tax, total: sub + tax }
  }
  function regionOf(customer) {
    const city = (customer?.addresses?.[0]?.city || '').toLowerCase()
    return city.includes('dhaka') ? 'inside_dhaka' : 'outside_dhaka'
  }
  function shippingFeeFor(subTotal, method) {
    if (!method) return 0
    if (method.freeThreshold && subTotal >= Number(method.freeThreshold)) return 0
    return method.chargeType === 'percent'
      ? Number((subTotal * (Number(method.amount)||0) / 100).toFixed(2))
      : Number(method.amount)||0
  }
  function addDaysStr(dateStr, days) {
    const [y,m,d] = dateStr.split('-').map(Number)
    const dt = new Date(y, m-1, d)
    dt.setDate(dt.getDate() + (Number(days)||0))
    const yy=dt.getFullYear(), mm=String(dt.getMonth()+1).padStart(2,'0'), dd=String(dt.getDate()).padStart(2,'0')
    return `${yy}-${mm}-${dd}`
  }
  function generateInvoices(count = 15) {
    const list = []
    const baseDate = new Date().toISOString().slice(0,10)
    for (let i=0; i<count; i++) {
      const m = merchantsList[i % merchantsList.length]
      const c = customersList[(i*3) % customersList.length]
      const term = paymentTermsList[(i*5) % paymentTermsList.length]
      const termsTpl = termsList[(i*2) % termsList.length]
      const nItems = 2 + Math.floor(Math.random()*3) // 2–4 items
      const items = []
      for (let k=0; k<nItems; k++) {
        const p = productsList[(i*11 + k) % productsList.length]
        items.push({
          id: uid('li_'),
          productId: p.id,
          description: p.name,
          qty: 1 + Math.floor(Math.random()*5),
          unitPrice: Number((p.price||0).toFixed(2)),
          discountType: p.discountType || 'none',
          discountValue: Number(p.discountValue||0),
          taxId: p.taxId || ''
        })
      }
      const totals = subTaxFromItems(items)
      const region = regionOf(c)
      const opts = shippingMethods.filter(s => s.region==='any' || s.region===region)
      const shipMethod = opts[(i*7) % opts.length]
      const shipFee = shippingFeeFor(totals.sub, shipMethod)

      const number = `INV-${(1001+i).toString()}`
      const date = addDaysStr(baseDate, -Math.floor(Math.random()*28))

      list.push({
        id: uid('inv_'),
        number,
        date,
        dueDate: null, // UI computes from paymentTermId
        merchantId: m.id,
        customerId: c.id,
        paymentTermId: term.id,
        status: 'draft',
        currency: 'BDT',
        items,
        notes: 'Auto-generated sample invoice.',
        termsTemplateId: termsTpl.id,
        shippingMethodId: shipMethod?.id || '',
        shippingFee: shipFee,
        attachments: []
      })
    }
    return list
  }
  const invoicesList = generateInvoices(15)

  return {
    merchants: merchantsList,
    customers: customersList,
    products: productsList,
    taxes: taxesList,
    paymentTerms: paymentTermsList,
    termsTemplates: termsList,
    shippingMethods,
    invoices: invoicesList,
    settings: {
      currency: 'BDT',
      dateFormat: 'YYYY-MM-DD'
    },
    ui: {
      sidebarCollapsed: false
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
