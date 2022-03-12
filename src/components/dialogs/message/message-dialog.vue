<style lang="sass" scoped>
@import 'src/styles/app.variables'

.container
  min-width: 300px
  body.screen--lg &, body.screen--xl &, body.screen--md &
    max-width: 70vw
  body.screen--xs &, body.screen--sm &
    max-width: 90vw

.title
  @extend %text-h6

.message
  white-space: pre-line
</style>

<template>
  <PromiseDialog ref="dialog" class="MessageDialog" :persistent="params.persistent">
    <q-card class="container">
      <!-- Title -->
      <q-card-section v-if="Boolean(params.title)">
        <div class="title">{{ params.title }}</div>
      </q-card-section>

      <!-- Content area -->
      <q-card-section class="row items-center">
        <div class="message">{{ params.message }}</div>
      </q-card-section>

      <!-- Button area -->
      <q-card-actions class="layout horizontal center end-justified">
        <!-- Cancel button -->
        <q-btn v-show="params.type === 'confirm'" flat rounded color="primary" :label="$t('common.cancel')" @click="close(false)" />
        <!-- OK button -->
        <q-btn flat rounded color="primary" :label="$t('common.ok')" @click="close(true)" />
      </q-card-actions>
    </q-card>
  </PromiseDialog>
</template>

<script lang="ts">
import { PromiseDialog, PromiseDialogComp } from '@/components/dialogs/promise'
import { PropType, defineComponent, reactive, ref, watch } from 'vue'
import { Dialog } from '@/components/dialogs/base'
import merge from 'lodash/merge'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface MessageDialog extends Dialog<MessageDialog.Props | void, boolean>, MessageDialog.Props {}

namespace MessageDialog {
  export interface Props {
    readonly modelValue?: boolean
    readonly type?: 'alert' | 'confirm'
    readonly title?: string
    readonly message?: string
    readonly persistent?: boolean
  }
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

const MessageDialogComp = defineComponent({
  name: 'MessageDialog',

  components: {
    PromiseDialog: PromiseDialogComp,
  },

  props: {
    modelValue: { type: Boolean, default: false },
    type: { type: String as PropType<'alert' | 'confirm'>, default: 'alert' },
    title: { type: String },
    message: { type: String },
    persistent: { type: Boolean, default: false },
  },

  emits: {
    'update:modelValue': null,
  },

  setup(props: MessageDialog.Props, ctx) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const dialog = ref<PromiseDialog<boolean>>()

    const params = reactive<Required<Omit<MessageDialog.Props, 'modelValue'>>>({
      type: props.type!,
      title: props.title ?? '',
      message: props.message ?? '',
      persistent: props.persistent ?? false,
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const open: MessageDialog['open'] = p => {
      if (p) {
        const { type, title, message, persistent } = p
        merge(params, { type, title, message, persistent })
      }
      return dialog.value!.open({
        onBeforeClose: () => close(false),
      })
    }

    const close: MessageDialog['close'] = isOK => {
      dialog.value!.close(isOK)
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    watch(
      () => dialog.value?.opened,
      (newValue, oldValue) => {
        ctx.emit('update:modelValue', Boolean(newValue))
      }
    )

    watch(
      () => props.modelValue,
      (newValue, oldValue) => {
        if (newValue) {
          dialog.value!.open({
            onBeforeClose: () => close(false),
          })
        } else {
          close(false)
        }
      }
    )

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      dialog,
      params,
      open,
      close,
    }
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default MessageDialogComp
export { MessageDialog }
</script>
