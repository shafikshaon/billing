import { createRouter, createWebHistory } from 'vue-router'

const Dashboard = () => import('../views/Dashboard.vue')
// Merchants module
const MerchantsList = () => import('../views/MerchantsList.vue')
const MerchantForm = () => import('../views/MerchantForm.vue')
const MerchantView = () => import('../views/MerchantView.vue')

const CustomersList = () => import('../views/CustomersList.vue')
const CustomerForm = () => import('../views/CustomerForm.vue')
const CustomerView = () => import('../views/CustomerView.vue')
const ProductsList = () => import('../views/ProductsList.vue')
const ProductForm = () => import('../views/ProductForm.vue')
const ProductView = () => import('../views/ProductView.vue')
const TaxesList = () => import('../views/TaxesList.vue')
const TaxForm = () => import('../views/TaxForm.vue')
const PaymentTermsList = () => import('../views/PaymentTermsList.vue')
const PaymentTermForm = () => import('../views/PaymentTermForm.vue')
const TermsTemplatesList = () => import('../views/TermsTemplatesList.vue')
const TermsTemplateForm = () => import('../views/TermsTemplateForm.vue')
const ShippingMethodsList = () => import('../views/ShippingMethodsList.vue')
const ShippingMethodForm = () => import('../views/ShippingMethodForm.vue')
const InvoicesList = () => import('../views/InvoicesList.vue')
const Invoices = () => import('../views/Invoices.vue')
const InvoiceView = () => import('../views/InvoiceView.vue')
const Settings = () => import('../views/Settings.vue')

const StandalonePosReceipt = () => import('../views/PosReceipt.vue')

const PosReceipt = () => import('../views/PosReceipt.vue')

// Credit Notes
const CreditNotesList = () => import('../views/CreditNotesList.vue')
const CreditNotes = () => import('../views/CreditNotes.vue')
const CreditNoteView = () => import('../views/CreditNoteView.vue')

// Bulk Import
const BulkImportMerchants = () => import('../views/BulkImportMerchants.vue')
const BulkImportCustomers = () => import('../views/BulkImportCustomers.vue')
const BulkImportProducts = () => import('../views/BulkImportProducts.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/invoices' },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { icon: '🏠' } },

    // Merchants
    { path: '/merchants', name: 'Merchants', component: MerchantsList, meta: { icon: '🏢' } },
    { path: '/merchants/new', name: 'New Merchant', component: MerchantForm, meta: { icon: '🏢', hidden: true } },
    { path: '/merchants/:id', name: 'Merchant', component: MerchantView, meta: { icon: '🏢', hidden: true } },
    { path: '/merchants/:id/edit', name: 'Edit Merchant', component: MerchantForm, meta: { icon: '🏢', hidden: true } },
    { path: '/merchants/bulk-import', name: 'Bulk Import Merchants', component: BulkImportMerchants, meta: { icon: '📥', hidden: true } },

    // Customers
    { path: '/customers', name: 'Customers', component: CustomersList, meta: { icon: '👤' } },
    { path: '/customers/new', name: 'New Customer', component: CustomerForm, meta: { icon: '👤', hidden: true } },
    { path: '/customers/:id', name: 'Customer', component: CustomerView, meta: { icon: '👤', hidden: true } },
    { path: '/customers/:id/edit', name: 'Edit Customer', component: CustomerForm, meta: { icon: '👤', hidden: true } },
    { path: '/customers/bulk-import', name: 'Bulk Import Customers', component: BulkImportCustomers, meta: { icon: '📥', hidden: true } },

    // Products
    { path: '/products', name: 'Products', component: ProductsList, meta: { icon: '📦' } },
    { path: '/products/new', name: 'New Product', component: ProductForm, meta: { icon: '📦', hidden: true } },
    { path: '/products/:id', name: 'Product', component: ProductView, meta: { icon: '📦', hidden: true } },
    { path: '/products/:id/edit', name: 'Edit Product', component: ProductForm, meta: { icon: '📦', hidden: true } },
    { path: '/products/bulk-import', name: 'Bulk Import Products', component: BulkImportProducts, meta: { icon: '📥', hidden: true } },

    // Taxes
    { path: '/taxes', name: 'Taxes', component: TaxesList, meta: { icon: '💸' } },
    { path: '/taxes/new', name: 'New Tax', component: TaxForm, meta: { icon: '💸', hidden: true } },
    { path: '/taxes/:id/edit', name: 'Edit Tax', component: TaxForm, meta: { icon: '💸', hidden: true } },

    // Payment Terms
    { path: '/payment-terms', name: 'Payment Terms', component: PaymentTermsList, meta: { icon: '⏱️' } },
    { path: '/payment-terms/new', name: 'New Payment Term', component: PaymentTermForm, meta: { icon: '⏱️', hidden: true } },
    { path: '/payment-terms/:id/edit', name: 'Edit Payment Term', component: PaymentTermForm, meta: { icon: '⏱️', hidden: true } },

    // Terms & Conditions
    { path: '/terms-conditions', name: 'Terms & Conditions', component: TermsTemplatesList, meta: { icon: '📜' } },
    { path: '/terms-conditions/new', name: 'New Terms Template', component: TermsTemplateForm, meta: { icon: '📜', hidden: true } },
    { path: '/terms-conditions/:id/edit', name: 'Edit Terms Template', component: TermsTemplateForm, meta: { icon: '📜', hidden: true } },

    // Shipping
    { path: '/shipping', name: 'Shipping', component: ShippingMethodsList, meta: { icon: '🚚' } },
    { path: '/shipping/new', name: 'New Shipping Method', component: ShippingMethodForm, meta: { icon: '🚚', hidden: true } },
    { path: '/shipping/:id/edit', name: 'Edit Shipping Method', component: ShippingMethodForm, meta: { icon: '🚚', hidden: true } },

    // Invoices
    { path: '/invoices', name: 'Invoices', component: InvoicesList, meta: { icon: '🧾' } },
    { path: '/invoices/new', name: 'New Invoice', component: Invoices, meta: { icon: '🧾', hidden: true } },
    { path: '/invoices/:id', name: 'Invoice', component: InvoiceView, meta: { icon: '🧾', hidden: true } },
    { path: '/invoices/:id/edit', name: 'Edit Invoice', component: Invoices, meta: { icon: '🧾', hidden: true } },

    // Standalone POS Receipt
    { path: '/receipt', name: 'POS Receipt', component: PosReceipt, meta: { icon: '🧾' } },

    // Standalone POS Receipt
    { path: '/receipt', name: 'POS Receipt', component: StandalonePosReceipt, meta: { icon: '' } },

    // Credit Notes
    { path: '/credit-notes', name: 'Credit Notes', component: CreditNotesList, meta: { icon: '↩️' } },
    { path: '/credit-notes/new', name: 'New Credit Note', component: CreditNotes, meta: { icon: '↩️', hidden: true } },
    { path: '/credit-notes/:id', name: 'Credit Note', component: CreditNoteView, meta: { icon: '↩️', hidden: true } },
    { path: '/credit-notes/:id/edit', name: 'Edit Credit Note', component: CreditNotes, meta: { icon: '↩️', hidden: true } },

    // Settings
    { path: '/settings', name: 'Settings', component: Settings, meta: { icon: '⚙️' } },
  ],
})

export default router
