import './registerServiceWorker'
import AppPage from './pages/app'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import quasarUserOptions from '@/quasar-user-options'
import { setupI18n } from '@/i18n'
import { setupRouter } from '@/router'

const i18n = setupI18n()
const router = setupRouter(i18n)
createApp(AppPage).use(Quasar, quasarUserOptions).use(i18n).use(router).mount('#app')
