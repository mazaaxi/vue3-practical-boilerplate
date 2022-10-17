<template>
  <div class="DialogContainer">
    <MessageDialog ref="message" />
    <AnchorDialog ref="anchor" />
  </div>
</template>

<script lang="ts">
import { ComputedRef, defineComponent, ref } from 'vue'
import { AnchorDialog } from '@/dialogs/anchor'
import { MessageDialog } from '@/dialogs/message'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type DialogContainer = DialogContainer.Props & DialogContainer.Features

namespace DialogContainer {
  export interface Props {}

  export type Features = UnwrapNestedRefs<WrapFeatures>

  export interface WrapFeatures {
    readonly message: ComputedRef<MessageDialog>
    readonly anchor: ComputedRef<AnchorDialog>
  }
}

type DialogNames = 'message' | 'anchor'
const DialogNames: DialogNames[] = ['message', 'anchor']

//==========================================================================
//
//  Implementation
//
//==========================================================================

const DialogContainer = defineComponent({
  name: 'DialogContainer',

  components: {
    MessageDialog,
    AnchorDialog,
  },

  setup(props: DialogContainer.Props, ctx) {
    const message = ref() as ComputedRef<MessageDialog>
    const anchor = ref() as ComputedRef<AnchorDialog>

    const result = {
      message,
      anchor,
    }

    return isImplemented<DialogContainer.WrapFeatures, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default DialogContainer
export { DialogNames }
</script>
