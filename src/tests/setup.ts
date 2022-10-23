import { afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { clearServiceDependencies } from './helpers'
import { setupConfig } from '@/config'

beforeAll(async () => {})

beforeEach(async () => {
  setupConfig()
})

afterEach(() => {
  clearServiceDependencies()
  vi.clearAllMocks()
})
