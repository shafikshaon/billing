<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { store, uid, upsert } from '../store'

const route = useRoute()
const router = useRouter()
const isEdit = route.path.endsWith('/edit')
const editingId = isEdit ? route.params.id : null

const draft = reactive({ id:'', name:'', content:'' })

onMounted(() => {
  if (isEdit && editingId) {
    const t = store.termsTemplates.find(x => x.id === editingId)
    if (t) Object.assign(draft, JSON.parse(JSON.stringify(t)))
  }
})

function cancel(){ router.push('/terms-conditions') }
function save(){
  if(!draft.name.trim()) return
  if(!draft.id) draft.id = uid('tc_')
  const copy = JSON.parse(JSON.stringify(draft))
  upsert(store.termsTemplates, copy)
  alert('Template saved')
  router.push('/terms-conditions')
}
</script>

<template>
  <div class="row g-3 justify-content-center">
    <div class="col-12 col-lg-8 col-xl-7">
      <SectionCard :title="isEdit ? 'Edit Terms Template' : 'New Terms Template'">
        <template #actions>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="cancel">Back to list</button>
        </template>

        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Name</label>
            <input class="form-control form-control-sm" v-model="draft.name" placeholder="e.g., Standard B2B (Bangladesh)" />
          </div>
          <div class="col-12">
            <label class="form-label">Content</label>
            <textarea class="form-control" rows="12" v-model="draft.content" placeholder="Write clear, concise terms that reflect your policies."></textarea>
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
