import { LocaleRoute, LocaleRouteContainerInput, LocaleRouteInput, RawLocaleRoute } from '@/router/base'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { isImplemented } from 'js-common-lib'
import { reactive } from 'vue'

//==========================================================================
//
//  HomeRoute
//
//==========================================================================

interface HomeRoute extends UnwrapNestedRefs<RawHomeRoute> {}

interface RawHomeRoute extends RawLocaleRoute {}

namespace HomeRoute {
  export function newInstance(input: LocaleRouteContainerInput): HomeRoute {
    return reactive(
      newRawInstance({
        routePath: `/:locale/home`,
        component: () => import(/* webpackChunkName: "pages/home" */ '@/pages/home'),
        ...input,
      })
    )
  }

  function newRawInstance(input: LocaleRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = LocaleRoute.newRawInstance(input)

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      ...base,
    }

    return isImplemented<RawHomeRoute, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { HomeRoute }
