import { isImplemented, removeStartSlash } from 'js-common-lib'
import URI from 'urijs'
import { reactive } from 'vue'

//==========================================================================
//
//  Definition
//
//==========================================================================

interface AppConfig {
  readonly env: {
    buildMode: BuildMode
  }
  readonly api: {
    protocol: string
    host: string
    port: number
    basePath: string
    baseURL: string
  }
}

type EnvConfig = AppConfig['env']

type APIConfig = AppConfig['api']

type BuildMode = 'remote' | 'local'

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AppConfig {
  let instance: AppConfig

  export function setup(): ReturnType<typeof newInstance> {
    instance = newInstance()
    return instance
  }

  export function use(): AppConfig {
    return instance
  }

  function newInstance(): AppConfig {
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const state = reactive({
      env: <EnvConfig>{
        buildMode: import.meta.env.VITE_APP_BUILD_MODE,
      },

      api: getAPIConfig({
        protocol: String(import.meta.env.VITE_APP_API_PROTOCOL),
        host: String(import.meta.env.VITE_APP_API_HOST),
        port: Number(import.meta.env.VITE_APP_API_PORT),
        basePath: String(import.meta.env.VITE_APP_API_BASE_PATH),
      }),
    })

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function getAPIConfig(apiConfig: Omit<APIConfig, 'baseURL'>): APIConfig {
      const uri = new URI()
      if (apiConfig.protocol) uri.protocol(apiConfig.protocol)
      if (apiConfig.host) uri.hostname(apiConfig.host)
      if (apiConfig.port) uri.port(apiConfig.port.toString(10))
      if (apiConfig.basePath) uri.path(apiConfig.basePath)
      uri.query('')

      const protocol = uri.protocol()
      const host = uri.hostname()
      const port = parseInt(uri.port())
      const basePath = uri.path()
      const baseURL = `${protocol}://${host}:${port}/${removeStartSlash(basePath)}`
      return { protocol, host, port, basePath, baseURL }
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      env: state.env,
      api: state.api,
    }

    return isImplemented<AppConfig, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AppConfig }
export type { APIConfig }
