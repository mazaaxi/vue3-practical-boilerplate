import { App, WritableComputedRef, computed, reactive, watch } from 'vue'
import { RawRoute, Route, Router } from '@/router/core'
import { SupportI18nLocales, useI18nUtils } from '@/i18n'
import { BaseRouteInput } from '@/router/base'
import { ExamplesRoutes } from '@/router/routes/examples'
import { HomeRoute } from '@/router/routes/home'
import { I18n } from 'vue-i18n'
import { ShopRoute } from '@/router/routes/shop'

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

  export function setupRouter(i18n: I18n, router?: AppRouter): AppRouter {
    instance = router ?? newInstance(i18n)
    return instance
  }

  export function useRouter(): AppRouter {
    if (!instance) {
      throw new Error(
        `Router is not initialized. Run \`setupRouter()\` before using \`userRouter()\`.`
      )
    }
    return instance
  }

  function newInstance(i18n: I18n): AppRouter {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const locale = computed(() => (i18n.global.locale as WritableComputedRef<string>).value)

    const { loadI18nLocaleMessages } = useI18nUtils()

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

    return reactive(router)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupRouter, useRouter } = AppRouter
export { AppRouter, AppRoutes, setupRouter, useRouter }
export * from '@/router/core'
