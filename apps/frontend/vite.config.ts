import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        [`${loadEnv(mode, process.cwd()).VITE_APP_BASE_API}`]: {
          target: loadEnv(mode, process.cwd()).VITE_APP_BASE_URL,
          changeOrigin: true,
          ws: true,
        },
      },
    },
    plugins: [vue()],
  };
});
