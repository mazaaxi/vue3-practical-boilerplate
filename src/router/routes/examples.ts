import { ComputedRef, Ref, reactive, ref } from 'vue'
import { DeepReadonly, isImplemented, pickProps, removeEndSlash } from 'js-common-lib'
import { LocaleRoute, LocaleRouteContainerInput, LocaleRouteInput, RawLocaleRoute } from '@/router/base'
import { LocationQueryValue } from 'vue-router'
import { RawRoute } from '@/router/core'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { pathToRegexp } from 'path-to-regexp'
import url from 'url'
import { useRouter } from '@/router'

//==========================================================================
//  ExamplesRoutes
//==========================================================================

interface ExamplesRoutes {
  readonly miniatureProject: MiniatureProjectRoute
  readonly abc: AbcRoute
  readonly routing: RoutingRoute
}

namespace ExamplesRoutes {
  export function newInstance(input: LocaleRouteContainerInput) {
    const miniatureProject = MiniatureProjectRoute.newRawInstance({
      routePath: `/:locale/examples/miniature-project`,
      component: () => import(/* webpackChunkName: "pages/examples/miniature-project" */ '@/pages/examples/miniature-project'),
      ...input,
    })
    const abc = AbcRoute.newRawInstance({
      routePath: `/:locale/examples/abc`,
      component: () => import(/* webpackChunkName: "pages/examples/abc" */ '@/pages/examples/abc'),
      ...input,
    })
    const routing = RoutingRoute.newRawInstance({
      routePath: `/:locale/examples/routing`,
      component: () => import(/* webpackChunkName: "pages/home" */ '@/pages/examples/routing'),
      ...input,
    })

    const result = reactive({
      miniatureProject,
      abc,
      routing,
    })

    return isImplemented<ExamplesRoutes, typeof result>(result)
  }
}

//==========================================================================
//  AbcRoute
//==========================================================================

interface AbcRoute extends UnwrapNestedRefs<RawAbcRoute> {}

interface RawAbcRoute extends RawLocaleRoute {
  readonly message: DeepReadonly<AbcRouteMessage>
  move(message?: AbcRouteMessage): Promise<boolean>
  toMovePath(message?: AbcRouteMessage): string
}

interface AbcRouteMessage {
  title?: string
  body?: string
}

namespace AbcRoute {
  export function newRawInstance(input: LocaleRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = LocaleRoute.newRawInstance(input)

    const message = reactive<AbcRouteMessage>({
      title: undefined,
      body: undefined,
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    base.update.body = async route => {
      await base.update.super(route)

      // set message object when moved to own route
      if (base.isCurrent.value) {
        message.title = route.query.title as string | undefined
        message.body = route.query.body as string | undefined
      }
      // clear the message object if it is moved to a route that is not its own
      else {
        message.title = undefined
        message.body = undefined
      }
    }

    const move: RawAbcRoute['move'] = async message => {
      const router = useRouter()

      // generate a move path with the specified information
      const nextPath = toMovePath(message)

      // if a path of the current route is the same as the move path, exit without doing anything
      const currentPath = removeEndSlash(router.currentRoute.value.fullPath)
      if (currentPath === nextPath) return false

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

      return base.toPath({
        routePath: base.routePath.value,
        params: { locale: base.locale.value },
        query,
      })
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      ...base,
      message,
      move,
      toMovePath,
    }
  }
}

//==========================================================================
//  RouteingExampleRoute
//==========================================================================

interface RoutingRoute extends UnwrapNestedRefs<RawRoutingRoute> {}

interface RawRoutingRoute extends RawLocaleRoute {
  readonly page: Ref<number>
  move(page: number): Promise<boolean>
  toMovePath(page: number): string
  parse(path_or_fullPath: string): { page: number } | undefined
  replacePage(page: number): Promise<void>
}

namespace RoutingRoute {
  export function newRawInstance(input: LocaleRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = LocaleRoute.newRawInstance(input)

    const page = ref<number>(NaN)

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const move: RoutingRoute['move'] = async newPage => {
      const router = useRouter()

      // generate a move path
      const nextPath = toMovePath(newPage)

      // if a path of the current route is the same as the move path, exit without doing anything
      const currentPath = removeEndSlash(router.currentRoute.value.fullPath)
      if (currentPath === nextPath) return false

      // set new move path as route
      await router.push(nextPath)
      return true
    }

    const toMovePath: RoutingRoute['toMovePath'] = page => {
      return base.toPath({
        routePath: base.routePath.value,
        params: { locale: base.locale.value },
        query: { page: page.toString() },
      })
    }

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
      const router = useRouter()

      const nextPath = toMovePath(page)
      const currentPath = removeEndSlash(router.currentRoute.value.fullPath)
      if (currentPath === nextPath) return

      await router.replace(nextPath)
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    base.update.body = async route => {
      await base.update.super(route)

      if (base.isCurrent.value) {
        page.value = toPage(route.query.page)
      } else {
        page.value = 0
      }
    }

    function isNumberString(pageString: string | string[] | LocationQueryValue | LocationQueryValue[] | undefined): pageString is string {
      if (!pageString || Array.isArray(pageString)) return false
      return !isNaN(parseInt(pageString))
    }

    function toPage(pageString: string | string[] | LocationQueryValue | LocationQueryValue[] | undefined): number {
      // if no page is specified in the query, the page number should be "1"
      // Note: even if there is no page specification, the URL will be considered normal
      if (pageString === undefined) return 1
      // if the page specified in the query is not a string, the page number should be "NaN"
      // Note: determine that the URL is abnormal
      if (typeof pageString !== 'string') return NaN

      // if a number is specified in the page string, it will be successfully parsed into a page number.
      // if an invalid string other than a number is specified in the page string, the page number will
      // be parsed to "NaN".
      return parseInt(pageString)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      ...base,
      page,
      move,
      toMovePath,
      parse,
      replacePage,
    }

    return isImplemented<RawRoutingRoute, typeof result>(result)
  }
}

//==========================================================================
//  MiniatureProjectRoute
//==========================================================================

interface MiniatureProjectRoute extends UnwrapNestedRefs<RawMiniatureProjectRoute> {}

interface RawMiniatureProjectRoute extends RawRoute {
  locale: ComputedRef<string>
}

namespace MiniatureProjectRoute {
  export function newRawInstance(input: LocaleRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = LocaleRoute.newRawInstance(input)

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
//
//  Export
//
//==========================================================================

export { ExamplesRoutes }
