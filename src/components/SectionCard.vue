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
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  overflow: hidden;
}

.stripe-card:hover {
  box-shadow: var(--shadow-md);
}

.stripe-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.125rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.stripe-card-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.stripe-card-actions {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}

.stripe-card-body {
  padding: 1rem 1.125rem;
}
</style>
