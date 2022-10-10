import { DialogNames, DialogsSet } from '@/components/dialogs/dialogs-set'
import { Ref, computed, reactive, watch } from 'vue'
import { Dialog } from '@/components/dialogs/base'
import type MessageDialog from '@/components/dialogs/message/MessageDialog.vue'
import { UnwrapNestedRefs } from '@vue/reactivity'
import debounce from 'lodash/debounce'
import { isImplemented } from 'js-common-lib'
import { useRouter } from '@/router'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type DialogContainer = UnwrapNestedRefs<WrapDialogContainer>

interface WrapDialogContainer extends DialogsSet.WrapFeatures {
  /**
   * Build a query to open a dialog.
   *
   * Example of a dialog query:
   *   dialogName=signIn&dialogParams=%257B%2522account%2522%253A%2522taro%2522%257D
   *
   * @param dialogName Dialog name
   * @param dialogParams Parameters to be passed to the dialog
   */
  buildQuery(dialogName: DialogNames, dialogParams?: any): string

  /**
   * Get a dialog query given to a URL of a current route.
   */
  getQuery(): { dialogName: DialogNames; dialogParams?: Record<string, unknown> } | undefined

  /**
   * Remove a dialog query given to a URL of a current route.
   */
  clearQuery(): void
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace DialogContainer {
  let instance: DialogContainer

  export function setupDialogs(dialogsSet: Ref<DialogsSet | undefined>): DialogContainer {
    instance = reactive(newWrapInstance(dialogsSet))
    return instance
  }

  export function useDialogs(): DialogContainer {
    if (!instance) {
      throw new Error(`DialogContainer' has not been setup yet.`)
    }
    return instance
  }

  function newWrapInstance(dialogsSet: Ref<DialogsSet | undefined>) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const router = useRouter()

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const message = computed(() => getDialogsSet().message)

    const anchor = computed(() => {
      const open: MessageDialog['open'] = params => openDialog('anchor', params)
      return { ...getDialogsSet().anchor, open }
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const buildQuery: DialogContainer['buildQuery'] = (dialogName, dialogParams) => {
      let result = `dialogName=${dialogName}`
      if (dialogParams) {
        result += `&dialogParams=${encodeURIComponent(JSON.stringify(dialogParams))}`
      }
      return result
    }

    const getQuery: DialogContainer['getQuery'] = () => {
      const dialogName = router.currentRoute.query.dialogName as DialogNames | undefined
      if (!dialogName) return

      let dialogParams: Record<string, unknown> | undefined
      const paramStr = router.currentRoute.query.dialogParams as string
      if (paramStr) {
        dialogParams = JSON.parse(decodeURIComponent(paramStr))
      }
      return { dialogName, dialogParams }
    }

    const clearQuery: DialogContainer['clearQuery'] = debounce(() => {
      const query = { ...router.currentRoute.query }
      delete query.dialogName
      delete query.dialogParams
      router.push({
        path: router.currentRoute.path,
        query,
      })
    })

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    /**
     * Give a URL query to open the dialog and open a dialog.
     *
     * Example of a URL with a dialog query:
     *   https://example.com/views/abc-page?dialogName=signIn&dialogParams=%257B%2522account%2522%253A%2522taro%2522%257D
     *
     * @param dialogName Name of a dialog.
     * @param dialogParams Parameters to pass to a dialog.
     */
    function openDialog(dialogName: string, dialogParams?: any): Promise<any> {
      return new Promise((resolve, reject) => {
        // start transition to a dialog specified by the argument
        router
          .push({
            path: router.currentRoute.path,
            query: Object.assign({}, router.currentRoute.query, {
              dialogName,
              dialogParams: dialogParams ? encodeURIComponent(JSON.stringify(dialogParams)) : undefined,
            }),
          })
          .then(() => {
            // get a dialog query from an URL
            const info = getQuery()
            if (!info) {
              reject(new Error('A dialog query could not be retrieved from an URL.'))
              return
            }

            // if the dialog query can be obtained from the URL, get an instance of a target dialog.
            const dialog = getDialog(info.dialogName)
            if (!dialog) return

            // open the target dialog
            dialog.open(info.dialogParams).then(result => {
              // remove the dialog query from the URL when the dialog is closed
              clearQuery()
              // notify that the dialog has been closed
              resolve(result)
            })
          })
      })
    }

    /**
     * Get a dialog information from an URL of a current route, and if the dialog
     * information is retrieved, open the dialog.
     */
    function openDialogByCurrentRoute() {
      // get a dialog query from an URL
      const info = getQuery()
      if (!info) return

      // if the dialog query can be obtained from the URL, get an instance of a target dialog.
      const dialog = getDialog(info.dialogName)
      if (!dialog) return

      // open the target dialog
      dialog.open(info.dialogParams).then(() => {
        // remove the dialog query from the URL when the dialog is closed
        clearQuery()
      })
    }

    function getDialogsSet(): DialogsSet {
      if (!dialogsSet.value) {
        throw new Error(`DialogsSet' has not been setup yet.`)
      }
      return dialogsSet.value
    }

    function getDialog(dialogName: DialogNames): Dialog<any, any> | undefined {
      const dialog = getDialogsSet()[dialogName]
      if (!dialogName) {
        console.warn(`There is no dialog named ${dialogName}.`)
        return
      }
      return dialog
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    router.isReady().then(() => {
      openDialogByCurrentRoute()
    })

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      message,
      anchor,
      buildQuery,
      getQuery,
      clearQuery,
    }

    return isImplemented<WrapDialogContainer, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupDialogs, useDialogs } = DialogContainer
export { DialogContainer, setupDialogs, useDialogs }
export * from '@/components/dialogs/dialogs-set'
export * from '@/components/dialogs/message'
export * from '@/components/dialogs/promise'
export * from '@/components/dialogs/base'
