<template>
  <div class="AppDialogContainer">
    <MessageDialog ref="message" />
    <AnchorDialog ref="anchor" />
    <SignInDialog ref="signIn" />
  </div>
</template>

<script lang="ts">
import type { ComputedRef, UnwrapNestedRefs } from 'vue'
import { defineComponent, ref } from 'vue'
import { AnchorDialog } from '@/dialogs/anchor'
import { MessageDialog } from '@/dialogs/message'
import { SignInDialog } from '@/dialogs/sign-in'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type AppDialogContainer = AppDialogContainer.Props & AppDialogContainer.Features

namespace AppDialogContainer {
  export interface Props {}

  export type Features = UnwrapNestedRefs<WrapFeatures>

  export interface WrapFeatures {
    readonly message: ComputedRef<MessageDialog>
    readonly anchor: ComputedRef<AnchorDialog>
    readonly signIn: ComputedRef<SignInDialog>
  }
}

type AppDialogNames = 'message' | 'anchor' | 'signIn'
const AppDialogNames: AppDialogNames[] = ['message', 'anchor', 'signIn']

//==========================================================================
//
//  Implementation
//
//==========================================================================

const AppDialogContainer = defineComponent({
  components: {
    MessageDialog,
    AnchorDialog,
    SignInDialog,
  },

  setup(props: AppDialogContainer.Props, ctx) {
    const message = ref() as ComputedRef<MessageDialog>
    const anchor = ref() as ComputedRef<AnchorDialog>
    const signIn = ref() as ComputedRef<SignInDialog>

    const result = {
      message,
      anchor,
      signIn,
    }

    return isImplemented<AppDialogContainer.WrapFeatures, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default AppDialogContainer
export { AppDialogNames }
</script>
