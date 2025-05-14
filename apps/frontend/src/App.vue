<template>
  <div class="app">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </div>
</template>

<script lang="ts" setup>
import { NMessageProvider } from 'naive-ui';
</script>

<style></style>
