<template>
  <suspense>
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-modal-provider>
            <n-dialog-provider>
              <router-view />
            </n-dialog-provider>
          </n-modal-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
    <template #fallback> Loading... </template>
  </suspense>
</template>

<script lang="ts" setup>
import {
  NMessageProvider,
  NNotificationProvider,
  NModalProvider,
  NDialogProvider,
  NLoadingBarProvider,
} from 'naive-ui';
</script>
