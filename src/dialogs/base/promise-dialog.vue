<template>
  <q-dialog ref="dialog" v-model="opened" :persistent="persistent" @show="onShow" @before-hide="onBeforeHide">
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

interface PromiseDialog<RESULT = void> extends PromiseDialog.Props, PromiseDialog.Features<RESULT> {}

namespace PromiseDialog {
  export interface Props {
    readonly persistent?: boolean
  }

  export type Features<RESULT = void> = UnwrapRef<PromiseDialog.RawFeatures<RESULT>>

  export interface RawFeatures<RESULT = void> {
    readonly opened: Ref<boolean>
    open(params: OpenParams): Promise<RESULT>
    close(result: RESULT): void
  }
}

type OpenParams = {
  onAfterOpen?: () => void
  onBeforeClose: () => void
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

const PromiseDialogComp = defineComponent({
  name: 'PromiseDialog',

  props: {
    persistent: { type: Boolean, default: false },
  },

  emits: {
    show: null,
    'before-hide': null,
  },

  setup<RESULT = void>(props: PromiseDialog.Props, ctx: SetupContext<{ show: null; 'before-hide': null }>) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const dialog = ref<QDialog>()

    let closeResolve: ((value: RESULT) => void) | undefined

    let onAfterOpen: () => void = () => {}
    let onBeforeClose: () => void = () => {}

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

    const open: PromiseDialog<RESULT>['open'] = params => {
      onAfterOpen = params.onAfterOpen || (() => {})
      onBeforeClose = params.onBeforeClose || (() => {})
      return new Promise<RESULT>(resolve => {
        closeResolve = resolve
        opened.value = true
      })
    }

    const close: PromiseDialog<RESULT>['close'] = value => {
      closeResolve?.(value)
      closeResolve = undefined
      opened.value = false
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    function onShow() {
      ctx.emit('show')
      onAfterOpen()
    }

    function onBeforeHide() {
      ctx.emit('before-hide')
      onBeforeClose()
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
      onShow,
      onBeforeHide,
    }

    return isImplemented<PromiseDialog.RawFeatures<RESULT>, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default PromiseDialogComp
export { PromiseDialog }
</script>
