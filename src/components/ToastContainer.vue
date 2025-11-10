<script setup>
import { toastState } from '../utils/toast'

function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || '•'
}

function removeToast(id) {
  const index = toastState.toasts.findIndex(t => t.id === id)
  if (index !== -1) {
    toastState.toasts.splice(index, 1)
  }
}
</script>

<template>
  <div class="toast-container">
    <div
      v-for="toast in toastState.toasts"
      :key="toast.id"
      :class="['toast', `toast-${toast.type}`]"
    >
      <div class="toast-icon">{{ getIcon(toast.type) }}</div>
      <div class="toast-content">
        <div class="toast-title">{{ toast.title }}</div>
        <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
      </div>
      <button
        type="button"
        class="toast-close"
        @click="removeToast(toast.id)"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  </div>
</template>
