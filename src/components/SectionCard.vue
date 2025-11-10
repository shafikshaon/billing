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
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  overflow: hidden;
}

.stripe-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--gray-300);
}

.stripe-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
}

.stripe-card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.stripe-card-actions {
  display: flex;
  gap: 12px;
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
