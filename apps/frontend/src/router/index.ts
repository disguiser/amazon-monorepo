import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { constantRoutes } from './modules/constantRoutes';
import { dynamicRouter } from './modules/dynamicRouter';
import getPageTitle from '@/utils/index';

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
});
let isFirst = true;
router.beforeEach(async (to, _from, next) => {
  if (isFirst) {
    // set page title
    document.title = getPageTitle(to.meta.title as string);
    dynamicRouter.forEach((route: RouteRecordRaw) => {
      router.addRoute('layout', route);
    });
    isFirst = false;
    return next({ ...to, replace: true });
  }
  return next();
});

export default router;
