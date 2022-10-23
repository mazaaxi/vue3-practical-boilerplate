import type { BaseRouteInput, WrapBaseRoute } from '@/router/base'
import { BaseRoute } from '@/router/base'
import type { UnwrapNestedRefs } from 'vue'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  ShopRoute
//
//==========================================================================

type ShopRoute = UnwrapNestedRefs<WrapShopRoute>

interface WrapShopRoute extends WrapBaseRoute<void> {}

namespace ShopRoute {
  export function newWrapInstance(input: BaseRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = BaseRoute.newWrapInstance({
      routePath: `/:locale/shop`,
      component: () => import(/* webpackChunkName: "pages/shop" */ '@/pages/shop'),
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

    return isImplemented<WrapShopRoute, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { ShopRoute }
