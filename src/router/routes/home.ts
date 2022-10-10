import { BaseRoute, BaseRouteInput, WrapBaseRoute } from '@/router/base'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//  HomeRoute
//==========================================================================

type HomeRoute = UnwrapNestedRefs<WrapHomeRoute>

interface WrapHomeRoute extends WrapBaseRoute {}

namespace HomeRoute {
  export function newWrapInstance(input: BaseRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = BaseRoute.newWrapInstance({
      routePath: `/:locale/home`,
      component: () => import(/* webpackChunkName: "pages/home" */ '@/pages/home'),
      ...input,
    })

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
