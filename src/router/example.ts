import { ComputedRef, UnwrapRef, reactive } from 'vue'
import { RawRoute, Route, RouteInput } from '@/router/core'

//========================================================================
//
//  ExampleRoutes
//
//========================================================================

interface ExampleRoutes {
  home: ExampleRoute
  about: ExampleRoute
}

namespace ExampleRoutes {
  export function newInstance(locale: ComputedRef<string>): ExampleRoutes {
    const home = reactive(
      ExampleRoute.newRawInstance({
        routeName: `home`,
        component: () => import(/* webpackChunkName: "views/home" */ '@/views/Home.vue'),
        locale,
      })
    )

    const about = reactive(
      ExampleRoute.newRawInstance({
        routeName: `about`,
        component: () => import(/* webpackChunkName: "views/about" */ '@/views/About.vue'),
        locale,
      })
    )

    return reactive({
      home,
      about,
    })
  }
}

//========================================================================
//
//  ExampleRoute
//
//========================================================================

interface ExampleRoute extends UnwrapRef<RawExampleRoute> {}

interface RawExampleRoute extends RawRoute {
  locale: ComputedRef<string>
}

type ExampleRouteInput = Pick<RouteInput, 'component'> & {
  routeName: string
  locale: ComputedRef<string>
}

namespace ExampleRoute {
  export function newRawInstance(input: ExampleRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const { locale, routeName, ..._input } = input

    const base = Route.newRawInstance({
      ..._input,
      routePath: `/:locale/${routeName}`,
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    base.toPath.body = (routePath, params, query) => {
      // replace the language in `params` with the language selected by the application
      // NOTE: Except at a start of the application, the order of processing is
      // "change language" -> "change root".
      return base.toPath.super(routePath, { ...params, locale: locale.value }, query)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      ...base,
      locale,
    }
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { ExampleRoutes, ExampleRoute }
