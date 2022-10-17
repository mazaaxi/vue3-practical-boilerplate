import DialogContainer, { DialogNames } from '@/dialogs/DialogContainer.vue'
import { Ref, computed, reactive } from 'vue'
import { URLQueryDialogHelper } from '@/components/dialog/URLQueryDialog.vue'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { isImplemented } from 'js-common-lib'
import { useRouter } from '@/router'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

//--------------------------------------------------
//  Dialog
//--------------------------------------------------

interface Dialog<PARAMS = void, RESULT = void> {
  open(params: PARAMS): Promise<RESULT>
  close(result: RESULT): void
}

//--------------------------------------------------
//  Dialogs
//--------------------------------------------------

type Dialogs = UnwrapNestedRefs<WrapDialogs>

interface WrapDialogs extends DialogContainer.WrapFeatures {
  /**
   * @see URLQueryDialogHelper.buildQuery
   */
  buildQuery(dialogName: DialogNames, dialogParams?: any): string

  /**
   * @see URLQueryDialogHelper.getQuery
   */
  getQuery(): { dialogName: DialogNames; dialogParams?: Record<string, unknown> } | undefined

  /**
   * @see URLQueryDialogHelper.clearQuery
   */
  clearQuery(): void
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace Dialogs {
  let instance: Dialogs

  export function setupDialogs(dialogContainer: Ref<DialogContainer | undefined>): Dialogs {
    instance = reactive(newWrapInstance(dialogContainer))
    return instance
  }

  export function useDialogs(): Dialogs {
    if (!instance) {
      throw new Error('`Dialogs` has not been setup yet.')
    }
    return instance
  }

  function newWrapInstance(dialogContainer: Ref<DialogContainer | undefined>) {
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

    const message = computed(() => getDialogs().message)

    const anchor = computed(() => getDialogs().anchor)

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const buildQuery: Dialogs['buildQuery'] = URLQueryDialogHelper.buildQuery

    const getQuery: Dialogs['getQuery'] = URLQueryDialogHelper.getQuery

    const clearQuery: Dialogs['clearQuery'] = URLQueryDialogHelper.clearQuery

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    /**
     * Get a dialog information from the URL of the current route, and if the dialog
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
      dialog.open(info.dialogParams)
    }

    function getDialogs(): DialogContainer {
      if (!dialogContainer.value) {
        throw new Error('`DialogContainer` has not been setup yet.')
      }
      return dialogContainer.value
    }

    function getDialog(dialogName: DialogNames): Dialog<any, any> | undefined {
      const dialog = getDialogs()[dialogName]
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

    /**
     * When the router is ready, if the URL contains a query for a dialog, open the target dialog.
     */
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

    return isImplemented<WrapDialogs, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupDialogs, useDialogs } = Dialogs
export { DialogContainer, Dialog, setupDialogs, useDialogs }
export * from '@/dialogs'
export * from '@/dialogs/message'
