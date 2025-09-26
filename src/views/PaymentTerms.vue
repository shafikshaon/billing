<script setup>
import { reactive } from 'vue'
import SectionCard from '../components/SectionCard.vue'
import { store, uid, removeById } from '../store'

const draft = reactive({ id: '', name: '', days: 0 })

function edit(t){ Object.assign(draft, JSON.parse(JSON.stringify(t))) }
function reset(){ Object.assign(draft, { id:'', name:'', days:0 }) }
function save(){
  if(!draft.name.trim()) return
  if(!draft.id) draft.id = uid('term_')
  const copy = JSON.parse(JSON.stringify(draft))
  const idx = store.paymentTerms.findIndex(x=>x.id===copy.id)
  if(idx===-1) store.paymentTerms.push(copy); else store.paymentTerms.splice(idx,1,copy)
  reset()
}
function remove(id){ removeById(store.paymentTerms, id); if(draft.id===id) reset() }
</script>

<template>
  <div class="row g-3">
    <div class="col-lg-7">
      <SectionCard title="Payment Terms">
        <template #actions>
          <button class="btn btn-sm btn-primary" type="button" @click="reset">New</button>
        </template>
        <table class="table table-sm align-middle mb-0">
          <thead class="table-light"><tr><th>Name</th><th>Days</th><th class="text-end"></th></tr></thead>
          <tbody>
            <tr v-for="t in store.paymentTerms" :key="t.id">
              <td class="fw-medium">{{ t.name }}</td>
              <td>{{ t.days }}</td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary" @click="edit(t)">Edit</button>
                  <button class="btn btn-outline-danger" @click="remove(t.id)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="store.paymentTerms.length===0"><td colspan="3" class="text-muted">No payment terms yet.</td></tr>
          </tbody>
        </table>
      </SectionCard>
    </div>
    <div class="col-lg-5">
      <SectionCard :title="draft.id ? 'Edit Term' : 'New Term'">
        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label">Name</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., Net 30" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Days</label>
            <input class="form-control form-control-sm" type="number" min="0" step="1" v-model.number="draft.days" />
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-2">
          <button class="btn btn-outline-secondary" @click="reset" type="button">Reset</button>
          <button class="btn btn-primary" @click="save" type="button">{{ draft.id ? 'Update' : 'Create' }}</button>
        </div>
      </SectionCard>
    </div>
  </div>
</template>
