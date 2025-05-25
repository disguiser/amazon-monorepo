<template>
  <n-layout-sider
    bordered
    show-trigger
    collapse-mode="width"
    :collapsed-width="64"
    :width="240"
    :native-scrollbar="true"
  >
    <n-menu :collapsed-width="64" :collapsed-icon-size="22" :options="menuOptions" />
  </n-layout-sider>
</template>
<script lang="ts" setup>
import type { MenuOption } from 'naive-ui';
import { NLayoutSider, NMenu } from 'naive-ui';
import { dynamicRouter } from '@/router/modules/dynamicRouter';
import type { VNodeChild } from 'vue';
import { RouterLink } from 'vue-router';
import { h } from 'vue';

defineOptions({
  name: 'Sidebar',
});

const renderRouterLink = (label: string, path: string) => {
  return () =>
    h(
      RouterLink,
      {
        to: {
          path,
        },
      },
      { default: () => label },
    );
};

const menuOptions: MenuOption[] = dynamicRouter.map((route) => ({
  label: route.name || '',
  key: route.path || '',
  icon: (route.meta?.icon as () => VNodeChild) || undefined,
  children: route.children?.map((child) => ({
    label: renderRouterLink(child.name as string, child.path) || '',
    key: child.path || '',
  })),
}));
</script>
<style lang="css"></style>
