/* eslint-disable sort-imports */

import { setupI18n, useI18nUtils } from '@/i18n'
import { useConstants, useScreen } from '@/base'
import App from './App.vue'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import quasarOptions from '@/quasar-options'
import { setupConfig } from '@/config'
import { setupRouter } from '@/router'
import { setupServices } from '@/services'

async function init() {
  setupConfig()
  const i18n = setupI18n()
  await useI18nUtils().loadI18nLocaleMessages()
  const router = setupRouter()
  setupServices()
  const constants = useConstants()
  const screen = useScreen()

  const app = createApp(App)
    .use(Quasar, quasarOptions)
    .use(i18n)
    .use(constants)
    .use(router)
    .use(router.routes)
    .use(screen)
    .mount('#app')
}
init()
