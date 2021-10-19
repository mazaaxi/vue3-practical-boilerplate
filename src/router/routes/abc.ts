import { ComputedRef, UnwrapRef, reactive } from 'vue'
import { RawRoute, Route } from '@/router/core'

//==========================================================================
//
//  AbcRoute
//
//==========================================================================

interface AbcRoute extends UnwrapRef<RawAbcRoute> {}

interface RawAbcRoute extends RawRoute {
  locale: ComputedRef<string>
}

namespace AbcRoute {
  export function newInstance(locale: ComputedRef<string>): AbcRoute {
    return reactive(newRawInstance(locale))
  }

  function newRawInstance(locale: ComputedRef<string>) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = Route.newRawInstance({
      routePath: `/:locale/abc`,
      component: () => import(/* webpackChunkName: "views/abc" */ '@/views/abc'),
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

export { AbcRoute }
