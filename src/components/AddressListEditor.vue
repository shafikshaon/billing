<script setup>
import { reactive, computed } from 'vue'
import { uid } from '../store'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue'])

const addrTypes = ['primary', 'secondary', 'billing', 'shipping', 'warehouse']

const hasPrimary = computed(() => props.modelValue.some(a => a.type === 'primary'))

function update() {
  emit('update:modelValue', props.modelValue)
}
function add() {
  props.modelValue.push(reactive({
    id: uid('addr_'),
    type: 'primary',
    line1: '', line2: '',
    city: '', zip: '',
    isPrimary: false
  }))
  update()
}
function removeAt(i) {
  props.modelValue.splice(i, 1)
  update()
}
</script>

<template>
  <div>
    <div v-for="(a, i) in modelValue" :key="a.id" class="card border-0 shadow-sm mb-2">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label">Type</label>
            <select class="form-select form-select-sm" v-model="a.type" @change="update">
              <option
                v-for="t in addrTypes"
                :key="t"
                :value="t"
                :disabled="t==='primary' && hasPrimary && a.type!=='primary'"
              >
                {{ t }}
              </option>
            </select>
          </div>
          <div class="col-md-8">
            <label class="form-label">Line 1</label>
            <input class="form-control form-control-sm" v-model="a.line1" @input="update" placeholder="Street address line 1" />
          </div>

          <div class="col-md-12">
            <label class="form-label">Line 2</label>
            <input class="form-control form-control-sm" v-model="a.line2" @input="update" placeholder="Street address line 2" />
          </div>
          <div class="col-md-6">
            <label class="form-label">City</label>
            <input class="form-control form-control-sm" v-model="a.city" @input="update" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Postal code</label>
            <input class="form-control form-control-sm" v-model="a.zip" @input="update" />
          </div>
        </div>
        <div class="d-flex align-items-center justify-content-between mt-2">
          <span class="badge text-bg-light border">#{{ i + 1 }}</span>
          <button class="btn btn-sm btn-outline-danger" type="button" @click="removeAt(i)">Remove</button>
        </div>
      </div>
    </div>

    <button type="button" class="btn btn-sm btn-outline-secondary" @click="add">+ Add address</button>
  </div>
</template>
