import '@/styles/settings.scss'
import { AppConfig, AppConstants, Screen } from '@/base'
import { AppI18n } from '@/i18n'
import AppPage from './pages/app'
import { AppRouter } from '@/router'
import { AppServices } from '@/services'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import quasarOptions from '@/quasar-options'

async function init() {
  AppConfig.setup()
  const i18n = AppI18n.setup()
  await AppI18n.useUtils().loadI18nLocaleMessages()
  AppRouter.setup(i18n)
  AppRouter.useVueRouter()
  AppServices.setup()

  const app = createApp(AppPage)
    .use(Quasar, quasarOptions)
    .use(i18n)
    .use(AppRouter.useVueRouter())
    .use(AppRouter.use().routes)
    .use(AppConstants.use())
    .use(Screen.use())
    .mount('#app')
}
init()
