import { createApp } from 'vue';
import App from './App.vue';
const app = createApp(App);

import router from './router/index';
import './router';
app.use(router);

import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

import 'modern-normalize/modern-normalize.css';
import 'virtual:uno.css'
import './styles/global.css';

// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

app.mount('#app');
