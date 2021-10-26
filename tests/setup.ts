import { useRouter, useRouterUtils } from '@/router'
import { Router } from 'vue-router'
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
  td.replace(require('@/router'), 'useRouter', () => td.object<typeof useRouter>())
  td.replace(require('@/router'), 'useRouterUtils', () => td.object<typeof useRouterUtils>())

  const router = td.object<Router>()

  config.global.plugins = [i18n, router]
})

afterEach(() => {
  clearProvidedDependency()
  td.reset()
})
