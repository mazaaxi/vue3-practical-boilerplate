import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { extensibleMethod, removeBothEndsSlash } from 'js-common-lib'
import { AppConfig } from '@/base'
import axios from 'axios'

//==========================================================================
//
//  Definition
//
//==========================================================================

interface APIClient {
  request<T = any>(config: APIRequestConfig): Promise<APIResponse<T>>
  get<T = any>(path: string, config?: APIGetConfig): Promise<APIResponse<T>>
  post<T = any>(path: string, config?: APIPostConfig): Promise<APIResponse<T>>
  put<T = any>(path: string, config?: APIPutConfig): Promise<APIResponse<T>>
  delete<T = any>(path: string, config?: APIDeleteConfig): Promise<APIResponse<T>>
}

interface BaseAPIRequestConfig
  extends Pick<AxiosRequestConfig, 'headers' | 'params' | 'paramsSerializer' | 'responseType'> {
  shouldAuth?: boolean
}

type APIRequestConfig = BaseAPIRequestConfig & Pick<AxiosRequestConfig, 'method' | 'url' | 'data'>

type APIGetConfig = BaseAPIRequestConfig

type APIPostConfig = BaseAPIRequestConfig & Pick<AxiosRequestConfig, 'data'>

type APIPutConfig = BaseAPIRequestConfig & Pick<AxiosRequestConfig, 'data'>

type APIDeleteConfig = BaseAPIRequestConfig

type APIResponse<DATA = any, CONFIG = any> = Pick<
  AxiosResponse<DATA, CONFIG>,
  'data' | 'status' | 'statusText' | 'headers' | 'config' | 'request'
>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace APIClient {
  export function newInstance(apiPrefix?: string): APIClient {
    return newWrapInstance(apiPrefix)
  }

  export function newWrapInstance(apiPrefix?: string) {
    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const request = extensibleMethod<APIClient['request']>(async config => {
      const appConfig = AppConfig.use()

      const axiosConfig = {
        ...config,
        baseURL: `${removeBothEndsSlash(appConfig.api.baseURL)}/${apiPrefix || ''}`,
      }
      delete axiosConfig.shouldAuth

      if (config.shouldAuth) {
        const idToken = await getIdToken()
        axiosConfig.headers = {
          ...(axiosConfig.headers || {}),
          Authorization: `Bearer ${idToken}`,
        }
      }

      let response: AxiosResponse<any>
      try {
        response = await axios.request(axiosConfig)
      } catch (err: any) {
        throw new APIError(err)
      }

      return response
    })

    const get: APIClient['get'] = (path, config) => {
      return request({
        ...(config || {}),
        url: path,
        method: 'get',
      })
    }

    const post: APIClient['post'] = (path, config) => {
      return request({
        ...(config || {}),
        url: path,
        method: 'post',
      })
    }

    const put: APIClient['put'] = (path, config) => {
      return request({
        ...(config || {}),
        url: path,
        method: 'put',
      })
    }

    const del: APIClient['delete'] = (path, config) => {
      return request({
        ...(config || {}),
        url: path,
        method: 'delete',
      })
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    // TODO
    //  The return value of this function is [token], which is used in the
    //  "Authorization: Bearer [token]" HTTP header. This function gets the value of
    //  [token] pseudo-optimally, but please consider the implementation, including
    //  whether you will use this function in your actual application.
    async function getIdToken(): Promise<string> {
      const idToken = localStorage.getItem('idToken')
      if (!idToken) {
        throw new Error(`The \`idToken\` could not be obtained. You may not have signed-in.`)
      }
      return idToken
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      request,
      get,
      post,
      put,
      delete: del,
    }
  }
}

class APIError extends Error {
  constructor(detail: AxiosError, message?: string, status?: number) {
    super(message)
    this.detail = detail
    this.status = status
  }

  readonly detail: AxiosError

  readonly status?: number
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { APIClient }
export type {
  APIRequestConfig,
  APIGetConfig,
  APIPostConfig,
  APIPutConfig,
  APIDeleteConfig,
  APIResponse,
}
