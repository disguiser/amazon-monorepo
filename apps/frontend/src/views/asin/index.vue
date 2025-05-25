<template>
  <div class="home">
    <div class="layout-container">
      <div class="left-panel">
        <n-card title="Amazon 产品爬虫" class="main-card">
          <div class="control-panel">
            <n-form label-placement="left" class="form-container">
              <n-form-item label="后台静默抓取">
                <n-switch v-model:value="headless" />
                <n-button
                  type="primary"
                  @click="startSpider"
                  :disabled="inProcess"
                  :loading="inProcess"
                  style="margin-left: 10px"
                >
                  {{ inProcess ? '处理中...' : '开始抓取' }}
                </n-button>
              </n-form-item>
              <n-form-item label="站点选择">
                <n-select
                  v-model:value="chosenSite"
                  :options="sites"
                  label-field="key"
                  value-field="key"
                  class="selector"
                />
              </n-form-item>

              <n-form-item label="抓取间隔">
                <n-input-number
                  v-model:value="sleepSecond"
                  :disabled="inProcess"
                  :min="1"
                  class="input-number"
                />
                <span class="unit">秒</span>
              </n-form-item>

              <n-form-item>
                <n-button
                  type="info"
                  @click="showModel = true"
                  :disabled="inProcess"
                  :loading="inProcess"
                >
                  {{ inProcess ? '处理中...' : '店铺链接自动获取asin' }}
                </n-button>
              </n-form-item>

              <n-input
                v-model:value="asins"
                type="textarea"
                :disabled="inProcess || !chosenSite"
                placeholder="请输入asin，每行一个"
                class="textarea-full-height"
              />
            </n-form>
          </div>
        </n-card>
      </div>
      <div class="right-panel">
        <n-card title="日志" class="log-card">
          <template #header-extra>
            <n-button quaternary type="info" @click="clearLog" size="small"> 清空日志 </n-button>
            <a :href="excelUrl" target="_blank">下载Excel</a>
          </template>
          <div
            class="log-container"
            ref="logContainer"
            v-html="logMessages || '暂无日志信息...'"
          ></div>
        </n-card>
      </div>
    </div>
    <n-modal v-model:show="showModel">
      <n-card style="width: 600px" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <n-input-group>
          <n-input v-model:value="storeUrl" type="text" placeholder="店铺链接" />
          <n-button type="primary" @click="spiderAsinFromStoreUrl"> 获取 </n-button>
        </n-input-group>
      </n-card>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import {
  NButton,
  NCard,
  NSelect,
  NInput,
  NInputNumber,
  NForm,
  NFormItem,
  NSwitch,
  NModal,
  NInputGroup,
  useMessage,
} from 'naive-ui';

// 初始化消息组件
const message = useMessage();
const showModel = ref(false);
const storeUrl = ref('');
const serverUrl = `${import.meta.env.VITE_APP_BASE_API}/spider`;
const headless = ref(false);
const logMessages = ref('');
const asins = ref('');
const sleepSecond = ref(10);
const chosenSite = ref('');
const excelUrl = `${serverUrl}/download`;
const sites = [
  {
    key: 'AU',
    url: 'https://www.amazon.com.au/dp/',
  },
  {
    key: 'UK',
    url: 'https://www.amazon.co.uk/dp/',
  },
  {
    key: 'US',
    url: 'https://www.amazon.com/dp/',
  },
];
const siteObj = sites.reduce(
  (acc, site) => {
    acc[site.key] = site.url;
    return acc;
  },
  {} as Record<string, string>,
);
const inProcess = ref(false);
const logContainer = ref<HTMLDivElement | null>(null);
const eventSource = ref<EventSource | null>(null);

const spiderAsinFromStoreUrl = async () => {
  if (!storeUrl.value.trim()) {
    message.warning('请输入店铺链接');
    return;
  }
  try {
    inProcess.value = true;
    const res = await fetch(`${serverUrl}/spiderAsinFromStoreUrl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        headless: headless.value,
        url: storeUrl.value,
      }),
    });

    inProcess.value = false;
    if (res.ok) {
      asins.value = await res.text();
      message.success('ASIN 获取成功！');
      showModel.value = false; // 关闭模态框
    } else {
      const errorText = await res.text();
      message.error(`获取ASIN失败: ${res.status} - ${errorText || '未知错误'}`);
    }
  } catch (error: any) {
    message.error(`请求失败: ${error.message}`);
  }
};
// 发送消息到后端
const startSpider = async () => {
  if (!asins.value.trim()) {
    message.warning('请输入至少一个产品ID');
    return;
  }
  const set = new Set(asins.value.trim().split('\n'));
  asins.value = Array.from(set).join('\n');
  const urlArr = Array.from(set)
    .filter((id) => id.trim())
    .map((id) => `${siteObj[chosenSite.value]}${id.trim()}`);

  if (urlArr.length === 0) {
    message.warning('没有有效的产品ID');
    return;
  }

  inProcess.value = true;
  message.success(`开始处理，共 ${urlArr.length} 个产品`);
  logMessages.value += `<span class="log-info">开始处理，共 ${urlArr.length} 个产品</span><br/>`;

  try {
    // 开始爬虫任务
    const res = await fetch(`${serverUrl}/doSpider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: urlArr,
        sleepSecond: sleepSecond.value,
        headless: headless.value,
      }),
    });
    if (!res.ok) {
      message.error('请求失败');
      return;
    }
    const { taskId } = await res.json();
    // 创建 SSE 连接
    const source = new EventSource(`${serverUrl}/sse/${taskId}`);
    eventSource.value = source;
    // 处理服务器消息
    source.onmessage = (event) => {
      logMessages.value += `<span class="log-time">[${new Date().toLocaleTimeString()}]</span> ${event.data}<br/>`;
    };
    // 处理连接错误
    source.onerror = () => {
      inProcess.value = false;
      console.log('连接断开或发生错误!');
      source.close();
      eventSource.value = null;
    };
  } catch (error) {
    console.log(error);
    message.error('发生错误');
  }
};

// 清除日志
const clearLog = () => {
  logMessages.value = '';
  message.info('日志已清空');
};

// 组件卸载时关闭连接
onBeforeUnmount(() => {
  if (eventSource.value) {
    eventSource.value.close();
    eventSource.value = null;
  }
});

// 监听 logMessages 的变化
watch(logMessages, async () => {
  // 等待 DOM 更新
  await nextTick();
  // 滚动到底部
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
});
</script>

<style scoped>
.home {
  margin: 0 auto;
  padding: 20px;
  height: 100vh;
  box-sizing: border-box;
}

.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 20px;
}

.left-panel {
  width: 300px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-card,
.log-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.control-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.form-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.textarea-full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.textarea-full-height) {
  height: 100%;
}

:deep(.textarea-full-height .n-input-wrapper) {
  height: 100%;
}

:deep(.textarea-full-height .n-input__textarea) {
  height: 100% !important;
  min-height: 150px;
  flex: 1;
}

:deep(.textarea-full-height textarea) {
  height: 100% !important;
  flex: 1;
}

:deep(.n-card) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.n-card__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.n-spin-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.unit {
  margin-left: 5px;
}

.selector {
  width: 200px;
}

.input-number {
  width: 100px;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.log-time {
  color: #7e7e7e;
  font-weight: 500;
}

.log-info {
  color: #2080f0;
  font-weight: 500;
}

.log-success {
  color: #18a058;
  font-weight: 500;
}

.log-error {
  color: #d03050;
  font-weight: 500;
}
</style>
