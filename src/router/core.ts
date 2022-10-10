import { ComputedRef, Ref, computed, reactive, ref, watch } from 'vue'
import { Key, compile, pathToRegexp } from 'path-to-regexp'
import {
  LocationQuery,
  LocationQueryValue,
  NavigationGuardNext,
  RouteParams,
  RouteRecordRedirectOption,
  RouteLocationNormalized as VueRoute,
  Router as VueRouter,
  createRouter,
  createWebHistory,
} from 'vue-router'
import { isImplemented, pickProps, removeEndSlash, sleep } from 'js-common-lib'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { extensionMethod } from '@/base'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

//--------------------------------------------------
//  Router
//--------------------------------------------------

type Router<ROUTES> = UnwrapNestedRefs<WrapRouter<ROUTES>>

interface WrapRouter<ROUTES> extends Omit<VueRouter, 'currentRoute'> {
  routes: ROUTES
  currentRoute: Ref<CurrentRoute>
}

interface RouterInput<ROUTES> {
  // Specifies the structure of the `Route` object.<br>
  // e.g.
  // ```
  // {
  //   home: // specify `HomeRoute` instance
  //   shop: // specify `ShopRoute` instance
  //   examples: // specify `ExamplesRoute` instance
  // }
  // ```
  routes: ROUTES
  /**
   * Specify an array of flattened `routes`.<br>
   * e.g.
   * ```
   * [
   *   home,
   *   shop,
   *   examples.abc,
   *   examples.miniatureProject,
   * ]
   * ```
   */
  flattenRoutes: RawRoute[]
  /**
   * If this function is specified, it is executed before route update.
   * @param self Self router is passed on.
   * @param to The next route is passed.
   * @param from The previous route is passed.
   * @param next Navigation guard is passed.
   *   https://v3.router.vuejs.org/guide/advanced/navigation-guards.html
   * @return
   *   Returns true if you want to perform subsequent processing of `beforeRouteUpdate`,
   *   false otherwise.
   */
  beforeRouteUpdate?: (self: WrapRouter<ROUTES>, to: VueRoute, from: VueRoute, next: NavigationGuardNext) => Promise<boolean>
}

//--------------------------------------------------
//  Route
//--------------------------------------------------

type Route = UnwrapNestedRefs<WrapRoute>

interface WrapRoute<MOVE_PARAMS extends any | void = void> {
  /**
   * A base path of a route.
   * e.g. /ja/articles
   */
  readonly basePath: Ref<string>
  /**
   * A path of a route.
   * e.g. /ja/articles/1234567890
   */
  readonly path: Ref<string>
  /**
   * A full path of a route.
   * e.g. /ja/articles/1234567890?page=3
   */
  readonly fullPath: Ref<string>
  /**
   * A hash for in-page a link.
   */
  readonly hash: Ref<string>
  /**
   * A URL query.
   * e.g. /ja/articles/1234567890?page=3
   *      The part of the URL after the "?" of this URL is the URL query.
   */
  readonly query: Ref<LocationQuery>
  /**
   * A query parameters.<br>
   * e.g.
   *  - query pattern: /users/:userName/posts/:postId
   *  - matched query: /users/john/posts/123
   *  - query parameters: { userName: 'evan', postId: '123' }
   */
  readonly params: Ref<RouteParams>
  /**
   * This flag indicating whether a current route is itself.
   */
  readonly isCurrent: Ref<boolean>
  /**
   * This flag indicates whether a history is currently being moved.
   */
  readonly isHistoryMoving: Ref<boolean>
  /**
   * This flag indicates whether a history move has performed.
   */
  readonly hasHistoryMoved: Ref<boolean>
  /**
   * Moves to itself route.
   */
  move(params: MOVE_PARAMS): Promise<void>
  /**
   * Generates a path to move to itself route.
   */
  toMovePath(params: MOVE_PARAMS): string
}

interface RawRoute<MOVE_PARAMS extends any | void = void> extends WrapRoute<MOVE_PARAMS> {
  /**
   * Router instance.
   */
  router: { value: WrapRouter<unknown> }
  /**
   * Initializes itself route object.
   */
  init(params: { router: WrapRouter<unknown>; isHistoryMoving: Ref<boolean> }): void
  /**
   * Converts itself to the Vue Router configuration format.
   */
  toConfig(): RouteConfig
  /**
   * Updates itself state based on the specified route. This method is called before the route
   * is moved by routing.
   */
  update(route: VueRoute): Promise<void>
  /**
   * Refresh the current route. If itself is not the current route, nothing will be done. This
   * method should be called when the state (e.g., language) embedded in the path of itself root
   * has changed.
   */
  refresh(): Promise<void>
  /**
   * Generates a path based on the specified parameters.
   */
  toPath(input: { routePath: string; params?: RouteParams; query?: LocationQuery; hash?: string }): string
  /**
   * Clears the state of itself route.
   */
  clear(): void
}

type CurrentRoute = Omit<Route, 'move' | 'toMovePath'>

interface RouteConfig {
  path: string
  component: any
  redirect?: RouteRecordRedirectOption
}

interface RouteInput {
  routePath?: string
  component?: any
  redirect?: RouteRecordRedirectOption
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace Router {
  export function newWrapInstance<ROUTES>(input: RouterInput<ROUTES>) {
    const { routes, flattenRoutes, beforeRouteUpdate } = input

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const isHistoryMoving = ref(false)

    // The registration of `window.popstate` event should be done before the creation of `vueRouter`.
    // This way, `window.popstate` will be fired before `vueRouter.beforeEach`.
    // On the other hand, if you register the `window.popstate` event after the creation of
    // `vueRouter`, `window.popstate` will be fired after `vueRouter.afterEach`.
    window.addEventListener('popstate', e => {
      isHistoryMoving.value = true
    })

    const vueRouter = createRouter({
      history: createWebHistory(),
      routes: flattenRoutes.map(item => item.toConfig()),
    })

    const currentRoute: Ref<CurrentRoute> = ref({
      basePath: '',
      path: '',
      fullPath: '',
      hash: '',
      query: {},
      params: {},
      isCurrent: false,
      isHistoryMoving: false,
      hasHistoryMoved: false,
    })

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function updateCurrentRoute(): void {
      const newCurrentRoute = flattenRoutes.find(route => route.isCurrent.value)
      if (!newCurrentRoute) return

      currentRoute.value = reactive({
        ...pickProps(newCurrentRoute, ['basePath', 'path', 'fullPath', 'hash', 'query', 'params', 'isCurrent', 'hasHistoryMoved']),
        isHistoryMoving,
      })
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    vueRouter.beforeEach(async (to, from, next) => {
      // if `beforeRouteUpdate` is specified, it is executed before route update
      if (beforeRouteUpdate) {
        const shouldNext = await beforeRouteUpdate(result, to, from, next)
        if (!shouldNext) return
      }

      // update each route object
      await Promise.all(flattenRoutes.map(route => route.update(to)))

      next()
    })

    vueRouter.afterEach(async (to, from, failure) => {
      isHistoryMoving.value = false

      if (failure) {
        // update each route object in the previous route
        await Promise.all(flattenRoutes.map(route => route.update(from)))

        updateCurrentRoute()

        // If the routing fails in a history move, the `window.popstate` event will be fired.
        // If this happens, `isHistoryMoving`, which was turned off above, will be turned on
        // unintentionally. For this reason, we wait for a certain amount of time before
        // turning off `isHistoryMoving`.
        await sleep(100).then(() => {
          isHistoryMoving.value = false
        })
      } else {
        updateCurrentRoute()
      }
    })

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const { currentRoute: _, ...extractedVueRouter } = vueRouter

    const result = {
      ...extractedVueRouter,
      routes,
      currentRoute,
    }

    // routes are initialized here because an instance of the router needs to be passed
    flattenRoutes.forEach(route => {
      route.init({ router: result, isHistoryMoving })
    })

    return isImplemented<WrapRouter<ROUTES>, typeof result>(result)
  }
}

namespace Route {
  export function newWrapInstance(input: RouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const state = reactive({
      isHistoryMoving: false,
    })

    let _router: WrapRouter<unknown>
    const router = {
      get value() {
        return _router
      },
    }

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
    const isHistoryMoving = computed(() => state.isHistoryMoving)

    const _hasHistoryMoved = ref(false)
    const hasHistoryMoved = computed(() => isCurrent.value && _hasHistoryMoved.value)

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const move = extensionMethod<RawRoute<any>['move']>(async () => {
      const nextPath = toMovePath(undefined)
      await router.value.push(nextPath)
    })

    const toMovePath = extensionMethod<RawRoute<any>['toMovePath']>(() => {
      return toPath({
        routePath: routePath.value,
      })
    })

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    const init = extensionMethod<RawRoute['init']>(params => {
      _router = params.router as any
      // when assigning a `ref` to a reactive property,
      // that `ref` will also be automatically unwrapped
      // https://vuejs.org/api/reactivity-core.html#reactive
      state.isHistoryMoving = params.isHistoryMoving as any
    })

    const toConfig = extensionMethod<RawRoute['toConfig']>(() => {
      return { path: baseRoutePath.value, component: component.value, redirect: redirect.value }
    })

    const update = extensionMethod<RawRoute['update']>(async route => {
      // set the flag indicating whether a history move has been performed
      // Note: if it is currently in the process of history move, it means
      // "history move has been performed"
      _hasHistoryMoved.value = isHistoryMoving.value

      // determine if itself is a current route
      isCurrent.value = getIsCurrent(route)
      // reconfigure its own base path
      basePath.value = getBasePath(route)

      // reconfigure its own path
      // NOTE: Reconfigure a path if itself is the current route or if the base route path and
      // a route path are the same. Otherwise, reconfiguring a path will result in an incomplete path.
      if (isCurrent.value || baseRoutePath.value === routePath.value) {
        path.value = getPath(route)
        fullPath.value = getFullPath(route)
      } else {
        path.value = ''
        fullPath.value = ''
      }

      // set properties other than the above
      hash.value = route.hash
      query.value = route.query
      params.value = route.params
    })

    const refresh = extensionMethod<RawRoute['refresh']>(async () => {
      // if there is no change in the path, do nothing and exit
      const currentPath = removeEndSlash(router.value.currentRoute.value.fullPath)
      const nextPath = toPath({
        routePath: routePath.value,
        params: router.value.currentRoute.value.params,
        query: router.value.currentRoute.value.query,
        hash: router.value.currentRoute.value.hash,
      })
      if (currentPath === nextPath) return

      // push the new path to the router
      await router.value.push(nextPath)
    })

    const toPath = extensionMethod<RawRoute['toPath']>(input => {
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

    const clear = extensionMethod<RawRoute['clear']>(() => {
      basePath.value = ''
      path.value = ''
      fullPath.value = ''
      hash.value = ''
      query.value = {}
      params.value = {}
      isCurrent.value = false
      _hasHistoryMoved.value = false
    })

    function getBasePath(route: VueRoute): string {
      return toPath({ routePath: baseRoutePath.value, params: route.params })
    }

    function getPath(route: VueRoute): string {
      return toPath({ routePath: routePath.value, params: route.params })
    }

    function getFullPath(route: VueRoute): string {
      return toPath({ routePath: routePath.value, params: route.params, query: route.query, hash: route.hash })
    }

    function getIsCurrent(route: VueRoute): boolean {
      const regexp = pathToRegexp(routePath.value)
      return regexp.test(route.path)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      router,
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
      move,
      toMovePath,
      init,
      toConfig,
      update,
      refresh,
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

export { Router, WrapRouter, Route, WrapRoute, RawRoute, RouteInput }
