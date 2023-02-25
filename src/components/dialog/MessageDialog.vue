<style lang="scss" scoped>
.container {
  min-width: 300px;
  body.screen--lg &,
  body.screen--xl &,
  body.screen--md & {
    max-width: 70vw;
  }
  body.screen--xs &,
  body.screen--sm & {
    max-width: 90vw;
  }
}

.title {
  @extend %text-h6;
}

.message {
  white-space: pre-line;
}
</style>

<template>
  <PromiseDialog ref="dialog" class="MessageDialog" :defaultResult="false">
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
      <q-card-actions class="row items-center justify-end">
        <template v-if="haveButtons">
          <q-btn
            v-for="button in params.buttons"
            :key="button.value"
            flat
            rounded
            color="primary"
            :label="button.label"
            @click="close(button.value)"
          />
        </template>
        <template v-else>
          <!-- Cancel button -->
          <q-btn
            v-show="params.type === 'confirm'"
            flat
            rounded
            color="primary"
            :label="$t('common.cancel')"
            @click="close(false)"
          />
          <!-- OK button -->
          <q-btn flat rounded color="primary" :label="$t('common.ok')" @click="close(true)" />
        </template>
      </q-card-actions>
    </q-card>
  </PromiseDialog>
</template>

<script lang="ts">
import { type DeepReadonly, isImplemented } from 'js-common-lib'
import { type UnwrapNestedRefs, computed, defineComponent, reactive, ref } from 'vue'
import PromiseDialog from '@/components/dialog/PromiseDialog.vue'
import merge from 'lodash/merge'

//==========================================================================
//
//  Definition
//
//==========================================================================

type MessageDialog = DeepReadonly<MessageDialog.Props> & MessageDialog.Features

namespace MessageDialog {
  export interface Props {}

  export type Features = UnwrapNestedRefs<WrapFeatures>

  export interface WrapFeatures {
    open<T = boolean>(params: MessageDialogOpenParams): Promise<T>
    close<T = boolean>(result: T): void
  }
}

interface MessageDialogOpenParams {
  title?: string
  message?: string
  type?: MessageDialogType
  /**
   * Specify the information for the buttons that appear at the bottom of the dialog.
   * - label: Label to be displayed on the button
   * - value: Value to identify which button was used to close the dialog
   */
  buttons?: { label: string; value: any }[]
}

type MessageDialogType = 'alert' | 'confirm'

//==========================================================================
//
//  Implementation
//
//==========================================================================

const MessageDialog = defineComponent({
  components: {
    PromiseDialog,
  },

  props: {},

  setup(props: MessageDialog.Props) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const dialog = ref<PromiseDialog<void, boolean>>()

    const params = reactive<MessageDialogOpenParams>({
      type: 'alert',
      title: undefined,
      message: undefined,
      buttons: undefined,
    })

    const haveButtons = computed(() => Boolean(params.buttons?.length))

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const open: MessageDialog.WrapFeatures['open'] = p => {
      if (p) {
        const { title, message, type, buttons } = p
        merge(params, { title, message, type, buttons })
      }

      return dialog.value!.open() as Promise<any>
    }

    const close: MessageDialog.WrapFeatures['close'] = closedValue => {
      dialog.value!.close(closedValue as any)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      dialog,
      params,
      haveButtons,
      open,
      close,
    }

    return isImplemented<MessageDialog.WrapFeatures, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default MessageDialog
</script>
