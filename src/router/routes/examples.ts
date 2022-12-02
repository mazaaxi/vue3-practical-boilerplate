import type { BaseRouteInput, WrapBaseRoute } from '@/router/base'
import { type UnwrapNestedRefs, reactive } from 'vue'
import { isImplemented, pickProps, removeEndSlash } from 'js-common-lib'
import { BaseRoute } from '@/router/base'
import type { DeepReadonly } from 'js-common-lib'
import type { LocationQueryValue } from 'vue-router'
import { pathToRegexp } from 'path-to-regexp'
import url from 'url'

//==========================================================================
//
//  ExamplesRoutes
//
//==========================================================================

type ExamplesRoutes = UnwrapNestedRefs<WrapExamplesRoutes>

interface WrapExamplesRoutes extends WrapBaseRoute<void> {
  readonly abc: WrapAbcRoute
  readonly miniatureProject: WrapMiniatureProjectRoute
  readonly routing: WrapRoutingRoute
}

namespace ExamplesRoutes {
  export function newWrapInstance(input: BaseRouteInput) {
    const children = {
      abc: AbcRoute.newWrapInstance(input),
      miniatureProject: MiniatureProjectRoute.newWrapInstance(input),
      routing: RoutingRoute.newWrapInstance(input),
    }

    const base = BaseRoute.newWrapInstance({
      routePath: `/:locale/examples`,
      children: Object.values(children),
      ...input,
    })

    const result = {
      ...base,
      ...children,
    }

    return isImplemented<WrapExamplesRoutes, typeof result>(result)
  }
}

//==========================================================================
//  AbcRoute
//==========================================================================

type AbcRoute = UnwrapNestedRefs<WrapAbcRoute>

interface WrapAbcRoute extends WrapBaseRoute<AbcRouteMessage | void> {
  readonly props: DeepReadonly<AbcRouteMessage>
}

interface AbcRouteMessage {
  title?: string
  body?: string
}

namespace AbcRoute {
  export function newWrapInstance(input: BaseRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = BaseRoute.newWrapInstance({
      routePath: `/:locale/examples/abc`,
      component: () => import('@/pages/examples/abc/ABCPage.vue'),
      ...input,
    })

    const props = reactive<AbcRouteMessage>({
      title: undefined,
      body: undefined,
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    base.move.body = <WrapAbcRoute['move']>(async message => {
      Object.assign(message || {}, pickProps(message || {}, ['title', 'body']))
      await base.router.value.push(toMovePath(message))
    })

    const toMovePath = (base.toMovePath.body = <WrapAbcRoute['toMovePath']>(message => {
      const query: { [key: string]: string } = {}
      if (message?.title) {
        query.title = message.title
      }
      if (message?.body) {
        query.body = message.body
      }

      return base.toPath({
        routePath: base.routePath.value,
        query,
      })
    }))

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    // this method is called before the route is moved by routing
    base.update.body = async route => {
      await base.update.super(route)

      // set message object when moved to own route
      if (base.isCurrent.value) {
        props.title = route.query.title as string | undefined
        props.body = route.query.body as string | undefined
      }
      // clear the message object if it is moved to a route that is not its own
      else {
        props.title = undefined
        props.body = undefined
      }
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      ...base,
      props,
    }
  }
}

//==========================================================================
//  MiniatureProjectRoute
//==========================================================================

type MiniatureProjectRoute = UnwrapNestedRefs<WrapMiniatureProjectRoute>

interface WrapMiniatureProjectRoute extends WrapBaseRoute<void> {}

namespace MiniatureProjectRoute {
  export function newWrapInstance(input: BaseRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = BaseRoute.newWrapInstance({
      routePath: `/:locale/examples/miniature-project`,
      component: () => import('@/pages/examples/miniature-project/MiniatureProjectPage.vue'),
      ...input,
    })

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      ...base,
    }
  }
}

//==========================================================================
//  RouteingExampleRoute
//==========================================================================

type RoutingRoute = UnwrapNestedRefs<WrapRoutingRoute>

interface WrapRoutingRoute extends WrapBaseRoute<number> {
  readonly props: {
    readonly page: number
  }
  parse(path_or_fullPath: string): { page: number } | undefined
  replacePage(page: number): Promise<void>
}

namespace RoutingRoute {
  export function newWrapInstance(input: BaseRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = BaseRoute.newWrapInstance({
      routePath: `/:locale/examples/routing`,
      component: () => import('@/pages/examples/routing/RoutingPage.vue'),
      ...input,
    })

    const props = reactive({
      page: NaN,
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    base.move.body = <WrapRoutingRoute['move']>(async newPage => {
      // set new move path as route
      await base.router.value.push(toMovePath(newPage))
    })

    const toMovePath = (base.toMovePath.body = <WrapRoutingRoute['toMovePath']>(page => {
      return base.toPath({
        routePath: base.routePath.value,
        query: { page: page.toString() },
      })
    }))

    const parse: RoutingRoute['parse'] = path_or_fullPath => {
      const parsedURL = url.parse(path_or_fullPath, true)
      if (!parsedURL.pathname) return undefined

      const reg = pathToRegexp(base.routePath.value)
      const regArray = reg.exec(parsedURL.pathname)
      if (!regArray || regArray?.length < 2) return undefined

      return {
        page: toPage(parsedURL.query.page),
      }
    }

    const replacePage: RoutingRoute['replacePage'] = async page => {
      const nextPath = toMovePath(page)
      const currentPath = removeEndSlash(base.router.value.currentRoute.value.fullPath)
      if (currentPath === nextPath) return

      await base.router.value.replace(toMovePath(page))
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    base.update.body = async route => {
      await base.update.super(route)

      if (base.isCurrent.value) {
        props.page = toPage(route.query.page)
      } else {
        props.page = 0
      }
    }

    function toPage(
      pageString: string | string[] | LocationQueryValue | LocationQueryValue[] | undefined
    ): number {
      // if no page is specified in the query, the page number should be "1"
      // Note: even if there is no page specification, the URL will be considered normal
      if (pageString === undefined) return 1
      // if the page specified in the query is not a string, the page number should be "NaN"
      // Note: determine that the URL is abnormal
      if (typeof pageString !== 'string') return NaN

      // if a number is specified in the page string, it will be successfully parsed into a page
      // number. if an invalid string other than a number is specified in the page string, the
      // page number will be parsed to "NaN".
      return parseInt(pageString)
    }

    function isNumberString(
      pageString: string | string[] | LocationQueryValue | LocationQueryValue[] | undefined
    ): pageString is string {
      if (!pageString || Array.isArray(pageString)) return false
      return !isNaN(parseInt(pageString))
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      ...base,
      props,
      parse,
      replacePage,
    }

    return isImplemented<WrapRoutingRoute, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { ExamplesRoutes }
