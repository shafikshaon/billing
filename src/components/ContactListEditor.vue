<script setup>
import { reactive } from 'vue'
import { uid } from '../store'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue'])

const contactTypes = ['primary', 'secondary', 'billing', 'support', 'emergency']

function update() { emit('update:modelValue', props.modelValue) }
function add() {
  props.modelValue.push(reactive({
    id: uid('ct_'),
    type: 'primary',
    name: '',
    email: '',
    phone: ''
  }))
  update()
}
function removeAt(i) {
  props.modelValue.splice(i,1); update()
}
</script>

<template>
  <div>
    <div v-for="(c, i) in modelValue" :key="c.id" class="card border-0 shadow-sm mb-2">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-3">
            <label class="form-label">Type</label>
            <select class="form-select form-select-sm" v-model="c.type" @change="update">
              <option v-for="t in contactTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Name</label>
            <input class="form-control form-control-sm" v-model="c.name" @input="update" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Email</label>
            <input class="form-control form-control-sm" type="email" v-model="c.email" @input="update" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Phone</label>
            <input class="form-control form-control-sm" v-model="c.phone" @input="update" />
          </div>
        </div>
        <div class="d-flex align-items-center justify-content-between mt-2">
          <span class="badge text-bg-light border">#{{ i + 1 }}</span>
          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeAt(i)">Remove</button>
        </div>
      </div>
    </div>

    <button type="button" class="btn btn-sm btn-outline-secondary" @click="add">+ Add contact</button>
  </div>
</template>
