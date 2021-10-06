import './registerServiceWorker'
import App from './App.vue'
import { Quasar } from 'quasar'
import { createApp } from 'vue'
import quasarUserOptions from './quasar-user-options'
import router from './router'

createApp(App).use(Quasar, quasarUserOptions).use(router).mount('#app')
