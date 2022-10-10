import { AppRouter, setupRouter } from '@/router'
import { clearProvidedDependency } from './helpers'
import { config } from '@vue/test-utils'
import { setupConfig } from '@/config'
import { setupI18n } from '@/i18n'
import td from 'testdouble'

//
// Setting Jest
//
jest.setTimeout(5000)

//
// Setting testdouble
//
require('testdouble-jest')(td, jest)
// don't need to import `testdouble` in each test file to use it
window.td = td

beforeAll(async () => {})

beforeEach(async () => {
  setupConfig()

  const i18n = setupI18n()
  const router = setupRouter(i18n, td.object<AppRouter>())

  config.global.plugins = [i18n, router]
})

afterEach(() => {
  clearProvidedDependency()
  td.reset()
})
