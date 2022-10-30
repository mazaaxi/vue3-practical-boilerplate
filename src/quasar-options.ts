import 'quasar/src/css/index.sass'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'

import { Dialog, Loading, Notify } from 'quasar'

// to be used on app.use(Quasar, { ... })
export default {
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
}
