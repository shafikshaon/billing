import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Debug log for deployment verification
console.log('Billing App initializing...', new Date().toISOString())

// Load Bootstrap via CDN (CSS + JS) before mounting the app
;(function ensureBootstrapCdn() {
  // Use Bootswatch Pulse theme (includes Bootstrap CSS)
  const CSS_HREF = 'https://bootswatch.com/5/pulse/bootstrap.min.css'
  const JS_SRC = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
  if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = CSS_HREF
    document.head.appendChild(link)
  }
  if (!document.querySelector(`script[src="${JS_SRC}"]`)) {
    const script = document.createElement('script')
    script.src = JS_SRC
    script.defer = true
    document.body.appendChild(script)
  }
})()

try {
  const app = createApp(App).use(router)
  app.mount('#app')
  console.log('Billing App mounted successfully')
} catch (error) {
  console.error('Error mounting app:', error)
}
