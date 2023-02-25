import AppDialogContainer, { AppDialogNames } from '@/dialogs/AppDialogContainer.vue'
import { type BaseDialog, URLQueryDialogHelper } from '@/components'
import type { Ref, UnwrapNestedRefs } from 'vue'
import { computed, reactive } from 'vue'
import { AppRouter } from '@/router'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Definition
//
//==========================================================================

//--------------------------------------------------
//  AppDialog
//--------------------------------------------------

interface AppDialog<PARAMS = void, RESULT = void> extends BaseDialog<PARAMS, RESULT> {}

//--------------------------------------------------
//  AppDialogs
//--------------------------------------------------

type AppDialogs = UnwrapNestedRefs<WrapAppDialogs>

interface WrapAppDialogs extends AppDialogContainer.WrapFeatures {
  /**
   * @see URLQueryDialogHelper.buildQuery
   */
  buildQuery(dialogName: AppDialogNames, dialogParams?: any): string

  /**
   * @see URLQueryDialogHelper.getQuery
   */
  getQuery(): { dialogName: AppDialogNames; dialogParams?: Record<string, unknown> } | undefined

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

namespace AppDialogs {
  let instance: AppDialogs

  export function setup(dialogContainer: Ref<AppDialogContainer | undefined>): AppDialogs {
    instance = reactive(newWrapInstance(dialogContainer))
    return instance
  }

  export function use(): AppDialogs {
    if (!instance) {
      throw new Error('`AppDialogs` has not been setup yet.')
    }
    return instance
  }

  function newWrapInstance(dialogContainer: Ref<AppDialogContainer | undefined>) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const router = AppRouter.use()

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const message = computed(() => getDialogs().message)
    const anchor = computed(() => getDialogs().anchor)
    const signIn = computed(() => getDialogs().signIn)

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const buildQuery: AppDialogs['buildQuery'] = URLQueryDialogHelper.buildQuery

    const getQuery: AppDialogs['getQuery'] = URLQueryDialogHelper.getQuery

    const clearQuery: AppDialogs['clearQuery'] = URLQueryDialogHelper.clearQuery

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

    function getDialogs(): AppDialogContainer {
      if (!dialogContainer.value) {
        throw new Error('`AppDialogContainer` has not been setup yet.')
      }
      return dialogContainer.value
    }

    function getDialog(dialogName: AppDialogNames): AppDialog<any, any> | undefined {
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
      signIn,
      buildQuery,
      getQuery,
      clearQuery,
    }

    return isImplemented<WrapAppDialogs, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AppDialogs, AppDialogContainer }
export type { AppDialog }
export * from '@/dialogs'
