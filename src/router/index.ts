import { Route, Router } from '@/router/core'
import { AboutRoute } from '@/router/routes/about'
import type { App } from 'vue'
import { HomeRoute } from '@/router/routes/home'
import type { RawRoute } from '@/router/core'
import type { RouteInput } from '@/router/core'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type AppRouter = Router<AppRoutes>

interface AppRoutes {
  home: HomeRoute
  about: AboutRoute
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

  export function setupRouter(router?: AppRouter): AppRouter {
    instance = router ?? newInstance()
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

  function newInstance(): AppRouter {
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    //--------------------------------------------------
    //  Set your routes

    const routeInput: RouteInput = {}

    const routes = {
      home: HomeRoute.newWrapInstance(routeInput),
      about: AboutRoute.newWrapInstance(routeInput),
      install: (app: App) => {
        app.config.globalProperties.$routes = routes
      },
    }

    const flattenRoutes: RawRoute[] = [
      routes.home,
      routes.about,
      // fallback route
      Route.newWrapInstance({
        routePath: `/:pathMatch(.*)*`,
        redirect: `/home`,
      }),
    ]

    //--------------------------------------------------

    const router = Router.newWrapInstance({
      routes,
      flattenRoutes,
    })

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
export { AppRouter, setupRouter, useRouter }
export type { AppRoutes }
export * from '@/router/core'
