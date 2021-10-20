import { ComputedRef, UnwrapRef, reactive } from 'vue'
import { RawRoute, Route } from '@/router/core'
import { removeEndSlash } from 'js-common-lib'
import { useRouter } from '@/router'

//==========================================================================
//
//  ShopRoute
//
//==========================================================================

interface ShopRoute extends UnwrapRef<RawShopRoute> {}

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
      component: () => import(/* webpackChunkName: "views/shop" */ '@/views/shop'),
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

      // 移動パスを生成
      const nextPath = toMovePath()

      // カレントルートのパスと移動パスが同じ場合、何もせず終了
      const currentPath = removeEndSlash(router.currentRoute.value.fullPath)
      if (currentPath === nextPath) {
        return false
      }

      // 新しい移動パスをルートに設定
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
