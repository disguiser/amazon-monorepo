import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/global.css';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

createApp(App).use(router).mount('#app');
