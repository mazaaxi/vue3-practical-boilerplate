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
      <q-card-actions class="layout horizontal center end-justified">
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
      </q-card-actions>
    </q-card>
  </PromiseDialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import type { Dialog } from '@/dialogs'
import { PromiseDialog } from '@/components/dialog'
import type { UnwrapNestedRefs } from 'vue'
import { isImplemented } from 'js-common-lib'
import merge from 'lodash/merge'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type MessageDialog = Dialog<MessageDialogOpenParams | void, boolean> &
  MessageDialog.Props &
  MessageDialog.Features

namespace MessageDialog {
  export interface Props {}

  export type Features = UnwrapNestedRefs<WrapFeatures>

  export interface WrapFeatures {
    readonly params: MessageDialogOpenParams
  }
}

interface MessageDialogOpenParams {
  readonly type?: MessageDialogType
  readonly title?: string
  readonly message?: string
}

type MessageDialogType = 'alert' | 'confirm'

//==========================================================================
//
//  Implementation
//
//==========================================================================

const MessageDialog = defineComponent({
  name: 'MessageDialog',

  components: {
    PromiseDialog,
  },

  props: {},

  setup(props: MessageDialog.Props, ctx) {
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
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const open: MessageDialog['open'] = p => {
      if (p) {
        const { type, title, message } = p
        merge(params, { type, title, message })
      }

      return dialog.value!.open()
    }

    const close: MessageDialog['close'] = isOK => {
      dialog.value!.close(isOK)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      dialog,
      params,
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
