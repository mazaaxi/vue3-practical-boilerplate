import { Key, compile, pathToRegexp } from 'path-to-regexp'
import { LocationQuery, LocationQueryValue, RouteLocationNormalized, RouteParams, RouteRecordRedirectOption, Router } from 'vue-router'
import { Ref, nextTick, ref } from 'vue'
import { Unsubscribe } from 'nanoevents'
import { extensionMethod } from '@/base'
import { removeEndSlash } from 'js-common-lib'

//========================================================================
//
//  Interfaces
//
//========================================================================

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
   * A status of the route.
   */
  readonly status: FlowStatus
  /**
   * A flag indicating whether the current route is itself.
   */
  readonly isCurrent: boolean
  /**
   * This flag indicates whether a history move has performed.
   */
  readonly historyMove: boolean
  /**
   * This is a navigation guard when the path below the base path is changed.
   * If you don't want to transition to the next, return `false` as the return value.
   */
  onBeforeRouteUpdate(guard: NavigationGuardChecker): Unsubscribe
  /**
   * This is a navigation guard when you change from the base path to another route.
   * If you don't want to transition to the next, return `false` as the return value.
   */
  onBeforeRouteLeave(guard: NavigationGuardChecker): Unsubscribe
  /**
   * Registers a callback after a path lower than the base path is changed.
   */
  onAfterRouteUpdate(cb: NavigationAfterCallback, options?: { immediate?: boolean }): Unsubscribe
  /**
   * Registers a callback when a route is changed from the base path to another route.
   * @param cb
   */
  onAfterRouteLeave(cb: NavigationAfterCallback): Unsubscribe
}

interface RouteConfig {
  path: string
  component: any
  redirect?: RouteRecordRedirectOption
}

interface RawRoute<EXTRA extends { historyMove?: boolean } = { historyMove?: boolean }>
  extends Omit<Route, 'basePath' | 'path' | 'fullPath' | 'hash' | 'query' | 'params' | 'status' | 'isCurrent' | 'historyMove'> {
  readonly basePath: Ref<string>
  readonly path: Ref<string>
  readonly fullPath: Ref<string>
  readonly hash: Ref<string>
  readonly query: Ref<LocationQuery>
  readonly params: Ref<RouteParams>
  readonly status: Ref<FlowStatus>
  readonly isCurrent: Ref<boolean>
  readonly historyMove: Ref<boolean>
  /**
   * Converts itself to the Vue Router configuration format.
   */
  toRouteConfig(): RouteConfig | RouteConfig[]
  /**
   * Checks if the route can proceed to the next route.
   */
  proceed(to: VueRoute, from: VueRoute): Promise<boolean>
  /**
   * Updates its own status based on the information passed to it.
   */
  update(to: VueRoute, from: VueRoute, extra?: EXTRA): Promise<void>
  /**
   * Perform post-processing of route movement.
   */
  after(to: VueRoute, from: VueRoute): void
  /**
   * Refresh the current route. If itself is not the current route, nothing will be done.
   * This function is executed when the language is switched, and is used to reflect the switched language in the URL.
   */
  refresh(router: Router, extra?: { historyMove?: boolean }): Promise<void>
  /**
   * Updates the state based on the specified route.
   */
  updateState(to: VueRoute, extra?: EXTRA): Promise<void>
}

type NavigationGuardChecker = (to: VueRoute, from: VueRoute) => Promise<void | boolean>

type NavigationAfterCallback = (to: VueRoute, from: VueRoute) => any

type FlowStatus = 'None' | 'Enter' | 'Update' | 'Leave'

interface RouteInput {
  routePath?: string
  component?: any
  redirect?: RouteRecordRedirectOption
}

//========================================================================
//
//  Implementation
//
//========================================================================

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
    const currentRoute = ref<VueRoute>()
    const beforeUpdateListeners: NavigationGuardChecker[] = []
    const beforeLeaveListeners: NavigationGuardChecker[] = []
    const afterUpdateListeners: NavigationAfterCallback[] = []
    const afterLeaveListeners: NavigationAfterCallback[] = []

    const navigating: { to: VueRoute; from: VueRoute } = {} as any

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
    const status = ref<FlowStatus>('None')
    const isCurrent = ref(false)
    const historyMove = ref(false)

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const onBeforeRouteUpdate: Route['onBeforeRouteUpdate'] = guard => {
      beforeUpdateListeners.push(guard)
      return () => {
        const index = beforeUpdateListeners.indexOf(guard)
        index >= 0 && beforeUpdateListeners.splice(index, 1)
      }
    }

    const onBeforeRouteLeave: Route['onBeforeRouteLeave'] = guard => {
      beforeLeaveListeners.push(guard)
      return () => {
        const index = beforeLeaveListeners.indexOf(guard)
        index >= 0 && beforeLeaveListeners.splice(index, 1)
      }
    }

    const onAfterRouteUpdate: Route['onAfterRouteUpdate'] = (cb, options = { immediate: true }) => {
      afterUpdateListeners.push(cb)

      // if `options.immediate` is `true` and itself is the current root
      if (options?.immediate && isCurrent.value) {
        // When the callback is about to be registered, it waits for a while before executing the callback.
        // This is because it takes into account the time it takes for the calling component to complete
        // its preparation.
        nextTick(() => {
          cb(navigating.to, navigating.from)
        })
      }

      return () => {
        const index = afterUpdateListeners.indexOf(cb)
        index >= 0 && afterUpdateListeners.splice(index, 1)
      }
    }

    const onAfterRouteLeave: Route['onAfterRouteLeave'] = cb => {
      afterLeaveListeners.push(cb)
      return () => {
        const index = afterLeaveListeners.indexOf(cb)
        index >= 0 && afterLeaveListeners.splice(index, 1)
      }
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    const toRouteConfig = extensionMethod<RawRoute['toRouteConfig']>(() => {
      return { path: baseRoutePath.value, component: component.value, redirect: redirect.value }
    })

    const proceed = extensionMethod<RawRoute['proceed']>(async (to, from) => {
      Object.assign(navigating, { to, from })
      const toIsCurrent = getIsCurrent(to)
      const fromIsCurrent = getIsCurrent(from)

      // the next route is itself
      if (toIsCurrent) {
        // next route and previous route are the same
        if (toIsCurrent === fromIsCurrent) {
          status.value = 'Update'
        }
        // next route and previous route are not the same
        else {
          status.value = 'Enter'
        }
      }
      // the next route is not itself
      else {
        // the previous route is itself
        if (fromIsCurrent) {
          status.value = 'Leave'
        }
        // the previous route is not itself
        else {
          status.value = 'None'
        }
      }

      if (status.value === 'Update') {
        // notifies listeners subscribed to itself that itself will be updated
        for (const listener of beforeUpdateListeners) {
          const ret = await listener(to, from)
          if (ret === false) return false
        }
      } else if (status.value === 'Leave') {
        // notifies listeners subscribed to itself that itself is leaving a current route
        for (const listener of beforeLeaveListeners) {
          const ret = await listener(to, from)
          if (ret === false) return false
        }
      }

      return true
    })

    const update = extensionMethod<RawRoute['update']>(async (to, from, extra) => {
      Object.assign(navigating, { to, from })
      await updateState(to, extra)
    })

    const after = extensionMethod<RawRoute['after']>((to, from) => {
      Object.assign(navigating, { to, from })

      if (status.value === 'Update') {
        // notifies listeners subscribed to itself that itself has updated
        for (const listener of afterUpdateListeners) {
          listener(to, from)
        }
      } else if (status.value === 'Leave') {
        // notifies listeners subscribed to itself that itself has left a current route
        for (const listener of afterLeaveListeners) {
          listener(to, from)
        }
      }
    })

    const updateState = extensionMethod<RawRoute['updateState']>(async (to, extra) => {
      // save a current route
      // NOTE: Just because save a current route doesn't mean itself is a current root.
      currentRoute.value = to
      // determine if itself is a current root
      isCurrent.value = getIsCurrent(to)
      // reconfigure its own base path
      basePath.value = getBasePath(to)
      // reconfigure its own path
      // NOTE: Reconfigure a path if itself is the current root or if the base root path and a root
      // path are the same. Otherwise, reconfigure a path will result in an incomplete path.
      if (isCurrent.value || baseRoutePath.value === routePath.value) {
        path.value = getPath(to)
      } else {
        path.value = ''
      }
      // get a full path
      if (to.query) {
        const queryString = to.fullPath.replace(to.path, '')
        fullPath.value = `${path.value}${queryString}`
      } else {
        fullPath.value = path.value
      }

      // Setting properties other than the above
      hash.value = to.hash
      query.value = to.query
      params.value = to.params
      if (typeof extra?.historyMove === 'boolean') {
        historyMove.value = extra.historyMove
      }
    })

    const refresh: RawRoute['refresh'] = async (router, extra) => {
      // update its own route state
      await updateState(router.currentRoute.value, extra)

      // if itself is not a current route, exit
      if (!isCurrent.value) return

      // if there is no change in the path, do nothing and exit
      const currentPath = removeEndSlash(router.currentRoute.value.path)
      const nextPath = toPath(routePath.value, router.currentRoute.value.params, router.currentRoute.value.query)
      if (currentPath === nextPath) return

      // add the new path to the router
      await router.push(nextPath)
    }

    const getBasePath = extensionMethod((route: VueRoute) => {
      return toPath(baseRoutePath.value, route.params)
    })

    const getPath = extensionMethod((route: VueRoute) => {
      return toPath(routePath.value, route.params)
    })

    const getIsCurrent = extensionMethod((route: VueRoute) => {
      const regexp = pathToRegexp(routePath.value)
      return regexp.test(route.path)
    })

    const toPath = extensionMethod((routePath: string, params: RouteParams, query?: LocationQuery) => {
      const keys: Key[] = []
      pathToRegexp(routePath, keys)
      let result = compile(routePath, { encode: encodeURIComponent })(params)

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

      return result
    })

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      ...(<RawRoute>{
        basePath,
        path,
        fullPath,
        hash,
        query,
        params,
        status,
        isCurrent,
        historyMove,
        onBeforeRouteUpdate,
        onBeforeRouteLeave,
        onAfterRouteUpdate,
        onAfterRouteLeave,
        toRouteConfig,
        proceed,
        update,
        after,
        refresh,
        updateState,
      }),
      baseRoutePath,
      routePath,
      component,
      currentRoute,
      toRouteConfig,
      proceed,
      update,
      after,
      updateState,
      getBasePath,
      getPath,
      getIsCurrent,
      toPath,
    }
  }
}

//========================================================================
//
//  Exports
//
//========================================================================

export { FlowStatus, RawRoute, Route, RouteInput, NavigationGuardChecker }
