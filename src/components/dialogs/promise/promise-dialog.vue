<template>
  <q-dialog ref="dialog" v-model="opened" :persistent="persistent" @before-show="onBeforeShow" @show="onShow" @before-hide="onBeforeHide">
    <slot></slot>
  </q-dialog>
</template>

<script lang="ts">
import { Ref, SetupContext, defineComponent, ref } from 'vue'
import { QDialog } from 'quasar'
import { UnwrapNestedRefs } from '@vue/reactivity'
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

  export type Features<RESULT = void> = UnwrapNestedRefs<RawFeatures<RESULT>>

  export interface RawFeatures<RESULT = void> {
    readonly opened: Ref<boolean>
    open(params: OpenParams): Promise<RESULT>
    close(result: RESULT): void
  }
}

type OpenParams = {
  onBeforeOpen?: () => void
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
    'before-show': null,
    show: null,
    'before-hide': null,
  },

  setup<RESULT = void>(props: PromiseDialog.Props, ctx: SetupContext<{ 'before-show': null; show: null; 'before-hide': null }>) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const dialog = ref<QDialog>()

    let closeResolve: ((value: RESULT) => void) | undefined

    let onBeforeOpen: () => void = () => {}
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
      onBeforeOpen = params.onBeforeOpen || (() => {})
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

    function onBeforeShow() {
      ctx.emit('before-show')
      onBeforeOpen()
    }

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
      onBeforeShow,
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
