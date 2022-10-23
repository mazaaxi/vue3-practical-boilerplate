import type { RouteInput, WrapRoute } from '@/router'
import { Route } from '@/router'
import type { UnwrapNestedRefs } from 'vue'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//  HomeRoute
//==========================================================================

type HomeRoute = UnwrapNestedRefs<WrapAboutRoute>

interface WrapAboutRoute extends WrapRoute {}

namespace HomeRoute {
  export function newWrapInstance(input: RouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = Route.newWrapInstance({
      routePath: `/home`,
      component: () => import('@/views/HomeView.vue'),
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

    return isImplemented<WrapAboutRoute, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { HomeRoute }
