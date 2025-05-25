<template>
  <div>
    <n-button @click="spiderSorftime">按钮</n-button>
  </div>
</template>
<script setup lang="ts">
import { NButton } from 'naive-ui';
const serverUrl = `${import.meta.env.VITE_APP_BASE_API}/spider`;

const spiderSorftime = async () => {
  await fetch(`${serverUrl}/daily`);
};
</script>
