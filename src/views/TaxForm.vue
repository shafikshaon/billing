<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store, uid, upsert } from '../store'

const route = useRoute()
const router = useRouter()
const isEdit = route.path.endsWith('/edit')
const editingId = isEdit ? route.params.id : null

const draft = reactive({ id: '', name: '', rate: 0 })

onMounted(() => {
  if (isEdit && editingId) {
    const t = store.taxes.find(x => x.id === editingId)
    if (t) Object.assign(draft, JSON.parse(JSON.stringify(t)))
  }
})

function cancel(){ router.push('/taxes') }
function save(){
  if(!draft.name.trim()) return
  if(draft.rate < 0) draft.rate = 0
  if(!draft.id) draft.id = uid('tax_')
  const copy = JSON.parse(JSON.stringify(draft))
  upsert(store.taxes, copy)
  alert('Tax saved')
  router.push('/taxes')
}
</script>

<template>
  <div class="row g-3 justify-content-center">
    <div class="col-12 col-lg-8 col-xl-6">
      <SectionCard :title="isEdit ? 'Edit Tax' : 'New Tax'">
        <template #actions>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="cancel">Back to list</button>
        </template>

        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label">Name</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., VAT 15% (Standard)" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Rate (%)</label>
            <input class="form-control form-control-sm" type="number" min="0" step="0.01" v-model.number="draft.rate" />
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-2">
          <button class="btn btn-outline-secondary" type="button" @click="cancel">Cancel</button>
          <button class="btn btn-primary" type="button" @click="save">Save</button>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
