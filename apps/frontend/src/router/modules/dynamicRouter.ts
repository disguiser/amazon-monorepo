import type { Component } from 'vue';
import { NIcon } from 'naive-ui';
import { h } from 'vue';
import { BugOutline } from '@vicons/ionicons5';
import type { RouteRecordRaw } from 'vue-router';

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}
/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    isKeepAlive: true            if set true, the page will no be cached(default is true)
    closeable: true              if set true, the tab can not close
    isHide: false                 if set false, the item will hidden in sidebar(default is false)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
    isFull: false                 不套布局组件,独立全屏,实现逻辑在permission.ts
  }
 */

/**
 * the routes that need to be dynamically loaded based on user roles
 */
export const dynamicRouter: RouteRecordRaw[] = [
  {
    path: '/spider',
    name: '爬虫',
    redirect: '/spider/asin',
    meta: {
      icon: renderIcon(BugOutline),
    },
    children: [
      {
        name: 'AMZ商品',
        path: 'asin',
        component: () => import('@/views/asin/index.vue'),
      },
      {
        name: 'Sorftime数据',
        path: 'sorftime',
        component: () => import('@/views/sorftime/index.vue'),
      },
    ],
  },
  // {
  //   path: '/dashboard',
  //   component: () => import('@/views/dashboard/index.vue'),
  //   name: 'Dashboard',
  //   meta: {
  //     title: '总览',
  //     icon: 'ant-design:dashboard-outlined',
  //     closeable: false,
  //   },
  // },
  // {
  //   path: '/profile',
  //   name: 'Profile',
  //   meta: {
  //     title: 'Profile',
  //     isHide: true,
  //     isKeepAlive: false,
  //   },
  //   component: () => import('@/views/profile/index.vue'),
  // },
  // {
  //   path: '/dept/stock',
  //   component: () => import('@/views/goods-stock/index.vue'),
  //   name: 'GoodStock',
  //   meta: {
  //     title: '门店库存',
  //     icon: 'healthicons:stock-out-outline',
  //     activeMenu: '/stock/dept',
  //     roles: ['Admin', 'Boss', 'Waiter'],
  //   },
  // },
  // {
  //   path: '/goods-list',
  //   meta: {
  //     title: '商品管理',
  //     icon: 'ep:goods',
  //     roles: ['Admin', 'Boss'],
  //   },
  //   component: () => import('@/views/goods-list/index.vue'),
  //   name: 'GoodsList',
  // },
  // {
  //   path: '/wholesale',
  //   meta: {
  //     title: '批发',
  //     icon: 'clarity:factory-line',
  //     roles: ['Admin', 'Waiter', 'Boss'],
  //   },
  //   redirect: '/wholesale/list',
  //   children: [
  //     {
  //       path: 'list',
  //       component: () => import('@/views/order/wholesale/index.vue'),
  //       name: 'Order',
  //       meta: {
  //         title: '订单',
  //         roles: ['Admin', 'Waiter', 'Boss'],
  //       },
  //     },
  //     {
  //       path: 'customer-list',
  //       component: () => import('@/views/customer-list/index.vue'),
  //       name: 'CustomerList',
  //       meta: {
  //         title: '客户',
  //         roles: ['Admin', 'Waiter', 'Boss'],
  //       },
  //     },
  //     {
  //       path: 'return-list',
  //       component: () => import('@/views/order/wholesale/ReturnList.vue'),
  //       name: 'ReturnList',
  //       meta: {
  //         title: '退货',
  //         roles: ['Admin', 'Waiter', 'Boss'],
  //       },
  //     },
  //   ],
  // },
  // {
  //   path: '/wholesale/print',
  //   component: () => import('@/views/order/wholesale/Print.vue'),
  //   meta: {
  //     title: '订货单打印',
  //     activeMenu: '/order/wholesale/print',
  //     roles: ['Admin', 'Waiter'],
  //     isHide: true,
  //     isFull: true,
  //   },
  // },
  // {
  //   path: '/retail',
  //   meta: {
  //     title: '零售',
  //     icon: 'ic:sharp-point-of-sale',
  //     roles: ['Admin', 'Waiter', 'Boss'],
  //   },
  //   children: [
  //     {
  //       path: 'test',
  //       component: () => import('@/views/order/retail/BarcodeTable.vue'),
  //       name: 'Test',
  //       meta: {
  //         title: '测试扫码',
  //         roles: ['Admin'],
  //       },
  //     },
  //     {
  //       path: 'order-list',
  //       component: () => import('@/views/order/retail/index.vue'),
  //       name: 'Retail',
  //       meta: {
  //         title: '订单',
  //         roles: ['Admin', 'Waiter', 'Boss'],
  //       },
  //     },
  //     {
  //       path: 'today-item-list',
  //       component: () => import('@/views/order/retail/TodayItemList.vue'),
  //       name: 'TodayItemList',
  //       meta: {
  //         title: '单品列表',
  //         roles: ['Admin', 'Waiter', 'Boss'],
  //       },
  //     },
  //     {
  //       path: 'vip-list',
  //       component: () => import('@/views/vip-list/index.vue'),
  //       name: 'VipList',
  //       meta: {
  //         title: '会员列表',
  //         roles: ['Admin'],
  //       },
  //     },
  //   ],
  // },
  // {
  //   path: '/retail/print',
  //   component: () => import('@/views/order/retail/Print.vue'),
  //   meta: {
  //     title: '小票打印',
  //     roles: ['Admin', 'Waiter'],
  //     isHide: true,
  //     isFull: true,
  //   },
  // },
  // {
  //   path: '/retail/print/daily-item-list',
  //   component: () => import('@/views/order/retail/ItemListPrint.vue'),
  //   meta: {
  //     title: '当日销售单品打印',
  //     roles: ['Admin', 'Waiter'],
  //     isHide: true,
  //     isFull: true,
  //   },
  // },
  // {
  //   path: '/size-group',
  //   meta: { title: '尺码组', icon: 'bx:font-size', roles: ['Admin', 'Boss'] },
  //   component: () => import('@/views/size-group/index.vue'),
  //   name: 'SizeGroup',
  // },
  // {
  //   path: '/size-group-list',
  //   meta: { title: '尺码组table视图', icon: 'bx:font-size', roles: ['Admin'] },
  //   component: () => import('@/views/size-group-list/index.vue'),
  //   name: 'SizeGroupList',
  // },
  // {
  //   path: '/user/list',
  //   meta: { title: '员工管理', icon: 'clarity:employee-group-line', roles: ['Admin'] },
  //   component: () => import('@/views/user-list/index.vue'),
  //   name: 'UserList',
  // },
  // {
  //   path: '/dept/list',
  //   meta: { title: '门店管理', icon: 'clarity:store-line', roles: ['Admin', 'Boss'] },
  //   component: () => import('@/views/dept-list/index.vue'),
  //   name: 'DeptList',
  // },
  // {
  //   path: '/dict-list',
  //   meta: { title: '字典表', icon: 'fluent-mdl2:dictionary', roles: ['Admin', 'Boss'] },
  //   component: () => import('@/views/dict-list/index.vue'),
  //   name: 'DictList',
  // },
  // {
  //   path: '/print',
  //   meta: {
  //     title: '打印',
  //     icon: 'clarity:factory-line',
  //     roles: ['Admin', 'Boss'],
  //     isHide: true,
  //   },
  //   children: [
  //     {
  //       path: 'list',
  //       name: 'TemplateList',
  //       component: () => import('@/views/print/TSCDLL/List.vue'),
  //       meta: {
  //         title: '打印模板',
  //         roles: ['Admin', 'Boss'],
  //       },
  //     },
  //     {
  //       path: 'edit',
  //       name: 'TemplateEdit',
  //       component: () => import('@/views/print/TSCDLL/Edit.vue'),
  //       meta: {
  //         title: '模板编辑',
  //         isKeepAlive: false,
  //         activeMenu: '/print/list',
  //         roles: ['Admin', 'Boss'],
  //         isHide: true,
  //       },
  //     },
  //     {
  //       path: 'Argox',
  //       name: '立象',
  //       component: () => import('@/views/print/argox.vue'),
  //       meta: {
  //         title: '立象',
  //         roles: ['Admin'],
  //       },
  //     },
  //   ],
  // },
];
