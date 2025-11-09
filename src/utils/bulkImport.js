import Papa from 'papaparse'

/**
 * Generate unique ID with prefix
 */
function uid(prefix = '') {
  return prefix + Math.random().toString(36).substr(2, 9)
}

/**
 * Download CSV file
 */
export function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Parse CSV file
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results)
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * Generate sample merchant CSV template
 */
export function generateMerchantSampleCSV() {
  const headers = [
    'name',
    'type',
    'email',
    'phone',
    'taxId',
    'website',
    'address1_type',
    'address1_line1',
    'address1_line2',
    'address1_city',
    'address1_zip',
    'address2_type',
    'address2_line1',
    'address2_line2',
    'address2_city',
    'address2_zip',
    'contact1_type',
    'contact1_name',
    'contact1_email',
    'contact1_phone',
    'contact2_type',
    'contact2_name',
    'contact2_email',
    'contact2_phone'
  ]

  const sampleData = [
    {
      name: 'Tech Solutions Ltd',
      type: 'company',
      email: 'info@techsolutions.com',
      phone: '+880 1712-345678',
      taxId: 'TIN-123456789',
      website: 'https://techsolutions.com',
      address1_type: 'primary',
      address1_line1: 'House 12, Road 5',
      address1_line2: 'Dhanmondi',
      address1_city: 'Dhaka',
      address1_zip: '1205',
      address2_type: 'billing',
      address2_line1: 'Plot 45, Sector 7',
      address2_line2: 'Uttara',
      address2_city: 'Dhaka',
      address2_zip: '1230',
      contact1_type: 'primary',
      contact1_name: 'John Doe',
      contact1_email: 'john@techsolutions.com',
      contact1_phone: '+880 1712-111111',
      contact2_type: 'billing',
      contact2_name: 'Jane Smith',
      contact2_email: 'jane@techsolutions.com',
      contact2_phone: '+880 1712-222222'
    },
    {
      name: 'Ahmed Khan',
      type: 'person',
      email: 'ahmed.khan@gmail.com',
      phone: '+880 1812-987654',
      taxId: '',
      website: '',
      address1_type: 'primary',
      address1_line1: 'Flat 3A, Building 7',
      address1_line2: 'Banani',
      address1_city: 'Dhaka',
      address1_zip: '1213',
      address2_type: '',
      address2_line1: '',
      address2_line2: '',
      address2_city: '',
      address2_zip: '',
      contact1_type: 'primary',
      contact1_name: 'Ahmed Khan',
      contact1_email: 'ahmed.khan@gmail.com',
      contact1_phone: '+880 1812-987654',
      contact2_type: '',
      contact2_name: '',
      contact2_email: '',
      contact2_phone: ''
    }
  ]

  const csv = Papa.unparse({
    fields: headers,
    data: sampleData
  })

  return csv
}

/**
 * Generate sample customer CSV template
 */
export function generateCustomerSampleCSV() {
  const headers = [
    'name',
    'type',
    'email',
    'phone',
    'taxId',
    'nid',
    'website',
    'address1_type',
    'address1_line1',
    'address1_line2',
    'address1_city',
    'address1_zip',
    'address2_type',
    'address2_line1',
    'address2_line2',
    'address2_city',
    'address2_zip',
    'contact1_type',
    'contact1_name',
    'contact1_email',
    'contact1_phone',
    'contact2_type',
    'contact2_name',
    'contact2_email',
    'contact2_phone'
  ]

  const sampleData = [
    {
      name: 'ABC Corporation',
      type: 'company',
      email: 'contact@abccorp.com',
      phone: '+880 1912-345678',
      taxId: 'TIN-987654321',
      nid: '',
      website: 'https://abccorp.com',
      address1_type: 'primary',
      address1_line1: 'House 20, Road 10',
      address1_line2: 'Gulshan',
      address1_city: 'Dhaka',
      address1_zip: '1212',
      address2_type: 'shipping',
      address2_line1: 'Warehouse 5, DEPZ',
      address2_line2: 'Savar',
      address2_city: 'Dhaka',
      address2_zip: '1340',
      contact1_type: 'primary',
      contact1_name: 'Sarah Johnson',
      contact1_email: 'sarah@abccorp.com',
      contact1_phone: '+880 1912-111111',
      contact2_type: 'billing',
      contact2_name: 'Mike Wilson',
      contact2_email: 'mike@abccorp.com',
      contact2_phone: '+880 1912-222222'
    },
    {
      name: 'Fatima Rahman',
      type: 'person',
      email: 'fatima.rahman@yahoo.com',
      phone: '+880 1712-555555',
      taxId: '',
      nid: '1234567890123',
      website: '',
      address1_type: 'primary',
      address1_line1: 'House 15, Lane 3',
      address1_line2: 'Mirpur DOHS',
      address1_city: 'Dhaka',
      address1_zip: '1216',
      address2_type: '',
      address2_line1: '',
      address2_line2: '',
      address2_city: '',
      address2_zip: '',
      contact1_type: 'primary',
      contact1_name: 'Fatima Rahman',
      contact1_email: 'fatima.rahman@yahoo.com',
      contact1_phone: '+880 1712-555555',
      contact2_type: '',
      contact2_name: '',
      contact2_email: '',
      contact2_phone: ''
    }
  ]

  const csv = Papa.unparse({
    fields: headers,
    data: sampleData
  })

  return csv
}

/**
 * Generate sample product CSV template with SKUs
 */
export function generateProductSampleCSV() {
  const headers = [
    'name',
    'sku',
    'unit',
    'type',
    'price',
    'discountType',
    'discountValue',
    'taxId',
    'active',
    'description',
    'trackInventory',
    'currentStock',
    'reorderLevel',
    'reorderQuantity'
  ]

  const sampleData = [
    {
      name: 'Laptop - Dell Inspiron 15',
      sku: 'DELL-INS-15-001',
      unit: 'pcs',
      type: 'goods',
      price: '55000',
      discountType: 'percent',
      discountValue: '5',
      taxId: '',
      active: 'true',
      description: 'Dell Inspiron 15 3000 Series, 8GB RAM, 256GB SSD',
      trackInventory: 'true',
      currentStock: '50',
      reorderLevel: '10',
      reorderQuantity: '20'
    },
    {
      name: 'HP Laptop ProBook 450',
      sku: 'HP-PRO-450-001',
      unit: 'pcs',
      type: 'goods',
      price: '65000',
      discountType: 'fixed',
      discountValue: '2000',
      taxId: '',
      active: 'true',
      description: 'HP ProBook 450 G8, Intel i5, 16GB RAM, 512GB SSD',
      trackInventory: 'true',
      currentStock: '30',
      reorderLevel: '5',
      reorderQuantity: '15'
    },
    {
      name: 'Wireless Mouse',
      sku: 'ACC-MOUSE-001',
      unit: 'pcs',
      type: 'goods',
      price: '850',
      discountType: 'none',
      discountValue: '0',
      taxId: '',
      active: 'true',
      description: 'Logitech M185 Wireless Mouse',
      trackInventory: 'true',
      currentStock: '200',
      reorderLevel: '50',
      reorderQuantity: '100'
    }
  ]

  const csv = Papa.unparse({
    fields: headers,
    data: sampleData
  })

  return csv
}

/**
 * Generate sample product CSV template without SKUs (services don't need inventory)
 */
export function generateProductSampleCSVNoSKU() {
  const headers = [
    'name',
    'unit',
    'type',
    'price',
    'discountType',
    'discountValue',
    'taxId',
    'active',
    'description',
    'trackInventory',
    'currentStock',
    'reorderLevel',
    'reorderQuantity'
  ]

  const sampleData = [
    {
      name: 'Web Development Service',
      unit: 'units',
      type: 'service',
      price: '50000',
      discountType: 'none',
      discountValue: '0',
      taxId: '',
      active: 'true',
      description: 'Full-stack web development service per project',
      trackInventory: 'false',
      currentStock: '0',
      reorderLevel: '0',
      reorderQuantity: '0'
    },
    {
      name: 'Consulting Service - IT Strategy',
      unit: 'hrs',
      type: 'consulting',
      price: '3500',
      discountType: 'none',
      discountValue: '0',
      taxId: '',
      active: 'true',
      description: 'IT strategy consulting service per hour',
      trackInventory: 'false',
      currentStock: '0',
      reorderLevel: '0',
      reorderQuantity: '0'
    },
    {
      name: 'Microsoft Office 365 License',
      unit: 'units',
      type: 'license',
      price: '8500',
      discountType: 'percent',
      discountValue: '10',
      taxId: '',
      active: 'true',
      description: 'Annual subscription for Microsoft Office 365',
      trackInventory: 'true',
      currentStock: '100',
      reorderLevel: '20',
      reorderQuantity: '50'
    }
  ]

  const csv = Papa.unparse({
    fields: headers,
    data: sampleData
  })

  return csv
}

/**
 * Parse and validate merchant data from CSV
 */
export function parseMerchantData(rows) {
  const merchants = []
  const errors = []

  rows.forEach((row, index) => {
    const rowNum = index + 2 // +2 because index starts at 0 and we skip header

    // Validation
    if (!row.name || row.name.trim() === '') {
      errors.push(`Row ${rowNum}: Name is required`)
      return
    }

    if (!row.type || !['company', 'person'].includes(row.type)) {
      errors.push(`Row ${rowNum}: Type must be 'company' or 'person'`)
      return
    }

    // Build addresses array
    const addresses = []
    if (row.address1_line1) {
      addresses.push({
        id: uid('addr_'),
        type: row.address1_type || 'primary',
        line1: row.address1_line1,
        line2: row.address1_line2 || '',
        city: row.address1_city || '',
        zip: row.address1_zip || ''
      })
    }
    if (row.address2_line1) {
      addresses.push({
        id: uid('addr_'),
        type: row.address2_type || 'secondary',
        line1: row.address2_line1,
        line2: row.address2_line2 || '',
        city: row.address2_city || '',
        zip: row.address2_zip || ''
      })
    }

    // Build contacts array
    const contacts = []
    if (row.contact1_name) {
      contacts.push({
        id: uid('cnt_'),
        type: row.contact1_type || 'primary',
        name: row.contact1_name,
        email: row.contact1_email || '',
        phone: row.contact1_phone || ''
      })
    }
    if (row.contact2_name) {
      contacts.push({
        id: uid('cnt_'),
        type: row.contact2_type || 'secondary',
        name: row.contact2_name,
        email: row.contact2_email || '',
        phone: row.contact2_phone || ''
      })
    }

    merchants.push({
      id: uid('mrc_'),
      name: row.name.trim(),
      type: row.type,
      email: row.email || '',
      phone: row.phone || '',
      taxId: row.taxId || '',
      website: row.website || '',
      addresses,
      contacts
    })
  })

  return { merchants, errors }
}

/**
 * Parse and validate customer data from CSV
 */
export function parseCustomerData(rows) {
  const customers = []
  const errors = []

  rows.forEach((row, index) => {
    const rowNum = index + 2

    // Validation
    if (!row.name || row.name.trim() === '') {
      errors.push(`Row ${rowNum}: Name is required`)
      return
    }

    if (!row.type || !['company', 'person'].includes(row.type)) {
      errors.push(`Row ${rowNum}: Type must be 'company' or 'person'`)
      return
    }

    // Build addresses array
    const addresses = []
    if (row.address1_line1) {
      addresses.push({
        id: uid('addr_'),
        type: row.address1_type || 'primary',
        line1: row.address1_line1,
        line2: row.address1_line2 || '',
        city: row.address1_city || '',
        zip: row.address1_zip || ''
      })
    }
    if (row.address2_line1) {
      addresses.push({
        id: uid('addr_'),
        type: row.address2_type || 'secondary',
        line1: row.address2_line1,
        line2: row.address2_line2 || '',
        city: row.address2_city || '',
        zip: row.address2_zip || ''
      })
    }

    // Build contacts array
    const contacts = []
    if (row.contact1_name) {
      contacts.push({
        id: uid('cnt_'),
        type: row.contact1_type || 'primary',
        name: row.contact1_name,
        email: row.contact1_email || '',
        phone: row.contact1_phone || ''
      })
    }
    if (row.contact2_name) {
      contacts.push({
        id: uid('cnt_'),
        type: row.contact2_type || 'secondary',
        name: row.contact2_name,
        email: row.contact2_email || '',
        phone: row.contact2_phone || ''
      })
    }

    customers.push({
      id: uid('cus_'),
      name: row.name.trim(),
      type: row.type,
      email: row.email || '',
      phone: row.phone || '',
      taxId: row.taxId || '',
      nid: row.nid || '',
      website: row.website || '',
      addresses,
      contacts
    })
  })

  return { customers, errors }
}

/**
 * Parse and validate product data from CSV
 */
export function parseProductData(rows) {
  const products = []
  const errors = []

  rows.forEach((row, index) => {
    const rowNum = index + 2

    // Validation
    if (!row.name || row.name.trim() === '') {
      errors.push(`Row ${rowNum}: Name is required`)
      return
    }

    if (!row.price || isNaN(parseFloat(row.price))) {
      errors.push(`Row ${rowNum}: Valid price is required`)
      return
    }

    const validUnits = ['pcs', 'ea', 'units', 'doz', 'pair', 'pack', 'box', 'carton', 'kg', 'g', 'lbs', 'oz', 'l', 'm', 'ft', 'sq.m', 'sq.ft', 'hrs', 'days', 'months']
    const unit = row.unit || 'pcs'
    if (!validUnits.includes(unit)) {
      errors.push(`Row ${rowNum}: Invalid unit '${unit}'`)
      return
    }

    const validTypes = ['goods', 'service', 'digital', 'rental/lease', 'subscription', 'fee', 'license', 'consulting', 'other']
    const type = row.type || 'goods'
    if (!validTypes.includes(type)) {
      errors.push(`Row ${rowNum}: Invalid type '${type}'`)
      return
    }

    const validDiscountTypes = ['none', 'fixed', 'percent']
    const discountType = row.discountType || 'none'
    if (!validDiscountTypes.includes(discountType)) {
      errors.push(`Row ${rowNum}: Invalid discountType '${discountType}'`)
      return
    }

    products.push({
      id: uid('prd_'),
      name: row.name.trim(),
      sku: row.sku || '',
      unit,
      type,
      price: parseFloat(row.price),
      discountType,
      discountValue: parseFloat(row.discountValue) || 0,
      taxId: row.taxId || '',
      active: row.active === 'true' || row.active === true || row.active === '1',
      description: row.description || '',
      trackInventory: row.trackInventory === 'true' || row.trackInventory === true || row.trackInventory === '1',
      currentStock: parseFloat(row.currentStock) || 0,
      reorderLevel: parseFloat(row.reorderLevel) || 0,
      reorderQuantity: parseFloat(row.reorderQuantity) || 0
    })
  })

  return { products, errors }
}
