<template>
  <n-layout has-sider style="height: 100%">
    <sidebar />
    <n-layout :native-scrollbar="false">
      <app-main />
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { NLayout } from 'naive-ui';
import AppMain from './components/AppMain.vue';
import Sidebar from './components/Sidebar/index.vue';

defineOptions({
  name: 'Layout',
});
</script>
<style lang="css" scoped>
.main-area {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
