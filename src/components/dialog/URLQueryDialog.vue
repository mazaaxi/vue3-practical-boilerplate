<template>
  <q-dialog
    ref="dialog"
    v-model="opened"
    :persistent="persistent"
    @before-show="onBeforeShow"
    @show="onShow"
    @before-hide="onBeforeHide"
    @hide="onHide"
  >
    <slot></slot>
  </q-dialog>
</template>

<script lang="ts">
import { SetupContext, defineComponent } from 'vue'
import { BasePromiseDialog } from '@/components/dialog/PromiseDialog.vue'
import { QDialog } from 'quasar'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { extensibleMethod } from '@/base'
import { isImplemented } from 'js-common-lib'
import { useRouter } from '@/router'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type URLQueryDialog<PARAMS = void, RESULT = void> = URLQueryDialog.Props<RESULT> &
  URLQueryDialog.Features<PARAMS, RESULT>

namespace URLQueryDialog {
  export interface Props<RESULT> extends BasePromiseDialog.Props<RESULT> {
    readonly dialogName: string
  }

  export type Features<PARAMS, RESULT> = UnwrapNestedRefs<WrapFeatures<PARAMS, RESULT>>

  export interface WrapFeatures<PARAMS, RESULT>
    extends BasePromiseDialog.WrapFeatures<PARAMS, RESULT> {}
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

const URLQueryDialog = defineComponent({
  name: 'URLQueryDialog',

  props: {
    ...BasePromiseDialog.props,
    dialogName: { type: String, required: true },
  },

  emits: { ...BasePromiseDialog.emits },

  setup<PARAMS, RESULT>(
    props: URLQueryDialog.Props<RESULT>,
    ctx: SetupContext<typeof BasePromiseDialog.emits>
  ) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const base = BasePromiseDialog.setup<PARAMS, RESULT>(props, ctx)

    const router = useRouter()

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    /**
     * Give a URL query to open the dialog and open the dialog.
     *
     * Example of a URL with a dialog query:
     *   http://localhost:5040/ja/home?dialogName=anchor&dialogParams=%257B%2522title%2522%253A%2522%25E3%2582%25BF%25E3%2582%25A4%25E3%2583%2588%25E3%2583%25AB%2522%252C%2522message%2522%253A%2522%25E3%2583%25A1%25E3%2583%2583%25E3%2582%25BB%25E3%2583%25BC%25E3%2582%25B8%2522%257D
     *
     * @param params Specify the parameters of the URL query.
     */
    const open = (base.open.body = extensibleMethod<URLQueryDialog<PARAMS, RESULT>['open']>(
      params => {
        base.closeResult.value = props.defaultResult as any

        return new Promise((resolve, reject) => {
          base.closeResolve.value = resolve

          // start transition to the dialog specified by the argument
          router
            .push({
              path: router.currentRoute.path,
              query: Object.assign({}, router.currentRoute.query, {
                dialogName: props.dialogName,
                dialogParams: params ? encodeURIComponent(JSON.stringify(params)) : undefined,
              }),
            })
            .then(() => {
              base.opened.value = true
            })
        })
      }
    ))

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    const onHide = (base.onHide.body = extensibleMethod(() => {
      URLQueryDialogHelper.clearQuery()
      base.onHide.super()
    }))

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      ...base,
      open,
      onHide,
    }

    return isImplemented<URLQueryDialog.WrapFeatures<PARAMS, RESULT>, typeof result>(result)
  },
})

namespace URLQueryDialogHelper {
  /**
   * Build a query to open a dialog.
   *
   * Example of a dialog query:
   *   http://localhost:5040/ja/home?dialogName=anchor&dialogParams=%257B%2522title%2522%253A%2522%25E3%2582%25BF%25E3%2582%25A4%25E3%2583%2588%25E3%2583%25AB%2522%252C%2522message%2522%253A%2522%25E3%2583%25A1%25E3%2583%2583%25E3%2582%25BB%25E3%2583%25BC%25E3%2582%25B8%2522%257D
   *
   * @param dialogName Dialog name
   * @param dialogParams Parameters to be passed to the dialog
   */
  export function buildQuery<NAMES>(dialogName: NAMES, dialogParams?: any): string {
    let result = `dialogName=${dialogName}`
    if (dialogParams) {
      result += `&dialogParams=${encodeURIComponent(JSON.stringify(dialogParams))}`
    }
    return result
  }

  /**
   * Get a dialog query given to a URL of a current route.
   */
  export function getQuery<NAMES>():
    | { dialogName: NAMES; dialogParams?: Record<string, unknown> }
    | undefined {
    const router = useRouter()

    const dialogName: NAMES | undefined = router.currentRoute.query.dialogName as any
    if (!dialogName) return

    let dialogParams: Record<string, unknown> | undefined
    const paramStr = router.currentRoute.query.dialogParams as string
    if (paramStr) {
      dialogParams = JSON.parse(decodeURIComponent(paramStr))
    }
    return { dialogName, dialogParams }
  }

  /**
   * Remove a dialog query given to a URL of a current route.
   */
  export function clearQuery() {
    const router = useRouter()

    const query = { ...router.currentRoute.query }
    delete query.dialogName
    delete query.dialogParams
    router.push({
      path: router.currentRoute.path,
      query,
    })
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export default URLQueryDialog
export { URLQueryDialogHelper }
</script>
