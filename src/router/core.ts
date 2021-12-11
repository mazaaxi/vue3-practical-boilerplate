import { ComputedRef, Ref, computed, ref } from 'vue'
import { Key, compile, pathToRegexp } from 'path-to-regexp'
import { LocationQuery, LocationQueryValue, RouteLocationNormalized, RouteParams, RouteRecordRedirectOption, Router } from 'vue-router'
import { isImplemented, removeEndSlash } from 'js-common-lib'
import { extensionMethod } from '@/base'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface VueRoute extends Omit<RouteLocationNormalized, 'matched'> {}

interface Route {
  /**
   * A base path of the route.
   * e.g. /app.admin/ja/article/list
   */
  readonly basePath: string
  /**
   * A path of the route.
   * e.g. /app.admin/ja/article/list/1234567890
   */
  readonly path: string
  /**
   * A full path of the route.
   * e.g. /app.admin/ja/article/list/1234567890?page=3
   */
  readonly fullPath: string
  /**
   * A hash for in-page a link.
   */
  readonly hash: string
  /**
   * A URL query.
   * e.g. /app.admin/ja/article/list/1234567890?page=3
   *      The part of the URL after the "?" of this URL is the URL query.
   */
  readonly query: LocationQuery
  /**
   * A query parameters.<br>
   * e.g.
   *  - query pattern: /user/:username/post/:post_id
   *  - matched query: /user/evan/post/123
   *  - query parameters: { username: 'evan', post_id: '123' }
   */
  readonly params: RouteParams
  /**
   * A flag indicating whether the current route is itself.
   */
  readonly isCurrent: boolean
  /**
   * This flag indicates whether the history is currently being moved.
   */
  readonly isHistoryMoving: boolean
  /**
   * This flag indicates whether a history move has performed.
   */
  readonly hasHistoryMoved: boolean
}

interface RawRoute
  extends Omit<
    Route,
    'basePath' | 'path' | 'fullPath' | 'hash' | 'query' | 'params' | 'status' | 'isCurrent' | 'isHistoryMoving' | 'hasHistoryMoved'
  > {
  readonly basePath: Ref<string>
  readonly path: Ref<string>
  readonly fullPath: Ref<string>
  readonly hash: Ref<string>
  readonly query: Ref<LocationQuery>
  readonly params: Ref<RouteParams>
  readonly isCurrent: Ref<boolean>
  readonly isHistoryMoving: Ref<boolean>
  readonly hasHistoryMoved: Ref<boolean>
  /**
   * Converts itself to the Vue Router configuration format.
   */
  toRouteConfig(): RouteConfig | RouteConfig[]
  /**
   * Updates its own status based on the information passed to it.
   */
  updateByFlow(to: VueRoute, from: VueRoute): Promise<void>
  /**
   * Updates the state based on the specified route.
   */
  update(route: VueRoute): Promise<void>
  /**
   * Refresh the current route. If itself is not the current route, nothing will be done.
   * This function is executed when the language is switched, and is used to reflect the switched language in the URL.
   */
  refresh(router: Router): Promise<void>
}

interface RouteConfig {
  path: string
  component: any
  redirect?: RouteRecordRedirectOption
}

interface RouteInput {
  routePath?: string
  component?: any
  redirect?: RouteRecordRedirectOption
  isHistoryMoving: ComputedRef<boolean>
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace Route {
  export function newRawInstance(input: RouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const baseRoutePath = ref(input.routePath ?? '')
    const routePath = ref(input.routePath ?? '')
    const component = ref(input.component)
    const redirect = ref(input.redirect) as Ref<RouteRecordRedirectOption | undefined>

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const basePath = ref('')
    const path = ref('')
    const fullPath = ref('')
    const hash = ref('')
    const query = ref<LocationQuery>({})
    const params = ref<RouteParams>({})
    const isCurrent = ref(false)
    const isHistoryMoving = input.isHistoryMoving

    const _hasHistoryMoved = ref(false)
    const hasHistoryMoved = computed(() => isCurrent.value && _hasHistoryMoved.value)

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    const toRouteConfig = extensionMethod<RawRoute['toRouteConfig']>(() => {
      return { path: baseRoutePath.value, component: component.value, redirect: redirect.value }
    })

    const updateByFlow = extensionMethod<RawRoute['updateByFlow']>(async (to, from) => {
      await update(to)
    })

    const update = extensionMethod<RawRoute['update']>(async route => {
      // set the flag indicating whether a history move has been performed
      // Note: if it is currently in the process of history move, it means
      // "history move has been performed"
      _hasHistoryMoved.value = isHistoryMoving.value

      // determine if itself is a current root
      isCurrent.value = getIsCurrent(route)
      // reconfigure its own base path
      basePath.value = getBasePath(route)

      // reconfigure its own path
      // NOTE: Reconfigure a path if itself is the current root or if the base root path and a root
      // path are the same. Otherwise, reconfigure a path will result in an incomplete path.
      if (isCurrent.value || baseRoutePath.value === routePath.value) {
        path.value = getPath(route)
        fullPath.value = getFullPath(route)
      } else {
        path.value = ''
        fullPath.value = ''
      }

      // Setting properties other than the above
      hash.value = route.hash
      query.value = route.query
      params.value = route.params
    })

    const refresh = extensionMethod<RawRoute['refresh']>(async router => {
      // if there is no change in the path, do nothing and exit
      const currentPath = removeEndSlash(router.currentRoute.value.fullPath)
      const nextPath = toPath({
        routePath: routePath.value,
        params: router.currentRoute.value.params,
        query: router.currentRoute.value.query,
        hash: router.currentRoute.value.hash,
      })
      if (currentPath === nextPath) return

      // push the new path to the router
      await router.push(nextPath)
    })

    const getBasePath = extensionMethod((route: VueRoute) => {
      return toPath({ routePath: baseRoutePath.value, params: route.params })
    })

    const getPath = extensionMethod((route: VueRoute) => {
      return toPath({ routePath: routePath.value, params: route.params })
    })

    const getFullPath = extensionMethod((route: VueRoute) => {
      return toPath({ routePath: routePath.value, params: route.params, query: route.query, hash: route.hash })
    })

    const getIsCurrent = extensionMethod((route: VueRoute) => {
      const regexp = pathToRegexp(routePath.value)
      return regexp.test(route.path)
    })

    const toPath = extensionMethod((input: { routePath: string; params: RouteParams; query?: LocationQuery; hash?: string }) => {
      const { routePath, params, query, hash } = input

      const keys: Key[] = []
      pathToRegexp(routePath, keys)
      let result = compile(routePath)(params)

      if (query) {
        Object.keys(query).forEach((key, index) => {
          const rawValue = query[key]
          let value: string | LocationQueryValue[] | null = ''
          if (Array.isArray(rawValue)) {
          } else {
            value = rawValue
          }
          index === 0 ? (result += '?') : (result += '&')
          result += `${key}=${value}`
        })
      }

      hash && (result += hash)

      return result
    })

    const clear = extensionMethod(() => {
      basePath.value = ''
      path.value = ''
      fullPath.value = ''
      hash.value = ''
      query.value = {}
      params.value = {}
      isCurrent.value = false
      _hasHistoryMoved.value = false
    })

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      baseRoutePath,
      routePath,
      component,
      basePath,
      path,
      fullPath,
      hash,
      query,
      params,
      isCurrent,
      isHistoryMoving,
      hasHistoryMoved,
      toRouteConfig,
      updateByFlow,
      update,
      refresh,
      getBasePath,
      getPath,
      getFullPath,
      getIsCurrent,
      toPath,
      clear,
    }

    return isImplemented<RawRoute, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { RawRoute, Route, RouteInput }
