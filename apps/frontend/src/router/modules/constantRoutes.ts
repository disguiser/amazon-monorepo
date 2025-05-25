import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue'),
      },
    ],
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
  },
  {
    path: '/',
    redirect: '/spider',
  },
  {
    path: '/layout',
    name: 'layout',
    component: Layout,
    redirect: '/spider',
    children: [],
  },
];
