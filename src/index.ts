import './registerServiceWorker'
import { setupI18n, useI18nUtils } from '@/i18n'
import AppPage from './pages/app'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import quasarUserOptions from '@/quasar-user-options'
import { setupRouter } from '@/router'

async function init() {
  const i18n = await setupI18n()
  await useI18nUtils().loadI18nLocaleMessages()

  const router = setupRouter(i18n)

  createApp(AppPage).use(Quasar, quasarUserOptions).use(i18n).use(router).mount('#app')
}
init()
