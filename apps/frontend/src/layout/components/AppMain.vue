<template>
  <div class="app-main">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </router-view>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="css" scoped>
.app-main {
  /* 50= navbar  50  */
  /* min-height: calc(100vh - 50px); */
  width: 100%;
  position: relative;
  /* padding: 10px; */
  background-color: #f0f2f5;
  overflow: auto;
  flex: 1;
}
/* fix css style bug in open el-dialog */
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
