<template>
  <div class="DialogsSet">
    <MessageDialog ref="message" />
    <MessageDialog ref="anchor" />
  </div>
</template>

<script lang="ts">
import { ComputedRef, defineComponent, ref } from 'vue'
import MessageDialog from '@/components/dialogs/message/message-dialog.vue'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type DialogsSet = DialogsSet.Props & DialogsSet.Features

namespace DialogsSet {
  export interface Props {}

  export type Features = UnwrapNestedRefs<RawFeatures>

  export interface RawFeatures {
    readonly message: ComputedRef<MessageDialog>
    readonly anchor: ComputedRef<MessageDialog>
  }
}

type DialogNames = 'message' | 'anchor'
const DialogNames: DialogNames[] = ['message', 'anchor']

//==========================================================================
//
//  Implementation
//
//==========================================================================

const DialogsSet = defineComponent({
  name: 'DialogsSet',

  components: {
    MessageDialog,
  },

  setup(props: DialogsSet.Props, ctx) {
    const message = ref() as ComputedRef<MessageDialog>
    const anchor = ref() as ComputedRef<MessageDialog>

    const result = {
      message,
      anchor,
    }

    return isImplemented<DialogsSet.RawFeatures, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default DialogsSet
export { DialogNames }
</script>
