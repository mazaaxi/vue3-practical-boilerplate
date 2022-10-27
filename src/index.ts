import { setupConfig, useConstants, useScreen } from '@/base'
import { setupI18n, useI18nUtils } from '@/i18n'
import AppPage from './pages/app'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import quasarUserOptions from '@/quasar-user-options'
import { setupRouter } from '@/router'
import { setupServiceWorker } from '@/service-worker'
import { setupServices } from '@/services'

async function init() {
  setupConfig()
  const i18n = setupI18n()
  await useI18nUtils().loadI18nLocaleMessages()
  const router = setupRouter(i18n)
  setupServiceWorker()
  setupServices()
  const constants = useConstants()
  const screen = useScreen()

  createApp(AppPage)
    .use(Quasar, quasarUserOptions)
    .use(i18n)
    .use(router)
    .use(router.routes)
    .use(constants)
    .use(screen)
    .mount('#app')
}
init()
