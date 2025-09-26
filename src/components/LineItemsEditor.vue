<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  products: { type: Array, required: true },
  taxes: { type: Array, required: true }
})
const emit = defineEmits(['update'])

function addItem() {
  props.items.push({
    id: Math.random().toString(36).slice(2,9),
    productId: '',
    description: '',
    qty: 1,
    unitPrice: 0,
    taxId: ''
  })
  emit('update')
}
function removeAt(i) {
  props.items.splice(i,1); emit('update')
}
function onProductChange(item) {
  const p = props.products.find(x => x.id === item.productId)
  if (p) {
    item.description = p.name
    // Apply product discount to derive effective unit price
    const base = Number(p.price) || 0
    const dtype = p.discountType || 'none'
    const dval = Number(p.discountValue) || 0
    let effective = base
    if (dtype === 'fixed') effective = Math.max(0, base - dval)
    else if (dtype === 'percent') effective = Math.max(0, base * (1 - dval / 100))
    item.unitPrice = Number(effective.toFixed(2))
    if (p.taxId) item.taxId = p.taxId
  }
  emit('update')
}
const totals = computed(() => {
  let sub = 0, tax = 0
  for (const it of props.items) {
    const line = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0)
    sub += line
    const t = props.taxes.find(x => x.id === it.taxId)
    if (t) tax += line * (Number(t.rate) || 0) / 100
  }
  return { sub, tax, total: sub + tax }
})
defineExpose({ totals })
</script>

<template>
  <div>
    <table class="table table-sm align-middle">
      <thead class="table-light">
        <tr>
          <th style="width:26%;">Product</th>
          <th>Description</th>
          <th style="width:10%;" class="text-end">Qty</th>
          <th style="width:14%;" class="text-end">Unit Price</th>
          <th style="width:16%;">Tax</th>
          <th style="width:14%;" class="text-end">Line Total</th>
          <th style="width:8%;"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(it, i) in items" :key="it.id">
          <td>
            <select class="form-select form-select-sm" v-model="it.productId" @change="onProductChange(it)">
              <option value="">—</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </td>
          <td>
            <input class="form-control form-control-sm" v-model="it.description" placeholder="Description" @input="$emit('update')" />
          </td>
          <td>
            <input class="form-control form-control-sm text-end" type="number" min="0" step="1" v-model.number="it.qty" @input="$emit('update')"/>
          </td>
          <td>
            <input class="form-control form-control-sm text-end" type="number" min="0" step="0.01" v-model.number="it.unitPrice" @input="$emit('update')"/>
          </td>
          <td>
            <select class="form-select form-select-sm" v-model="it.taxId" @change="$emit('update')">
              <option value="">None</option>
              <option v-for="t in taxes" :key="t.id" :value="t.id">{{ t.name }} ({{ t.rate }}%)</option>
            </select>
          </td>
          <td class="text-end">
            {{ ((Number(it.qty)||0) * (Number(it.unitPrice)||0)).toFixed(2) }}
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" type="button" @click="removeAt(i)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="d-flex align-items-start mt-2">
      <button class="btn btn-sm btn-outline-secondary" type="button" @click="addItem">+ Add line</button>
      <div class="ms-auto text-end">
        <div class="badge text-bg-light border d-block mb-1">Subtotal: {{ totals.sub.toFixed(2) }}</div>
        <div class="badge text-bg-light border d-block mb-1">Tax: {{ totals.tax.toFixed(2) }}</div>
        <div class="badge text-bg-light border d-block">Total: {{ totals.total.toFixed(2) }}</div>
      </div>
    </div>
  </div>
</template>
