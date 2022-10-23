/// <reference types="vitest" />
import { URL, fileURLToPath } from 'url'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    quasar({
      sassVariables: 'src/styles/quasar.scss',
    }),
    vueJsx(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      path: 'path-browserify',
      url: 'url',
    },
  },

  test: {
    setupFiles: 'src/tests/setup.ts',
    watch: false,
    threads: false,
  },

  server: {
    host: '0.0.0.0',
    port: 5050,
  },
})
