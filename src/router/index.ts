import { ComputedRef, WritableComputedRef, computed, reactive, ref, watch } from 'vue'
import { RawRoute, Route } from '@/router/core'
import { Router, createRouter, createWebHistory } from 'vue-router'
import { SupportI18nLocales, useI18nUtils } from '@/i18n'
import { ExamplesRoutes } from '@/router/routes/examples'
import { HomeRoute } from '@/router/routes/home'
import { I18n } from 'vue-i18n'
import { LocaleRouteContainerInput } from '@/router/base'
import { ShopRoute } from '@/router/routes/shop'
import { UnwrapNestedRefs } from '@vue/reactivity'
import flatten from 'lodash/flatten'
import { sleep } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface AppRouterContainer {
  router: Router
  routes: AppRoutes
  currentRoute: Route
}

interface AppRoutes {
  home: HomeRoute
  shop: ShopRoute
  examples: ExamplesRoutes
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AppRouterContainer {
  let instance: AppRouterContainer

  export function setupRouter(i18n: I18n, router?: AppRouterContainer): Router {
    instance = router ?? newInstance(i18n)
    return instance.router
  }

  export function useRouter(): Router {
    return instance.router
  }

  export function useRouterUtils(): Omit<AppRouterContainer, 'router'> {
    const { routes, currentRoute } = instance
    return { routes, currentRoute }
  }

  function newInstance(i18n: I18n): AppRouterContainer {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const locale = computed(() => (i18n.global.locale as WritableComputedRef<string>).value)

    const { loadI18nLocaleMessages } = useI18nUtils()

    const routerReady = ref(false)

    const isHistoryMoving = ref(false)

    // The registration of `window.popstate` event should be done before the creation of `router`.
    // This way, `window.popstate` will be fired before `router.beforeEach`.
    // On the other hand, if you register the `window.popstate` event after the creation of `router`,
    // `window.popstate` will be fired after `router.afterEach`.
    window.addEventListener('popstate', e => {
      isHistoryMoving.value = true
    })

    //--------------------------------------------------
    //  Routes
    //--------------------------------------------------

    const routeInput: LocaleRouteContainerInput = {
      locale,
      isHistoryMoving: isHistoryMoving as ComputedRef<boolean>,
    }

    const home = HomeRoute.newInstance(routeInput)
    const shop = ShopRoute.newInstance(routeInput)
    const examples = ExamplesRoutes.newInstance(routeInput)

    const fallback = reactive(
      Route.newRawInstance({
        routePath: `/:pathMatch(.*)*`,
        redirect: `/${locale.value}/home`,
        isHistoryMoving: routeInput.isHistoryMoving,
      })
    )

    const routeList: UnwrapNestedRefs<RawRoute>[] = [home, shop, examples.abc, examples.miniatureProject, examples.routing, fallback]

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const router = createRouter({
      history: createWebHistory(),
      routes: flatten(routeList.map(item => item.toRouteConfig())),
    })

    const routes: AppRoutes = {
      home,
      shop,
      examples,
    }

    const currentRoute: Route = reactive({
      basePath: '',
      path: '',
      fullPath: '',
      hash: '',
      query: {},
      params: {},
      isCurrent: false,
      isHistoryMoving,
      hasHistoryMoved: false,
    })

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function updateCurrentRoute(): void {
      const current = routeList.find(route => route.isCurrent)!
      const props: (keyof Route)[] = ['basePath', 'path', 'fullPath', 'hash', 'query', 'params', 'isCurrent', 'hasHistoryMoved']
      props.forEach(prop => {
        ;(currentRoute as any)[prop] = current[prop]
      })
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    router.isReady().then(() => {
      routerReady.value = true
    })

    watch(
      () => locale.value,
      async (newValue, oldValue) => {
        // when a language switch occurs, refresh the current route to embed the switched language in the path.
        const current = routeList.find(route => route.isCurrent)
        current && (await current.refresh(router))
      }
    )

    router.beforeEach(async (to, from, next) => {
      const paramsLocale = to.params.locale as string

      // use locale if paramsLocale is not in `SupportI18nLocales`
      if (!SupportI18nLocales.includes(paramsLocale)) {
        return next(`/${locale.value}`)
      }

      // load locale messages
      await loadI18nLocaleMessages(paramsLocale)

      // update each route object
      await Promise.all(routeList.map(route => route.updateByFlow(to, from)))

      next()
    })

    router.afterEach(async (to, from, failure) => {
      isHistoryMoving.value = false

      if (failure) {
        // update each route object in the previous route
        await Promise.all(routeList.map(route => route.update(from)))

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

    return {
      router,
      routes,
      currentRoute,
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupRouter, useRouter, useRouterUtils } = AppRouterContainer
export { AppRouterContainer, AppRoutes, setupRouter, useRouter, useRouterUtils }
export * from '@/router/core'
