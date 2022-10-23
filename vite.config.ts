/// <reference types="vitest" />
import { URL, fileURLToPath } from 'url'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
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

    // TODO
    //   When build and run with the following specified, the text is not displayed,
    //   so please investigate.
    // vueI18n({}),

    vueJsx(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      path: 'path-browserify',
      url: 'url',
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use '@/styles/app.scss' as *;
        `,
      },
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
