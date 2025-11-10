// Toast Notification System
import { reactive } from 'vue'

export const toastState = reactive({
  toasts: []
})

let toastIdCounter = 0

function createToast(type, title, message, duration = 5000) {
  const id = ++toastIdCounter
  const toast = {
    id,
    type, // 'success', 'error', 'warning', 'info'
    title,
    message,
    duration
  }

  toastState.toasts.push(toast)

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

function removeToast(id) {
  const index = toastState.toasts.findIndex(t => t.id === id)
  if (index !== -1) {
    toastState.toasts.splice(index, 1)
  }
}

export const toast = {
  success(title, message, duration) {
    return createToast('success', title, message, duration)
  },
  error(title, message, duration) {
    return createToast('error', title, message, duration)
  },
  warning(title, message, duration) {
    return createToast('warning', title, message, duration)
  },
  info(title, message, duration) {
    return createToast('info', title, message, duration)
  },
  remove(id) {
    removeToast(id)
  }
}

// Convenience method to use as composable
export function useToast() {
  return toast
}
