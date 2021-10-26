import { DeepPartial, removeStartSlash } from 'js-common-lib'
import URI from 'urijs'
import merge from 'lodash/merge'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface Config {
  readonly env: EnvConfig
  readonly api: APIConfig
}

interface EnvConfig {
  executeMode: ExecuteMode
}

type ExecuteMode = 'remote' | 'local' | 'test'

interface APIConfig {
  protocol: string
  host: string
  port: number
  basePath: string
  baseURL: string
}

interface CreateConfigParams {
  api?: DeepPartial<Omit<APIConfig, 'baseURL'>>
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace Config {
  let instance: Config

  export function setupConfig(params: CreateConfigParams = {}): Config {
    instance = merge(newInstance(), params.api)
    return instance
  }

  export function useConfig(params: CreateConfigParams = {}): Config {
    return instance
  }

  function newInstance(): Config {
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const state = reactive({
      env: <EnvConfig>{
        executeMode: process.env.NODE_ENV === 'production' ? 'remote' : process.env.NODE_ENV === 'test' ? 'test' : 'local',
      },

      api: getAPIConfig({
        protocol: String(process.env.VUE_APP_API_PROTOCOL),
        host: String(process.env.VUE_APP_API_HOST),
        port: Number(process.env.VUE_APP_API_PORT),
        basePath: String(process.env.VUE_APP_API_BASE_PATH),
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

    return {
      env: state.env,
      api: state.api,
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupConfig, useConfig } = Config
export { APIConfig, Config, setupConfig, useConfig }
