import type { App, WritableComputedRef } from 'vue'
import { AppI18n, SupportI18nLocales } from '@/i18n'
import { Route, Router, VueRouter } from '@/router/core'
import { computed, reactive, ref, watch } from 'vue'
import type { BaseRouteInput } from '@/router/base'
import { ExamplesRoutes } from '@/router/routes/examples'
import { HomeRoute } from '@/router/routes/home'
import type { I18n } from 'vue-i18n'
import type { RawRoute } from '@/router/core'
import { ShopRoute } from '@/router/routes/shop'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type AppRouter = Router<AppRoutes>

interface AppRoutes {
  home: HomeRoute
  shop: ShopRoute
  examples: ExamplesRoutes
  /**
   * @see Plugin.install of @vue/runtime-core
   */
  install(app: App, ...options: any[]): any
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AppRouter {
  let instance: AppRouter

  export function setup<T extends AppRouter>(i18n: I18n, router?: T): T {
    instance = router ?? newInstance(i18n)
    return instance as T
  }

  export function use(): AppRouter {
    if (!instance) {
      throw new Error(`AppRouter is not initialized. Run \`setup()\` before using \`use()\`.`)
    }
    return instance
  }

  export function useVueRouter(): VueRouter {
    return VueRouter.use()
  }

  function newInstance(i18n: I18n) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const locale = computed(() => (i18n.global.locale as WritableComputedRef<string>).value)

    const { loadI18nLocaleMessages } = AppI18n.useUtils()

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    //--------------------------------------------------
    //  Set your routes

    const routeInput: BaseRouteInput = { locale }

    const routes = {
      home: HomeRoute.newWrapInstance(routeInput),
      shop: ShopRoute.newWrapInstance(routeInput),
      examples: ExamplesRoutes.newWrapInstance(routeInput),
      install: (app: App) => {
        app.config.globalProperties.$routes = routes
      },
    }

    const flattenRoutes: RawRoute[] = [
      routes.home,
      routes.shop,
      routes.examples.abc,
      routes.examples.miniatureProject,
      routes.examples.routing,
      // fallback route
      Route.newWrapInstance({
        routePath: `/:pathMatch(.*)*`,
        redirect: `/${locale.value}/home`,
      }),
    ]

    //--------------------------------------------------

    const router = Router.newWrapInstance({
      routes,
      flattenRoutes,
      beforeRouteUpdate: async (router, to, from, next) => {
        const paramsLocale = to.params.locale as string

        // if `paramsLocale` is not in `SupportI18nLocales`, use current `locale`
        if (!SupportI18nLocales.includes(paramsLocale)) {
          next(`/${locale.value}`)
          return false
        }

        // load locale messages
        await loadI18nLocaleMessages(paramsLocale)

        return true
      },
    })

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    watch(
      () => locale.value,
      async (newValue, oldValue) => {
        // when a language switch occurs, refresh the current route to embed the switched language
        // in the path.
        const current = flattenRoutes.find(route => route.isCurrent.value)
        current && (await current.refresh())
      }
    )

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = reactive(router)

    return isImplemented<AppRouter, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AppRouter }
export * from '@/router/core'
