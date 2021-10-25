import { boot } from 'quasar/wrappers'
import { setupConfig } from 'src/config'

export default boot((/* { app, router, ... } */) => {
  setupConfig()
})
