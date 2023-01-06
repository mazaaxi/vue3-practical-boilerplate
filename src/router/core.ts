import { type App, type Ref, type UnwrapNestedRefs, computed, reactive, ref } from 'vue'
import type {
  LocationQuery,
  LocationQueryValue,
  NavigationFailure,
  NavigationGuardNext,
  RouteLocationNormalizedLoaded,
  RouteMeta,
  RouteParams,
  RouteRecordName,
  RouteRecordRaw,
  RouteRecordRedirectOption,
  RouteLocationNormalized as VueRoute,
  Router as _VueRouter,
} from 'vue-router'
import { compile, pathToRegexp } from 'path-to-regexp'
import { createRouter, createWebHistory } from 'vue-router'
import { extensibleMethod, isImplemented, removeEndSlash, sleep } from 'js-common-lib'
import type { Key } from 'path-to-regexp'
import type { VuePluginInstall } from '@/base'

//==========================================================================
//
//  Definition
//
//==========================================================================

//--------------------------------------------------
//  VueRouter
//--------------------------------------------------

type VueRouter = _VueRouter

//--------------------------------------------------
//  Router
//--------------------------------------------------

type Router<ROUTES extends Routes = Routes> = UnwrapNestedRefs<
  Omit<WrapRouter, 'routes' | 'allRoutes'>
> & {
  readonly routes: ROUTES & { install: VuePluginInstall }
  readonly allRoutes: Route[]
}

interface WrapRouter<ROUTES extends RawRoutes = RawRoutes>
  extends Omit<VueRouter, 'currentRoute' | 'beforeEach' | 'afterEach'> {
  readonly routes: ROUTES & { install: VuePluginInstall }
  readonly allRoutes: RawRoute[]
  readonly currentRoute: Ref<CurrentRoute>
}

interface RouterInput<ROUTES extends RawRoutes = RawRoutes> {
  /**
   * Specifies the structure of the `RawRoute` object.<br>
   * e.g.
   * ```
   * {
   *   // specify raw `HomeRoute` instance
   *   home: HomeRoute.newWrapInstance(routeInput),
   *   // specify raw `ShopRoute` instance
   *   shop: ShopRoute.newWrapInstance(routeInput),
   *   // specify raw `ExamplesRoute` instance
   *   examples: ExamplesRoutes.newWrapInstance(routeInput),
   * }
   * ```
   */
  routes: ROUTES
  /**
   * Specifies internal routes that cannot be specified with `routes`.
   * It is mainly used to specify a fallback route.
   */
  extraRoutes: RawRoute[]
  /**
   * If this function is specified, it is executed before route update.
   * @param router Router is passed on.
   * @param to The next route is passed.
   * @param from The previous route is passed.
   * @param next Navigation guard is passed.
   *   https://v3.router.vuejs.org/guide/advanced/navigation-guards.html
   * @return
   *   Returns true if you want to perform subsequent processing of `beforeEach`,
   *   false otherwise.
   */
  beforeEach?: (
    self: WrapRouter<ROUTES>,
    to: VueRoute,
    from: VueRoute,
    next: NavigationGuardNext
  ) => Promise<boolean>
  /**
   * If this function is specified, it is executed after route update.
   * @param router Router is passed on.
   * @param to The next route is passed.
   * @param from The previous route is passed.
   * @param failure Navigation error is passed.
   */
  afterEach?: (
    router: WrapRouter<ROUTES>,
    to: VueRoute,
    from: VueRoute,
    failure?: NavigationFailure | void
  ) => Promise<void>
}

type Routes = Record<string, Route>

type RawRoutes = Record<string, RawRoute>

//--------------------------------------------------
//  Route
//--------------------------------------------------

type Route<MOVE_PARAMS extends any | void = unknown> = UnwrapNestedRefs<WrapRoute<MOVE_PARAMS>>

interface WrapRoute<MOVE_PARAMS extends any | void> {
  /**
   * A path for the `VueRouter` configuration.
   * e.g. /:locale/articles/:articlesId
   */
  readonly routePath: Ref<string>
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
   * Child routes.
   */
  readonly children: WrapRoute<unknown>[]
  /**
   * Moves to itself route.
   */
  move(params: MOVE_PARAMS): Promise<void>
  /**
   * Generates a path to move to itself route.
   */
  toMovePath(params: MOVE_PARAMS): string
  /**
   * Get if the specified path matches its own root.
   */
  match(path: string): boolean
}

interface RawRoute<MOVE_PARAMS extends any | void = unknown> extends WrapRoute<MOVE_PARAMS> {
  /**
   * Router instance.
   */
  router: { value: WrapRouter }
  /**
   * Child routes.
   */
  readonly children: RawRoute[]
  /**
   * Initializes itself route object.
   */
  init(params: { router: WrapRouter; isHistoryMoving: Ref<boolean> }): void
  /**
   * Converts itself to the Vue Router configuration format.
   */
  toConfig(): RouteRecordRaw
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
  toPath(input: {
    routePath: string
    params?: RouteParams
    query?: LocationQuery
    hash?: string
  }): string
  /**
   * Clears the state of itself route.
   */
  clear(): void
  /**
   * Get whether the specified `route` matches its own route.
   */
  getIsCurrent(route: VueRoute): boolean
}

type CurrentRoute = RouteLocationNormalizedLoaded &
  Pick<Route, 'isCurrent' | 'isHistoryMoving' | 'hasHistoryMoved' | 'match'>

interface RouteInput {
  routePath?: string
  component?: any
  children?: RawRoute[]
  name?: RouteRecordName
  meta?: RouteMeta
  redirect?: RouteRecordRedirectOption
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace VueRouter {
  let instance: VueRouter

  export function setup(vueRouter: VueRouter): void {
    instance = vueRouter
  }

  export function use(): VueRouter {
    if (!instance) {
      throw new Error(`VueRouter is not initialized. Run \`setup()\` before using \`use()\`.`)
    }
    return instance
  }
}

namespace Router {
  export function newWrapInstance<ROUTES extends RawRoutes = RawRoutes>(
    input: RouterInput<ROUTES>
  ) {
    const { routes, beforeEach, afterEach } = input
    const extraRoutes = input.extraRoutes || []

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const getRecursiveRoutes = (route: RawRoute) => {
      if (!route.children.length) return [route]

      return route.children.reduce<RawRoute[]>(
        (result, childRoute) => {
          result.push(childRoute)
          for (const grandChildRoute of childRoute.children) {
            result.push(...getRecursiveRoutes(grandChildRoute))
          }
          return result
        },
        [route]
      )
    }

    const allRoutes = Object.values(routes).reduce<RawRoute[]>((result, route) => {
      result.push(...getRecursiveRoutes(route))
      return result
    }, [])
    allRoutes.push(...extraRoutes)

    const isHistoryMoving = ref(false)

    // The registration of `window.popstate` event should be done before the creation of `vueRouter`.
    // This way, `window.popstate` will be fired before `vueRouter.beforeEach`.
    // On the other hand, if you register the `window.popstate` event after the creation of
    // `vueRouter`, `window.popstate` will be fired after `vueRouter.afterEach`.
    window.addEventListener('popstate', e => {
      isHistoryMoving.value = true
    })

    VueRouter.setup(
      createRouter({
        history: createWebHistory(),
        routes: [...Object.values(routes), ...extraRoutes].map(route => route.toConfig()),
      })
    )

    const currentRoute = ref<CurrentRoute>({
      path: '',
      fullPath: '',
      hash: '',
      query: {},
      params: {},
      isCurrent: false,
      isHistoryMoving: false,
      hasHistoryMoved: false,
      name: undefined,
      redirectedFrom: undefined,
      meta: {},
      matched: [],
      match: () => false,
    })

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    async function updateAllRoutes(to: VueRoute) {
      await Promise.all(allRoutes.map(route => route.update(to)))
    }

    function updateCurrentRoute(): void {
      const newCurrentRoute = allRoutes.find(route => route.isCurrent.value)
      if (!newCurrentRoute) return

      const orgCurrentRoute = VueRouter.use().currentRoute

      currentRoute.value = {
        path: newCurrentRoute.path.value,
        fullPath: newCurrentRoute.fullPath.value,
        hash: newCurrentRoute.hash.value,
        query: newCurrentRoute.query.value,
        params: newCurrentRoute.params.value,
        isCurrent: newCurrentRoute.isCurrent.value,
        hasHistoryMoved: newCurrentRoute.hasHistoryMoved.value,
        // when assigning a `ref` to a `reactive` property,
        // that `ref` will also be automatically unwrapped
        // https://vuejs.org/api/reactivity-core.html#reactive
        isHistoryMoving: isHistoryMoving as any,
        name: orgCurrentRoute.value.name,
        redirectedFrom: orgCurrentRoute.value.redirectedFrom,
        meta: orgCurrentRoute.value.meta,
        matched: orgCurrentRoute.value.matched,
        match: newCurrentRoute.match,
      }
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    VueRouter.use().beforeEach(async (to, from, next) => {
      if (beforeEach) {
        const shouldNext = await beforeEach(instance, to, from, next)
        if (!shouldNext) return
      }

      // update all route object
      await updateAllRoutes(to)

      next()
    })

    VueRouter.use().afterEach(async (to, from, failure) => {
      isHistoryMoving.value = false

      if (failure) {
        // update all route object in the previous route
        await updateAllRoutes(from)

        updateCurrentRoute()

        // If the routing fails in a history move, `window.popstate` event will be fired.
        // If this happens, `isHistoryMoving`, which was turned off above, will be turned on
        // unintentionally. For this reason, we wait for a certain amount of time before
        // turning off `isHistoryMoving`.
        await sleep(100).then(() => {
          isHistoryMoving.value = false
        })
      } else {
        updateCurrentRoute()
      }

      if (afterEach) {
        await afterEach(instance, to, from, failure)
      }
    })

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const { currentRoute: _1, beforeEach: _2, ...extractedVueRouter } = VueRouter.use()

    const instance = {
      ...extractedVueRouter,
      routes: {
        ...routes,
        install: (app: App) => {
          app.config.globalProperties.$routes = routes
        },
      },
      allRoutes,
      currentRoute,
    }

    // routes are initialized here because an instance of the router needs to be passed
    allRoutes.forEach(route => {
      route.init({ router: instance, isHistoryMoving })
    })

    return isImplemented<WrapRouter, typeof instance>(instance)
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

    let _router: WrapRouter
    const router = {
      get value() {
        return _router
      },
    }

    const routePath = ref(input.routePath ?? '')
    const children = input.children || []

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const path = ref('')
    const fullPath = ref('')
    const hash = ref('')
    const query = ref<LocationQuery>({})
    const params = ref<RouteParams>({})
    const isCurrent = ref(false)
    const isHistoryMoving = computed(() => state.isHistoryMoving)

    const _hasHistoryMoved = ref(false)
    const hasHistoryMoved = computed(() => {
      return isCurrent.value && !isHistoryMoving.value && _hasHistoryMoved.value
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const move = extensibleMethod<RawRoute['move']>(async () => {
      const nextPath = toMovePath(undefined)
      await router.value.push(nextPath)
    })

    const toMovePath = extensibleMethod<RawRoute['toMovePath']>(() => {
      return toPath({
        routePath: routePath.value,
      })
    })

    const match = extensibleMethod<RawRoute['match']>(path => {
      const keys: Key[] = []
      const pathRegexp = pathToRegexp(routePath.value, keys)
      return pathRegexp.test(path)
    })

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    const init = extensibleMethod<RawRoute['init']>(params => {
      _router = params.router as any
      // when assigning a `ref` to a `reactive` property,
      // that `ref` will also be automatically unwrapped
      // https://vuejs.org/api/reactivity-core.html#reactive
      state.isHistoryMoving = params.isHistoryMoving as any
    })

    const toConfig = extensibleMethod<RawRoute['toConfig']>(() => {
      return {
        path: routePath.value,
        component: input.component,
        children: children.map(child => child.toConfig()),
        name: input.name,
        meta: input.meta,
        redirect: input.redirect,
      }
    })

    const update = extensibleMethod<RawRoute['update']>(async route => {
      // set whether itself route is the current route
      // Note: if the `route` passed matches itself route, it is the current route
      isCurrent.value = getIsCurrent(route)

      if (isCurrent.value) {
        // reconfigure its own state
        path.value = getPath(route)
        fullPath.value = getFullPath(route)
        hash.value = route.hash
        query.value = route.query
        params.value = route.params
        // set the flag indicating whether a history move has been performed
        // Note: if it is currently in the process of history move, it means
        // "history move has been performed"
        _hasHistoryMoved.value = isHistoryMoving.value
      } else {
        // clear its own state
        clear()
      }
    })

    const refresh = extensibleMethod<RawRoute['refresh']>(async () => {
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

    const toPath = extensibleMethod<RawRoute['toPath']>(input => {
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

    const clear = extensibleMethod<RawRoute['clear']>(() => {
      path.value = ''
      fullPath.value = ''
      hash.value = ''
      query.value = {}
      params.value = {}
      isCurrent.value = false
      _hasHistoryMoved.value = false
    })

    function getPath(route: VueRoute): string {
      return toPath({ routePath: routePath.value, params: route.params })
    }

    function getFullPath(route: VueRoute): string {
      return toPath({
        routePath: routePath.value,
        params: route.params,
        query: route.query,
        hash: route.hash,
      })
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
      routePath,
      path,
      fullPath,
      hash,
      query,
      params,
      isCurrent,
      isHistoryMoving,
      hasHistoryMoved,
      children,
      move,
      toMovePath,
      match,
      init,
      toConfig,
      update,
      refresh,
      toPath,
      clear,
      getIsCurrent,
    }

    return isImplemented<RawRoute, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { VueRouter, Router, Route }
export type { WrapRouter, WrapRoute, RawRoute, RouteInput }
