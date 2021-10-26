import { setupI18n, useI18nUtils } from '@/i18n'
import AppPage from './pages/app'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import quasarUserOptions from '@/quasar-user-options'
import { setupConfig } from '@/config'
import { setupRouter } from '@/router'
import { setupService } from '@/services'
import { setupServiceWorker } from '@/service-worker'

async function init() {
  setupConfig()
  const i18n = setupI18n()
  await useI18nUtils().loadI18nLocaleMessages()
  const router = setupRouter(i18n)
  setupServiceWorker()
  setupService()

  createApp(AppPage).use(Quasar, quasarUserOptions).use(i18n).use(router).mount('#app')
}
init()
