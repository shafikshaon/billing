<template>
  <div class="stripe-card" :style="style">
    <div v-if="title" class="stripe-card-header">
      <h6 class="stripe-card-title">{{ title }}</h6>
      <div class="stripe-card-actions"><slot name="actions" /></div>
    </div>
    <div class="stripe-card-body">
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

<style scoped>
.stripe-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.02);
  transition: all var(--transition-fast);
  overflow: hidden;
}

.stripe-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
}

.stripe-card-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.stripe-card-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.stripe-card-body {
  padding: 0;
  background: #ffffff;
}

.stripe-card-body :deep(.table) {
  margin-bottom: 0;
}
</style>
