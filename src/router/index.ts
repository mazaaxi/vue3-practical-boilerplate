import { ExampleRoute, ExampleRoutes } from '@/router/example'
import { FlowStatus, RawRoute, Route } from '@/router/core'
import { Router, createRouter, createWebHistory } from 'vue-router'
import { SupportI18nLocales, loadI18nLocaleMessages, setI18nLanguage } from '@/i18n'
import { UnwrapRef, WritableComputedRef, computed, reactive, ref, watch } from 'vue'
import { I18n } from 'vue-i18n'
import { createNanoEvents } from 'nanoevents'
import flatten from 'lodash/flatten'
import { pickProps } from 'js-common-lib'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface AppRouterContainer {
  router: Router
  routes: AppRoutes
  currentRoute: Route
}

interface AppRoutes {
  home: ExampleRoute
  about: ExampleRoute
}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace AppRouterContainer {
  let instance: AppRouterContainer

  export function setupRouter(i18n: I18n): AppRouterContainer {
    instance = newInstance(i18n)
    return instance
  }

  export function useRouter(): AppRouterContainer {
    return instance
  }

  function newInstance(i18n: I18n): AppRouterContainer {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const Events = {
      RouterOnReady: 'routerOnReady',
    } as const

    const locale = computed(() => (i18n.global.locale as WritableComputedRef<string>).value)

    const historyMove = ref(false)

    const routerReady = ref(false)

    const emitter = createNanoEvents()

    //--------------------------------------------------
    //  Routes
    //--------------------------------------------------

    const example = ExampleRoutes.newInstance(locale)

    const fallback = reactive(
      Route.newRawInstance({
        routePath: `/:pathMatch(.*)*`,
        redirect: `/${locale.value}/home`,
      })
    )

    const routeList: UnwrapRef<RawRoute>[] = [example.home, example.about, fallback]

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
      home: example.home,
      about: example.about,
    }

    const currentRoute: Route = reactive({
      basePath: '',
      path: '',
      fullPath: '',
      hash: '',
      query: {},
      params: {},
      status: 'None' as FlowStatus,
      isCurrent: false,
      historyMove: false,
      onBeforeRouteUpdate: () => () => {},
      onBeforeRouteLeave: () => () => {},
      onAfterRouteUpdate: () => () => {},
      onAfterRouteLeave: () => () => {},
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    //----------------------------------------------------------------------
    //
    //  Event listeners
    //
    //----------------------------------------------------------------------

    router.isReady().then(() => {
      routerReady.value = true
      emitter.emit(Events.RouterOnReady)
    })

    window.addEventListener('popstate', e => {
      historyMove.value = true
    })

    watch(
      () => locale.value,
      async (newValue, oldValue) => {
        // When a language switch occurs, refresh the current route to embed the switched language in the path.
        const currentRoute = routeList.find(route => route.isCurrent)
        if (!currentRoute) return
        await currentRoute.refresh(router)
      }
    )

    //--------------------------------------------------
    //  Navigation guards
    //--------------------------------------------------

    router.beforeEach(async (to, from, next) => {
      const paramsLocale = to.params.locale as string

      // use locale if paramsLocale is not in `SupportI18nLocales`
      if (!SupportI18nLocales.includes(paramsLocale)) {
        return next(`/${locale.value}`)
      }

      // load locale messages
      if (!i18n.global.availableLocales.includes(paramsLocale)) {
        await loadI18nLocaleMessages(paramsLocale)
      }

      // set i18n language
      setI18nLanguage(paramsLocale)

      // check if proceed a next route
      for (const route of routeList) {
        const ret = await route.proceed(to, from)
        if (!ret) return next(false)
      }

      // update each route object
      for (const route of routeList) {
        await route.update(to, from, { historyMove: historyMove.value })
      }

      return next()
    })

    router.afterEach((to, from) => {
      // update the its own current route
      const _currentRoute = routeList.find(route => route.isCurrent)!
      Object.assign(
        currentRoute,
        pickProps(_currentRoute, [
          'basePath',
          'path',
          'fullPath',
          'hash',
          'query',
          'params',
          'status',
          'isCurrent',
          'onBeforeRouteUpdate',
          'onBeforeRouteLeave',
          'onAfterRouteUpdate',
          'onAfterRouteLeave',
        ]),
        { historyMove: historyMove.value }
      )

      historyMove.value = false

      // perform post-move processing for each route object.
      for (const route of routeList) {
        route.after(to, from)
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

//========================================================================
//
//  Export
//
//========================================================================

const { setupRouter, useRouter } = AppRouterContainer
export { AppRouterContainer, AppRoutes, FlowStatus, RawRoute, setupRouter, useRouter }
export * from '@/router/core'
