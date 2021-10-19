import { ComputedRef, UnwrapRef, reactive } from 'vue'
import { DeepReadonly, pickProps, removeEndSlash } from 'js-common-lib'
import { RawRoute, Route } from '@/router/core'
import { useRouter } from '@/router'

//==========================================================================
//
//  AbcRoute
//
//==========================================================================

interface AbcRoute extends UnwrapRef<RawAbcRoute> {}

interface RawAbcRoute extends RawRoute {
  readonly locale: ComputedRef<string>
  readonly message: DeepReadonly<AbcRouteMessage>
  move(message?: AbcRouteMessage): Promise<boolean>
  toMovePath(message?: AbcRouteMessage): string
}

interface AbcRouteMessage {
  title?: string
  body?: string
}

namespace AbcRoute {
  export function newInstance(locale: ComputedRef<string>): AbcRoute {
    return reactive(newRawInstance(locale))
  }

  function newRawInstance(locale: ComputedRef<string>) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = Route.newRawInstance({
      routePath: `/:locale/abc`,
      component: () => import(/* webpackChunkName: "views/abc" */ '@/views/abc'),
    })

    const message = reactive<AbcRouteMessage>({
      title: undefined,
      body: undefined,
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

    base.after.body = (to, from) => {
      // 自身のルートに移動された場合、メッセージオブジェクトを設定
      if (base.isCurrent.value) {
        message.title = to.query.title as string | undefined
        message.body = to.query.body as string | undefined
      }
      // 自身ではないルートに移動された場合、メッセージオブジェクトをクリア
      else {
        message.title = undefined
        message.body = undefined
      }

      base.after.super(to, from)
    }

    const move: RawAbcRoute['move'] = async message => {
      const router = useRouter()

      // 指定された情報で移動パスを生成
      const nextPath = toMovePath(message)

      // カレントルートのパスと移動パスが同じ場合、何もせず終了
      const currentPath = removeEndSlash(router.currentRoute.value.fullPath)
      if (currentPath === nextPath) {
        return false
      }

      // メッセージオブジェクトを設定
      Object.assign(message, pickProps(message || {}, ['title', 'body']))

      // 新しい移動パスをルートに設定
      await router.push(nextPath)
      return true
    }

    const toMovePath: RawAbcRoute['toMovePath'] = message => {
      const query: { [key: string]: string } = {}
      if (message?.title) {
        query.title = message.title
      }
      if (message?.body) {
        query.body = message.body
      }

      return base.toPath(base.routePath.value, { locale: locale.value }, query)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      ...base,
      locale,
      message,
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

export { AbcRoute }
