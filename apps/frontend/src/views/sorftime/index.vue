<template>
  <div class="flex flex-col px-5 h-full min-h-full">
    <n-form
      class="bg-white my-5 p-2"
      ref="formRef"
      inline
    >
      <n-form-item label="日期" path="user.name">
        <n-date-picker v-model:value="timestamp" type="date" />
      </n-form-item>
      <n-form-item>
        <n-button @click="search">查询</n-button>
        <n-button @click="spiderSorftime">抓取</n-button>
      </n-form-item>
    </n-form>
    <div class="flex-1 bg-white grid grid-cols-3 overflow-auto">
      <div class="relative p-2" v-for="r in rank" :key="r.rank">
        <div class="absolute top-0 left-0 bg-red text-white w-10 h-8 p-1">
          <span>{{ r.rank }}</span>
        </div>
        <img class="max-w-full" :src="r.imgUrl" alt="">
        <div>{{ r.title }}</div>
        <div v-if="r.price">${{ r.price }}</div>
        <div><n-rate allow-half readonly :value="r.rate" />{{ r.rateCount }}</div>
        <div>{{ r.asin }}</div>
        <div>Listing月销量：{{ r.listingSales }}</div>
        <div>ASIN月销量：{{ r.asinSales }}</div>
        <div>销售额：{{ r.revenus }}</div>
        <div>品牌：{{ r.brand }}</div>
        <div>卖家：{{ r.seller }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NDatePicker, NForm, NFormItem, NRate } from 'naive-ui';
import type { RankingItem } from '@amazon-monorepo/shared';
import { request } from '@/api/request';

const serverUrl = `${import.meta.env.VITE_APP_BASE_API}`;

const timestamp = ref(Date.now());
const rank = ref<RankingItem[]>();

const spiderSorftime = async () => {
  await fetch(`${serverUrl}/spider/daily`);
};

const search = async () => {
  rank.value = await request<RankingItem[]>(`${serverUrl}/ranking-snapshot/${timestamp.value}`);
}
</script>