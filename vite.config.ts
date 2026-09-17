/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { noindexOutput, sitemap, woff2Only } from './build/site-plugins'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, 'VITE_')
  // 沒有正式網址（例如 Netlify 預設的 xxx.netlify.app 預覽）或明確要求時，整站不收錄
  const noindex = env.VITE_NOINDEX === 'true' || !env.VITE_SITE_URL

  return {
    plugins: [
      vue(),
      woff2Only(),
      sitemap({ siteUrl: env.VITE_SITE_URL, root, noindex }),
      noindexOutput(noindex),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/styles/tokens" as *;\n@use "@/styles/mixins" as *;\n`,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.spec.ts'],
      globals: false,
    },
  }
})
