import { ComputedRef, reactive } from 'vue'
import { RawRoute, Route } from '@/router/core'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { removeEndSlash } from 'js-common-lib'
import { useRouter } from '@/router'

//==========================================================================
//
//  ShopRoute
//
//==========================================================================

interface ShopRoute extends UnwrapNestedRefs<RawShopRoute> {}

interface RawShopRoute extends RawRoute {
  readonly locale: ComputedRef<string>
  move(): Promise<boolean>
  toMovePath(): string
}

namespace ShopRoute {
  export function newInstance(locale: ComputedRef<string>): ShopRoute {
    return reactive(newRawInstance(locale))
  }

  function newRawInstance(locale: ComputedRef<string>) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = Route.newRawInstance({
      routePath: `/:locale/shop`,
      component: () => import(/* webpackChunkName: "pages/shop" */ '@/pages/shop'),
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

    const move: RawShopRoute['move'] = async () => {
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

    const toMovePath: RawShopRoute['toMovePath'] = () => {
      return base.toPath(base.routePath.value, { locale: locale.value }, {})
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      ...base,
      locale,
      move,
      toMovePath,
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { ShopRoute }
