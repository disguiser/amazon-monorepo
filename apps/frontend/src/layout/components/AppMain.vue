<template>
  <div class="bg-[#f0f2f5] h-full w-full">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </router-view>
  </div>
</template>

<script setup lang="ts"></script>
