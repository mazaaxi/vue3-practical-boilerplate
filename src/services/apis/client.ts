import type { AxiosError, AxiosResponse, Method, ResponseType } from 'axios'
import { extensibleMethod, removeBothEndsSlash } from 'js-common-lib'
import axios from 'axios'
import { useConfig } from '@/base'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface APIClient {
  request<T = any>(config: APIRequestInternalConfig): APIPromise<T>
  get<T = any>(path: string, config?: APIRequestConfig): APIPromise<T>
  post<T = any>(path: string, data?: any, config?: APIRequestConfig): APIPromise<T>
  put<T = any>(path: string, data?: any, config?: APIRequestConfig): APIPromise<T>
  delete<T = any>(path: string, config?: APIRequestConfig): APIPromise<T>
}

interface APIRequestConfig {
  headers?: any
  params?: any
  paramsSerializer?: (params: any) => string
  responseType?: ResponseType
  shouldAuth?: boolean
}

interface APIResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: any
  config: APIRequestConfig
  request?: any
}

type APIPromise<T = any> = Promise<APIResponse<T>>

interface APIRequestInternalConfig extends APIRequestConfig {
  url?: string
  method: Method
  data?: any
}

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
      const appConfig = useConfig()

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

    const post: APIClient['post'] = (path, data, config) => {
      return request({
        ...(config || {}),
        url: path,
        method: 'post',
        data,
      })
    }

    const put: APIClient['put'] = (path, data, config) => {
      return request({
        ...(config || {}),
        url: path,
        method: 'put',
        data,
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
    //  The return value of this function is [token], which is used in the "Authorization: Bearer
    //  [token]" HTTP header. This function gets the value of [token] pseudo-optimally, but please
    //  consider the implementation, including whether you will use this function in your actual
    //  application.
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
export type { APIPromise, APIRequestConfig, APIResponse }
