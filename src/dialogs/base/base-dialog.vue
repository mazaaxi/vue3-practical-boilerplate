<template>
  <q-dialog ref="el" v-model="opened" :persistent="persistent" @hide="close(false)">
    <slot></slot>
  </q-dialog>
</template>

<script lang="ts">
import { Ref, SetupContext, UnwrapRef, defineComponent, ref } from 'vue'
import { QDialog } from 'quasar'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface BaseDialog<RESULT = void> extends BaseDialog.Props, BaseDialog.Features<RESULT> {}

namespace BaseDialog {
  export interface Props {
    readonly persistent?: boolean
  }

  export type Features<RESULT = void> = UnwrapRef<BaseDialog.RawFeatures<RESULT>>

  export interface RawFeatures<RESULT = void> {
    readonly opened: Ref<boolean>
    open(): Promise<RESULT>
    close(result: RESULT): void
  }
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

const BaseDialog = defineComponent({
  name: 'BaseDialog',

  props: {
    persistent: { type: Boolean, default: false },
  },

  setup<RESULT = void>(props: BaseDialog.Props, ctx: SetupContext) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const dialog = ref<QDialog>()

    let closeResolve: ((value: RESULT) => void) | undefined

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const opened = ref(false)

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const open: BaseDialog<RESULT>['open'] = () => {
      return new Promise<RESULT>(resolve => {
        closeResolve = resolve
        opened.value = true
      })
    }

    const close: BaseDialog<RESULT>['close'] = value => {
      closeResolve?.(value)
      closeResolve = undefined
      opened.value = false
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      dialog,
      opened,
      open,
      close,
    }

    return isImplemented<BaseDialog.RawFeatures<RESULT>, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default BaseDialog
</script>
