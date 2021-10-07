import './registerServiceWorker'
import App from './App.vue'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import en from '@/i18n/locales/en'
import quasarUserOptions from '@/quasar-user-options'
import { setupI18n } from '@/i18n'
import { setupRouter } from '@/router'

const i18n = setupI18n({
  globalInjection: true,
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
  },
})

const router = setupRouter(i18n)

createApp(App).use(Quasar, quasarUserOptions).use(i18n).use(router).mount('#app')
