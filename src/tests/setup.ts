import { afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { clearServiceDependencies } from './helpers'
import { config } from '@vue/test-utils'
import { setupConfig } from '@/config'
import { setupI18n } from '@/i18n'

beforeAll(async () => {})

beforeEach(async () => {
  setupConfig()
  const i18n = setupI18n()
  config.global.plugins = [i18n]
})

afterEach(() => {
  clearServiceDependencies()
  vi.clearAllMocks()
})
