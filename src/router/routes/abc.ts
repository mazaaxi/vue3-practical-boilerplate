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
      component: () => import(/* webpackChunkName: "pages/abc" */ '@/pages/abc'),
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
      // set message object when moved to own route
      if (base.isCurrent.value) {
        message.title = to.query.title as string | undefined
        message.body = to.query.body as string | undefined
      }
      // clear the message object if it is moved to a route that is not its own
      else {
        message.title = undefined
        message.body = undefined
      }

      base.after.super(to, from)
    }

    const move: RawAbcRoute['move'] = async message => {
      const router = useRouter()

      // generate a move path with the specified information
      const nextPath = toMovePath(message)

      // if a path of the current route is the same as the move path, exit without doing anything
      const currentPath = removeEndSlash(router.currentRoute.value.fullPath)
      if (currentPath === nextPath) {
        return false
      }

      // set the message object
      Object.assign(message, pickProps(message || {}, ['title', 'body']))

      // set new move path as route
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
