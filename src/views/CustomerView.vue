<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store } from '../store'

const route = useRoute()
const router = useRouter()
const customer = computed(() => store.customers.find(x => x.id === route.params.id))

function back() { router.push('/customers') }
function edit() { router.push(`/customers/${route.params.id}/edit`) }
</script>

<template>
  <div class="row g-3" v-if="customer">
    <div class="col-12">
      <SectionCard :title="customer.name">
        <template #actions>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" @click="back">Back</button>
            <button class="btn btn-primary" @click="edit">Edit</button>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-4"><strong>Type:</strong> <span class="text-capitalize">{{ customer.type }}</span></div>
          <div class="col-md-4" v-if="customer.type === 'company'"><strong>VAT/TAX ID:</strong> {{ customer.taxId || '—' }}</div>
          <div class="col-md-4" v-else><strong>NID:</strong> {{ customer.nid || '—' }}</div>
          <div class="col-md-4" v-if="customer.type === 'company'"><strong>Website:</strong> {{ customer.website || '—' }}</div>
          <div class="col-md-4"><strong>Notes:</strong> {{ customer.notes || '—' }}</div>
        </div>

        <hr/>

        <h6>Addresses</h6>
        <div v-if="customer.addresses?.length">
          <div class="card border-0 shadow-sm mb-2" v-for="a in customer.addresses" :key="a.id">
            <div class="card-body">
              <div class="small text-muted text-uppercase">{{ a.type }}</div>
              <div>{{ a.line1 }}</div>
              <div v-if="a.line2">{{ a.line2 }}</div>
              <div>{{ a.city }} {{ a.zip }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-muted">No addresses</div>

        <h6 class="mt-3">Contacts</h6>
        <div v-if="customer.contacts?.length">
          <div class="card border-0 shadow-sm mb-2" v-for="c in customer.contacts" :key="c.id">
            <div class="card-body">
              <div class="small text-muted text-uppercase">{{ c.type }}</div>
              <div>{{ c.name }}</div>
              <div v-if="c.email">{{ c.email }}</div>
              <div v-if="c.phone">{{ c.phone }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-muted">No contacts</div>
      </SectionCard>
    </div>
  </div>
  <div v-else class="text-muted">Customer not found.</div>
</template>
