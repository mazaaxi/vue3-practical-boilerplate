import { ComputedRef, UnwrapRef, reactive } from 'vue'
import { RawRoute, Route } from '@/router/core'

//==========================================================================
//
//  HomeRoute
//
//==========================================================================

interface HomeRoute extends UnwrapRef<RawExampleRoute> {}

interface RawExampleRoute extends RawRoute {
  locale: ComputedRef<string>
}

namespace HomeRoute {
  export function newInstance(locale: ComputedRef<string>): HomeRoute {
    return reactive(newRawInstance(locale))
  }

  export function newRawInstance(locale: ComputedRef<string>) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = Route.newRawInstance({
      routePath: `/:locale/home`,
      component: () => import(/* webpackChunkName: "pages/home" */ '@/pages/home'),
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

//==========================================================================
//
//  Export
//
//==========================================================================

export { HomeRoute }
