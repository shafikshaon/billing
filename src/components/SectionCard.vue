<template>
  <div class="card border-0 shadow-sm mb-3" :style="style">
    <div v-if="title" class="card-header bg-transparent d-flex align-items-center justify-content-between py-2">
      <h6 class="mb-0">{{ title }}</h6>
      <div><slot name="actions" /></div>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  style: [String, Object],
})
</script>
