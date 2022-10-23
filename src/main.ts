/* eslint-disable sort-imports */

import { Dialog, Loading, Notify } from 'quasar'
import { useConstants, useScreen } from '@/base'
import App from './App.vue'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import router from '@/router'
import { setupConfig } from '@/config'
import { setupServices } from '@/services'

import 'quasar/src/css/index.sass'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import '@/assets/main.css'

async function init() {
  setupConfig()
  setupServices()
  const constants = useConstants()
  const screen = useScreen()

  const app = createApp(App)
    .use(Quasar, {
      // import Quasar plugins and add here
      plugins: {
        Dialog,
        Loading,
        Notify,
      },
      config: {
        screen: {
          bodyClasses: true,
        },
        notify: {},
        loading: {},
      },
    })
    .use(constants)
    .use(router)
    .use(screen)
    .mount('#app')
}
init()
