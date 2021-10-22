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
  <BaseDialog ref="dialog" class="MessageDialog" :persistent="params.persistent">
    <q-card class="container">
      <!-- タイトル -->
      <q-card-section v-if="Boolean(params.title)">
        <div class="title">{{ params.title }}</div>
      </q-card-section>

      <!-- コンテンツエリア -->
      <q-card-section class="row items-center">
        <div class="message">{{ params.message }}</div>
      </q-card-section>

      <!-- ボタンエリア -->
      <q-card-actions class="layout horizontal center end-justified">
        <!-- CANCELボタン -->
        <q-btn v-show="params.type === 'confirm'" flat rounded color="primary" :label="$t('common.cancel')" @click="closeDialog(false)" />
        <!-- OKボタン -->
        <q-btn flat rounded color="primary" :label="$t('common.ok')" @click="closeDialog(true)" />
      </q-card-actions>
    </q-card>
  </BaseDialog>
</template>

<script lang="ts">
import { BaseDialog, Dialog } from '@/dialogs/base'
import { PropType, defineComponent, reactive, ref, watch } from 'vue'
import merge from 'lodash/merge'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface MessageDialog extends Dialog<MessageDialog.Props, boolean>, MessageDialog.Props {}

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

const MessageDialog = defineComponent({
  name: 'MessageDialog',

  components: {
    BaseDialog,
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

    const dialog = ref<BaseDialog<boolean>>()

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
      return dialog.value!.open()
    }

    const close: MessageDialog['close'] = () => {
      dialog.value!.close(false)
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function closeDialog(isConfirmed: boolean): void {
      dialog.value!.close(isConfirmed)
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
        newValue ? dialog.value!.open() : dialog.value!.close(false)
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
      closeDialog,
    }
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default MessageDialog
</script>
