import { Route, RouteInput, WrapRoute } from '@/router/core'
import { ComputedRef } from 'vue'
import { extensionMethod } from '@/base'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

const PathParamKeys = {
  Locale: 'locale',
} as const

interface BaseRouteInput extends RouteInput {
  locale: ComputedRef<string>
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

interface WrapBaseRoute<MOVE_PARAMS extends any | void = void> extends WrapRoute<MOVE_PARAMS> {
  readonly locale: ComputedRef<string>
}

namespace BaseRoute {
  export function newWrapInstance(input: BaseRouteInput) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = Route.newWrapInstance(input)

    const locale = input.locale

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const update = (base.update.body = extensionMethod(async route => {
      // if the parameter has a language
      if (route.params[PathParamKeys.Locale]) {
        await base.update.super(route)
      }
      // if the parameter does not have a language
      // Note: it means that it is not locale routing
      else {
        base.clear()
      }
    }))

    const toPath = (base.toPath.body = extensionMethod(input => {
      const { routePath, params, query, hash } = input
      // replace the language in `params` with the language selected by the application
      // Note: Except at a start of the application, the order of processing is
      // "change language" -> "change route".
      return base.toPath.super({
        routePath,
        params: { ...params, [PathParamKeys.Locale]: locale.value },
        query,
        hash,
      })
    }))

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      ...base,
      locale,
      update,
      toPath,
    }

    return isImplemented<WrapBaseRoute, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { BaseRouteInput, BaseRoute, WrapBaseRoute }
