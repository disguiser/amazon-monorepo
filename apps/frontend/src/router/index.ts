import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Spider from '../views/Spider.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Spider',
    component: Spider,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
