import { useRouter, useRouterUtils } from '@/router'
import { Router } from 'vue-router'
import { clearProvidedDependency } from './helpers'
import { config } from '@vue/test-utils'
// import { quasar } from '@/quasar'
import { setupI18n } from '@/i18n'
import td from 'testdouble'
import { useConfig } from '@/config'

//
// Jestの設定
//
jest.setTimeout(5000)

//
// testdoubleの設定
//
require('testdouble-jest')(td, jest)
// 各テストファイルでtestdoubleをインポートしなくても使用できるようになる
window.td = td

//
// Quasarの設定
//
// quasar.setup()

beforeAll(async () => {
  const config = useConfig()
})

beforeEach(async () => {
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
