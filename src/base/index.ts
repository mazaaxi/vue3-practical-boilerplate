import type { DeepPartial, DeepReadonly, DeepUnreadonly } from 'js-common-lib'
import type { App } from 'vue'
import { Notify } from 'quasar'
import merge from 'lodash/merge'

//==========================================================================
//
//  Definition
//
//==========================================================================

/**
 * @see Plugin.install of @vue/runtime-core
 */
type VuePluginInstall = (app: App, ...options: any[]) => any

//==========================================================================
//
//  Implementation
//
//==========================================================================

/**
 * Create copy functions named `populate` and `clone`. Implement a function that populates data
 * from `from` to `to` for the argument `populateFn`.
 * @param populateFn
 */
function createObjectCopyFunctions<T>(
  populateFn: <TO extends DeepPartial<T>, FROM extends DeepPartial<DeepReadonly<T>>>(
    to: TO,
    from: FROM
  ) => any
): {
  populate: <TO extends DeepPartial<T>, FROM extends DeepPartial<DeepReadonly<T>>>(
    to: TO,
    from: FROM
  ) => DeepUnreadonly<TO & FROM>
  clone: <SOURCE extends DeepReadonly<T | T[] | undefined | null>>(
    source: SOURCE
  ) => DeepUnreadonly<SOURCE>
} {
  const populate = populateFn

  const clone: any = (source: any) => {
    if (!source) return source
    if (Array.isArray(source)) {
      return source.map(item => clone(item))
    } else {
      return populateFn({} as any, source)
    }
  }

  return { populate, clone }
}

/**
 * Displays a notification bar on the screen.
 */
function showNotification(
  type: 'info' | 'warning' | 'error',
  message: string,
  options?: {
    position?:
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'center'
    timeout?: number
    actions?: any[] | 'none'
    html?: boolean
    ignoreLineBreaks?: boolean
  }
): Function {
  if (options?.ignoreLineBreaks) {
    message = message.replace(/\r?\n/g, '')
  } else {
    message = message.replace(/\r?\n/g, '<br>')
  }

  let actions: any[]
  if (options?.actions === 'none') {
    actions = []
  } else if (options?.actions) {
    actions = options.actions.map(action => merge({ color: 'white' }, action))
  } else {
    actions = [{ icon: 'close', color: 'white' }]
  }

  return Notify.create({
    icon: (() => {
      switch (type) {
        case 'info':
          return 'info'
        case 'warning':
          return 'warning'
        case 'error':
          return 'priority_high'
      }
    })(),
    position: options?.position ?? 'bottom-left',
    message,
    timeout: options?.timeout ?? 0,
    color: (() => {
      switch (type) {
        case 'info':
          return 'grey-9'
        case 'warning':
          return 'amber-14'
        case 'error':
          return 'negative'
      }
    })(),
    actions,
    html: typeof options?.html === 'boolean' ? options.html : true,
  })
}

/**
 * Get the base URL of the application.
 */
function getBaseURL(): string {
  return document.getElementsByTagName('base')[0].href
}

/**
 * Gets whether the specified icon is FontAwesome or not.
 */
function isFontAwesome(icon: string | undefined | null): boolean {
  if (!icon) return false
  return Boolean(icon.match(/fa[sbr] fa-/))
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { createObjectCopyFunctions, showNotification, getBaseURL, isFontAwesome }
export type { VuePluginInstall }
export * from '@/base/config'
export * from '@/base/constants'
export * from '@/base/screen'
export * from '@/base/style'
