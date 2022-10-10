import { BaseRoute, BaseRouteInput, WrapBaseRoute } from '@/router/base'
import { UnwrapNestedRefs } from '@vue/reactivity'
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
