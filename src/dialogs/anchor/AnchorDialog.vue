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
  <URLQueryDialog ref="dialog" class="AnchorDialog" dialogName="anchor">
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
        <!-- OK button -->
        <q-btn flat rounded color="primary" :label="$t('common.ok')" @click="close()" />
      </q-card-actions>
    </q-card>
  </URLQueryDialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import type { Dialog } from '@/dialogs'
import { URLQueryDialog } from '@/components/dialog'
import type { UnwrapNestedRefs } from 'vue'
import { isImplemented } from 'js-common-lib'
import merge from 'lodash/merge'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type AnchorDialog = Dialog<AnchorDialogOpenParams, void> &
  AnchorDialog.Props &
  AnchorDialog.Features

namespace AnchorDialog {
  export interface Props {}

  export type Features = UnwrapNestedRefs<WrapFeatures>

  export interface WrapFeatures {
    readonly params: AnchorDialogOpenParams
  }
}

interface AnchorDialogOpenParams {
  title: string
  message: string
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

const AnchorDialog = defineComponent({
  name: 'AnchorDialog',

  components: {
    URLQueryDialog,
  },

  props: {},

  setup(props: AnchorDialog.Props, ctx) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const dialog = ref<URLQueryDialog<AnchorDialogOpenParams, void>>()

    const params = reactive<AnchorDialogOpenParams>({
      title: '',
      message: '',
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const open: AnchorDialog['open'] = p => {
      const { title, message } = p
      merge(params, { title, message })

      return dialog.value!.open({ title, message })
    }

    const close: AnchorDialog['close'] = () => {
      dialog.value!.close()
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

    return isImplemented<AnchorDialog.WrapFeatures, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default AnchorDialog
</script>
