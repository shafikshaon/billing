<script setup>
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'
</script>

<template>
  <div class="row">
    <div class="col-6">
      <SectionCard title="Quick Stats">
        <div class="row">
          <div class="col-6"><div class="section"><strong>{{ store.merchants.length }}</strong><br/>Merchants</div></div>
          <div class="col-6"><div class="section"><strong>{{ store.customers.length }}</strong><br/>Customers</div></div>
          <div class="col-6"><div class="section"><strong>{{ store.products.length }}</strong><br/>Products</div></div>
          <div class="col-6"><div class="section"><strong>{{ store.invoices.length }}</strong><br/>Invoices</div></div>
        </div>
      </SectionCard>
    </div>
    <div class="col-6">
      <SectionCard title="Get Started">
        <ol>
          <li>Add your Merchant profile</li>
          <li>Create Customers</li>
          <li>Define Products, Taxes, Payment Terms</li>
          <li>Create an Invoice</li>
        </ol>
      </SectionCard>
    </div>
  </div>
</template>
