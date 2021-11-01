import { DialogContainer } from '@/dialogs/modules'
import { DialogNames } from '@/dialogs/base'
import { Ref } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface Dialogs {
  readonly message: DialogContainer['message']
  readonly anchor: DialogContainer['anchor']

  /**
   * Build a query to open a dialog.
   *
   * Example of a dialog query:
   *   dialogName=signIn&dialogParams=%257B%2522account%2522%253A%2522taro%2522%257D
   *
   * @param dialogName ダイアログの名前
   * @param dialogParams ダイアログに渡すパラメータ
   */
  buildQuery(dialogName: DialogNames, dialogParams?: any): string

  /**
   * Get a dialog query given to an URL of a current route.
   */
  getQuery: DialogContainer['getQuery']

  /**
   * Remove a dialog query given to an URL of a current route.
   */
  clearQuery: DialogContainer['clearQuery']
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace Dialogs {
  let instance: Dialogs

  /**
   * Setup dialogs that are commonly used by the application.
   * @param dialogContainer
   *   Specifies a dialog container instantiated in the application's main page.
   */
  export function setupDialogs(dialogContainer: Ref<DialogContainer | undefined>): Dialogs {
    instance = newInstance(dialogContainer)
    return instance
  }

  /**
   * Provides dialogs that are commonly used by the application.
   */
  export function useDialogs(): Dialogs {
    return instance
  }

  function newInstance(dialogContainer: Ref<DialogContainer | undefined>): Dialogs {
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const message: Dialogs['message'] = { open: params => getDialogs().message.open(params) }
    const anchor: Dialogs['anchor'] = { open: params => getDialogs().anchor.open(params) }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const buildQuery: Dialogs['buildQuery'] = (dialogName, dialogParams) => {
      let result = `dialogName=${dialogName}`
      if (dialogParams) {
        result += `&dialogParams=${encodeURIComponent(JSON.stringify(dialogParams))}`
      }
      return result
    }

    const getQuery: Dialogs['getQuery'] = () => getDialogs().getQuery()

    const clearQuery: Dialogs['clearQuery'] = () => getDialogs().clearQuery()

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function getDialogs(): DialogContainer {
      if (!dialogContainer) {
        throw new Error(`'DialogContainer' is not provided.`)
      }
      if (!dialogContainer.value) {
        throw new Error(`'DialogContainer' has not yet been instantiated.`)
      }
      return dialogContainer.value
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      message,
      anchor,
      buildQuery,
      getQuery,
      clearQuery,
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupDialogs, useDialogs } = Dialogs
export { Dialogs, setupDialogs, useDialogs }
export * from '@/dialogs/base'
export * from '@/dialogs/modules'
