/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BUILD_MODE: 'local' | 'remote'
  readonly VITE_APP_BASE_PATH: string

  readonly VITE_APP_API_PROTOCOL: 'http' | 'https'
  readonly VITE_APP_API_HOST: string
  readonly VITE_APP_API_PORT: number
  readonly VITE_APP_API_BASE_PATH: string

  readonly VITE_APP_DEV_SERVER_PORT: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import type { Constants, Screen } from '@/base'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $constants: Constants
    $screen: Screen
  }
}
