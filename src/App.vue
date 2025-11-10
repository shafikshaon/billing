<script setup>
import MainLayout from './layouts/MainLayout.vue'
import ToastContainer from './components/ToastContainer.vue'
</script>

<template>
  <MainLayout>
    <router-view />
  </MainLayout>
  <ToastContainer />
</template>

<style scoped>
/* App-level styles handled in assets/main.css */
</style>
