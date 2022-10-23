import type { RouteInput, WrapRoute } from '@/router'
import { Route } from '@/router'
import type { UnwrapNestedRefs } from 'vue'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//  AboutRoute
//==========================================================================

type AboutRoute = UnwrapNestedRefs<WrapAboutRoute>

interface WrapAboutRoute extends WrapRoute {}

namespace AboutRoute {
  export function newWrapInstance(input: RouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = Route.newWrapInstance({
      routePath: `/about`,
      component: () => import('@/views/AboutView.vue'),
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

export { AboutRoute }
