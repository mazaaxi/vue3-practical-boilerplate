import type { BaseRouteInput, WrapBaseRoute } from '@/router/base'
import { BaseRoute } from '@/router/base'
import type { UnwrapNestedRefs } from 'vue'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//  HomeRoute
//==========================================================================

type HomeRoute = UnwrapNestedRefs<WrapHomeRoute>

interface WrapHomeRoute extends WrapBaseRoute<void> {}

namespace HomeRoute {
  export function newWrapInstance(input: BaseRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = BaseRoute.newWrapInstance({
      routePath: `/:locale/home`,
      component: () => import('@/pages/home/HomePage.vue'),
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
