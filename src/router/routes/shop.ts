import { ComputedRef, reactive } from 'vue'
import { LocaleRoute, LocaleRouteContainerInput, LocaleRouteInput, WrapLocaleRoute } from '@/router/base'
import { isImplemented, removeEndSlash } from 'js-common-lib'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { useRouter } from '@/router'

//==========================================================================
//
//  ShopRoute
//
//==========================================================================

interface ShopRoute extends UnwrapNestedRefs<WrapShopRoute> {}

interface WrapShopRoute extends WrapLocaleRoute {
  readonly locale: ComputedRef<string>
  move(): Promise<boolean>
  toMovePath(): string
}

namespace ShopRoute {
  export function newInstance(input: LocaleRouteContainerInput): ShopRoute {
    return reactive(
      newWrapInstance({
        routePath: `/:locale/shop`,
        component: () => import(/* webpackChunkName: "pages/shop" */ '@/pages/shop'),
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
    //  Methods
    //
    //----------------------------------------------------------------------

    const move: WrapShopRoute['move'] = async () => {
      const router = useRouter()

      // generate a move path
      const nextPath = toMovePath()

      // if a path of the current route is the same as the move path, exit without doing anything
      const currentPath = removeEndSlash(router.currentRoute.value.fullPath)
      if (currentPath === nextPath) {
        return false
      }

      // set new move path as route
      await router.push(nextPath)
      return true
    }

    const toMovePath: WrapShopRoute['toMovePath'] = () => {
      return base.toPath({
        routePath: base.routePath.value,
        params: { locale: base.locale.value },
        query: {},
      })
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      ...base,
      move,
      toMovePath,
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
