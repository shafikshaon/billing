import { createRouter, createWebHistory } from 'vue-router'

const Dashboard = () => import('../views/Dashboard.vue')
const Merchants = () => import('../views/Merchants.vue')
const Customers = () => import('../views/Customers.vue')
const Products = () => import('../views/Products.vue')
const Taxes = () => import('../views/Taxes.vue')
const PaymentTerms = () => import('../views/PaymentTerms.vue')
const TermsAndConditions = () => import('../views/TermsAndConditions.vue')
const Invoices = () => import('../views/Invoices.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/invoices' },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { icon: '🏠' } },
    { path: '/merchants', name: 'Merchants', component: Merchants, meta: { icon: '🏢' } },
    { path: '/customers', name: 'Customers', component: Customers, meta: { icon: '👤' } },
    { path: '/products', name: 'Products', component: Products, meta: { icon: '📦' } },
    { path: '/taxes', name: 'Taxes', component: Taxes, meta: { icon: '💸' } },
    { path: '/payment-terms', name: 'Payment Terms', component: PaymentTerms, meta: { icon: '⏱️' } },
    { path: '/terms-conditions', name: 'Terms & Conditions', component: TermsAndConditions, meta: { icon: '📜' } },
    { path: '/invoices', name: 'Invoices', component: Invoices, meta: { icon: '🧾' } },
  ],
})

export default router
