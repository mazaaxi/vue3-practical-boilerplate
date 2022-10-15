import { Notify } from 'quasar'
import merge from 'lodash/merge'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

namespace constants {
  export namespace style {
    export const AppHeaderHeight = 50
  }
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

/**
 * Create an extensible method.
 */
function extensionMethod<T extends Function>(method: T): T & { readonly super: T; body: T } {
  const _super = method
  let _body = method

  const result: any = (...args: any[]) => {
    return _body(...args)
  }

  Object.defineProperty(result, 'super', {
    get: () => {
      return _super
    },
  })

  Object.defineProperty(result, 'body', {
    get: () => {
      return _body
    },
    set: v => {
      _body = v
    },
  })

  return result
}

/**
 * Gets whether the specified icon is FontAwesome or not.
 */
function isFontAwesome(icon: string | undefined | null): boolean {
  if (!icon) return false
  return Boolean(icon.match(/fa[sbr] fa-/))
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

//==========================================================================
//
//  Export
//
//==========================================================================

export { constants, extensionMethod, isFontAwesome, showNotification, getBaseURL }
export * from '@/base/screen'
export * from '@/base/style'
