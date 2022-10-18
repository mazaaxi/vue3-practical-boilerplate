import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import '@/assets/main.css'
import { Quasar } from 'quasar'
import { Dialog, Loading, Notify } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/material-icons-round/material-icons-round.css'
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'
import '@quasar/extras/material-symbols-sharp/material-symbols-sharp.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

const app = createApp(App)
  .use(router)
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

app.mount('#app')
