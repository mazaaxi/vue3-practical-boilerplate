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
import { type DeepReadonly, extensibleMethod, isImplemented } from 'js-common-lib'
import { type Ref, type SetupContext, type UnwrapNestedRefs, defineComponent, ref } from 'vue'
import type { BaseDialog } from '@/components/dialog/base'
import type { QDialog } from 'quasar'

//==========================================================================
//
//  Base
//
//==========================================================================

namespace BasePromiseDialog {
  export interface Props<RESULT> {
    defaultResult: RESULT
    persistent: boolean
  }

  export type Features<PARAMS, RESULT> = UnwrapNestedRefs<WrapFeatures<PARAMS, RESULT>>

  export interface WrapFeatures<PARAMS, RESULT> extends BaseDialog<PARAMS, RESULT> {
    readonly opened: Ref<boolean>
  }

  export const props = {
    defaultResult: { default: undefined },
    persistent: { type: Boolean, default: false },
  }

  export const emits = {
    'before-show': null,
    show: null,
    'before-hide': null,
    hide: null,
  }

  export function setup<PARAMS, RESULT>(
    props: PromiseDialog.Props<RESULT>,
    ctx: SetupContext<typeof emits>
  ) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const dialog = ref<QDialog>()

    const opened = ref(false)
    const closeResolve: Ref<((value: any) => void) | undefined> = ref(undefined)
    const closeResult: Ref<any> = ref(undefined)

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const open = extensibleMethod<PromiseDialog<PARAMS, any>['open']>(() => {
      closeResult.value = props.defaultResult

      return new Promise(resolve => {
        closeResolve.value = resolve
        opened.value = true
      })
    })

    const close = extensibleMethod<PromiseDialog<PARAMS, any>['close']>(value => {
      closeResult.value = value
      opened.value = false
    })

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    const onBeforeShow = extensibleMethod(() => {
      ctx.emit('before-show')
    })

    const onShow = extensibleMethod(() => {
      ctx.emit('show')
    })

    const onBeforeHide = extensibleMethod(() => {
      ctx.emit('before-hide')
    })

    const onHide = extensibleMethod(() => {
      closeResolve.value?.(closeResult.value)
      closeResolve.value = undefined

      ctx.emit('hide')
    })

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      dialog,
      opened,
      closeResolve,
      closeResult,
      open,
      close,
      onBeforeShow,
      onShow,
      onBeforeHide,
      onHide,
    }

    return isImplemented<PromiseDialog.WrapFeatures<PARAMS, RESULT>, typeof result>(result)
  }
}

//==========================================================================
//
//  Definition
//
//==========================================================================

type PromiseDialog<PARAMS = void, RESULT = void> = DeepReadonly<PromiseDialog.Props<RESULT>> &
  PromiseDialog.Features<PARAMS, RESULT>

namespace PromiseDialog {
  export type Props<RESULT> = BasePromiseDialog.Props<RESULT>

  export type Features<PARAMS, RESULT> = UnwrapNestedRefs<WrapFeatures<PARAMS, RESULT>>

  export interface WrapFeatures<PARAMS, RESULT>
    extends BasePromiseDialog.WrapFeatures<PARAMS, RESULT> {}
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

const PromiseDialog = defineComponent({
  props: { ...BasePromiseDialog.props },

  emits: { ...BasePromiseDialog.emits },

  setup(props: PromiseDialog.Props<any>, ctx) {
    const base = BasePromiseDialog.setup(props, ctx)
    return { ...base }
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default PromiseDialog
export { BasePromiseDialog }
</script>
