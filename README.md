# billing
# Billing App

A modern, single‑page billing and invoicing application with customer, product, tax, payment terms, shipping, invoices, credit notes, and settings management.

Live demo: https://billing.shafik.xyz/
GitHub Pages: https://shafikshaon.github.io/billing/

## Overview

- Manage merchants, customers, products, taxes, payment terms, shipping methods
- Create, edit, and view invoices and credit notes
- POS-style receipt view
- Dashboard and settings
- Clean, route-driven UX with lazy-loaded views for performance

## Tech Stack

- Frontend: Vue 3.5.18
- Router: vue-router 4.4.5 (history mode)
- Build tool: Vite 7.0.6
- Plugins: @vitejs/plugin-vue 6.0.1, vite-plugin-vue-devtools 8.0.0
- Package manager: npm

## Getting Started

Prerequisites:
- Node.js 20+ (per package.json engines)
- npm

Install dependencies:
This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions workflow.

### Troubleshooting Deployment

If the site shows a white screen:

1. **Check GitHub Pages Settings**:
   - Go to repository Settings → Pages
   - Ensure "Source" is set to "GitHub Actions"
   - Verify the custom domain is configured correctly

2. **Verify Workflow Run**:
   - Check Actions tab for the latest workflow run
   - Ensure the deployment completed successfully

3. **Browser Console**:
   - Open browser DevTools (F12)
   - Check Console for JavaScript errors
   - Look for "Billing App initializing..." message

4. **Clear Cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Try incognito/private browsing mode

5. **Check DNS**:
   - Verify CNAME file contains: `billing.shafik.xyz`
   - Ensure DNS records point to GitHub Pages
