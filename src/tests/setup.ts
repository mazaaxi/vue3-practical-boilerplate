import { afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { AppConfig } from '@/base'
import { AppI18n } from '@/i18n'
import { clearServiceDependencies } from './helpers'
import { config } from '@vue/test-utils'

beforeAll(async () => {})

beforeEach(async () => {
  AppConfig.setup()
  const i18n = AppI18n.setup()
  config.global.plugins = [i18n]
})

afterEach(() => {
  clearServiceDependencies()
  vi.clearAllMocks()
})
