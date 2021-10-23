<template>
  <div class="DialogContainer">
    <MessageDialog ref="messageDialog" />
    <MessageDialog ref="anchorDialog" />
  </div>
</template>

<script lang="ts">
import { Dialog, DialogNames } from '@/dialogs/base'
import { Ref, UnwrapRef, defineComponent, ref, watch } from 'vue'
import { useRouter, useRouterUtils } from '@/router'
import MessageDialog from '@/dialogs/modules/message-dialog.vue'
import debounce from 'lodash/debounce'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface DialogContainer extends DialogContainer.Props, DialogContainer.Features {}

namespace DialogContainer {
  export interface Props {}

  export type Features = UnwrapRef<DialogContainer.RawFeatures>

  export interface RawFeatures {
    readonly message: { open: MessageDialog['open'] }
    readonly anchor: { open: MessageDialog['open'] }

    getQuery(): { dialogName: DialogNames; dialogParams?: Record<string, unknown> } | undefined
    clearQuery(): void
  }
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

const DialogContainer = defineComponent({
  name: 'DialogContainer',

  components: {
    MessageDialog,
  },

  setup: (props: DialogContainer.Props, ctx) => {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const router = useRouter()
    const { currentRoute } = useRouterUtils()

    const messageDialog = ref() as Ref<MessageDialog>
    const anchorDialog = ref() as Ref<MessageDialog>

    const dialogs: { [name: string]: Ref<Dialog<any, any>> } = {
      message: messageDialog,
      anchor: anchorDialog,
    }

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const message: DialogContainer['message'] = {
      open: params => messageDialog.value.open(params),
    }

    const anchor: DialogContainer['anchor'] = {
      open: params => openDialog('anchor', params),
    }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const getQuery: DialogContainer['getQuery'] = () => {
      const dialogName = currentRoute.query.dialogName as DialogNames | undefined
      if (!dialogName) return

      let dialogParams: Record<string, unknown> | undefined
      const paramStr = currentRoute.query.dialogParams as string
      if (paramStr) {
        dialogParams = JSON.parse(decodeURIComponent(paramStr))
      }
      return { dialogName, dialogParams }
    }

    const clearQuery: DialogContainer['clearQuery'] = debounce(() => {
      const query = { ...currentRoute.query }
      delete query.dialogName
      delete query.dialogParams
      router.push({
        path: currentRoute.path,
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
        // monitor a transition to a dialog
        const stopWatch = watch(
          () => currentRoute.fullPath,
          (newValue, oldValue) => {
            // end monitoring
            stopWatch()

            // get a dialog query from an URL
            const info = getQuery()
            if (!info) {
              reject(new Error('A dialog query could not be retrieved from an URL.'))
              return
            }

            // if the dialog query can be obtained from the URL, get an instance of a target dialog.
            const dialog = dialogs[info.dialogName]
            if (!dialog) {
              reject(new Error(`There is no dialog named ${info.dialogName}.`))
              return
            }

            // open the target dialog
            dialog.value.open(info.dialogParams).then(result => {
              // remove the dialog query from the URL when the dialog is closed
              clearQuery()
              // notify that the dialog has been closed
              resolve(result)
            })
          }
        )

        // start transition to a dialog specified by the argument
        router.push({
          path: currentRoute.path,
          query: Object.assign({}, currentRoute.query, {
            dialogName,
            dialogParams: dialogParams ? encodeURIComponent(JSON.stringify(dialogParams)) : undefined,
          }),
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
      const dialog = dialogs[info.dialogName]
      if (!dialog) {
        console.warn(`There is no dialog named ${info.dialogName}.`)
        return
      }

      // open the target dialog
      dialog.value.open(info.dialogParams).then(() => {
        // remove the dialog query from the URL when the dialog is closed
        clearQuery()
      })
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
      messageDialog,
      anchorDialog,
      message,
      anchor,
      getQuery,
      clearQuery,
    }

    return isImplemented<DialogContainer.RawFeatures, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default DialogContainer
</script>
