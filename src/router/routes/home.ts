import { LocaleRoute, LocaleRouteContainerInput, LocaleRouteInput, WrapLocaleRoute } from '@/router/base'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { isImplemented } from 'js-common-lib'
import { reactive } from 'vue'

//==========================================================================
//
//  HomeRoute
//
//==========================================================================

interface HomeRoute extends UnwrapNestedRefs<WrapHomeRoute> {}

interface WrapHomeRoute extends WrapLocaleRoute {}

namespace HomeRoute {
  export function newInstance(input: LocaleRouteContainerInput): HomeRoute {
    return reactive(
      newWrapInstance({
        routePath: `/:locale/home`,
        component: () => import(/* webpackChunkName: "pages/home" */ '@/pages/home'),
        ...input,
      })
    )
  }

  function newWrapInstance(input: LocaleRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = LocaleRoute.newWrapInstance(input)

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      ...base,
    }

    return isImplemented<WrapHomeRoute, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { HomeRoute }
