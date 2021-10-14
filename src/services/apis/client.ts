import axios, { AxiosError, AxiosResponse, Method, ResponseType } from 'axios'
import { extensionMethod } from '@/base'
import { removeBothEndsSlash } from 'js-common-lib'
import { useConfig } from '@/config'

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
  isAuth?: boolean
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
    return newRawInstance(apiPrefix)
  }

  export function newRawInstance(apiPrefix?: string) {
    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const request = extensionMethod<APIClient['request']>(async config => {
      const appConfig = useConfig()

      const axiosConfig = {
        ...config,
        baseURL: `${removeBothEndsSlash(appConfig.api.baseURL)}/${apiPrefix || ''}`,
      }
      delete axiosConfig.isAuth

      if (config.isAuth) {
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
    //  この関数の戻り値はHTTPヘッダーの"Authorization: Bearer ..."の「...」で使用されます。
    //  この関数は疑似的に「...」の値を取得していますが、実際のアプリケーションではこの関数
    //  を利用するかを含め、実装を検討してください。
    async function getIdToken(): Promise<string> {
      const idToken = localStorage.getItem('idToken')
      if (!idToken) {
        throw new Error(`The 'idToken' could not be obtained. You may not have signed in.`)
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

export { APIClient, APIPromise, APIRequestConfig, APIResponse }