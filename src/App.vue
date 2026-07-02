<template>
  <div id="app">
    <header class="app-header">
      <h1>中国象棋</h1>
    </header>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: white;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.app-header h1 {
  margin: 0;
  font-size: 28px;
  letter-spacing: 4px;
}
</style>
