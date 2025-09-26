<script setup>
import { reactive } from 'vue'
import SectionCard from '../components/SectionCard.vue'
import { store, uid, removeById } from '../store'

const draft = reactive({ id:'', name:'', content:'' })

function edit(t){ Object.assign(draft, JSON.parse(JSON.stringify(t))) }
function reset(){ Object.assign(draft, { id:'', name:'', content:'' }) }
function save(){
  if(!draft.name.trim()) return
  if(!draft.id) draft.id = uid('tc_')
  const copy = JSON.parse(JSON.stringify(draft))
  const idx = store.termsTemplates.findIndex(x=>x.id===copy.id)
  if(idx===-1) store.termsTemplates.push(copy); else store.termsTemplates.splice(idx,1,copy)
  reset()
}
function remove(id){ removeById(store.termsTemplates, id); if(draft.id===id) reset() }
</script>

<template>
  <div class="row g-3">
    <div class="col-lg-6">
      <SectionCard title="Terms & Conditions">
        <template #actions>
          <button class="btn btn-sm btn-primary" type="button" @click="reset">New</button>
        </template>
        <table class="table table-sm align-middle mb-0">
          <thead class="table-light"><tr><th>Name</th><th>Preview</th><th class="text-end"></th></tr></thead>
          <tbody>
            <tr v-for="t in store.termsTemplates" :key="t.id">
              <td class="fw-medium">{{ t.name }}</td>
              <td style="max-width:420px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ t.content }}</td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary" @click="edit(t)">Edit</button>
                  <button class="btn btn-outline-danger" @click="remove(t.id)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="store.termsTemplates.length===0"><td colspan="3" class="text-muted">No templates yet.</td></tr>
          </tbody>
        </table>
      </SectionCard>
    </div>
    <div class="col-lg-6">
      <SectionCard :title="draft.id ? 'Edit Template' : 'New Template'">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Name</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., Standard Terms" />
          </div>
          <div class="col-12">
            <label class="form-label">Content</label>
            <textarea class="form-control" rows="8" v-model="draft.content" placeholder="Write your terms here..."></textarea>
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
