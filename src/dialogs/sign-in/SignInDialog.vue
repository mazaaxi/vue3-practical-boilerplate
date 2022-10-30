<style lang="scss" scoped>
.container {
  body.screen--lg &,
  body.screen--xl &,
  body.screen--md & {
    width: 340px;
  }
  body.screen--xs &,
  body.screen--sm & {
    max-width: 90vw;
  }
}

.contentArea {
  gap: 10px;

  .title {
    @extend %text-h6;
  }

  .email {
    width: 300px;
  }
}

.errorMessage {
  @extend %text-caption;
  color: $text-error;
}
</style>

<template>
  <PromiseDialog
    ref="dialog"
    class="SignInDialog"
    :defaultResult="false"
    @beforeHide="onBeforeHide"
  >
    <q-card class="container">
      <!-- Title -->
      <q-card-section>
        <div class="title">{{ $t('common.signIn') }}</div>
      </q-card-section>

      <!-- Content area -->
      <q-card-section class="contentArea column">
        <q-select
          ref="emailInput"
          v-model="email"
          class="email"
          :label="$t('common.email')"
          :options="emailOptions"
          :rules="emailRules"
          useInput
          inputDebounce="0"
          @filter="emailFilter"
          dense
        />
        <q-input
          ref="passwordInput"
          v-model="password"
          type="password"
          :label="$t('common.password')"
          :rules="passwordRules"
          dense
        />
      </q-card-section>

      <!-- Error area -->
      <q-card-section v-show="isError">
        <span class="errorMessage">{{ errorMessage }}</span>
      </q-card-section>

      <!-- Button area -->
      <q-card-actions class="row items-center justify-end">
        <!-- Cancel button -->
        <q-btn flat rounded color="primary" :label="$t('common.cancel')" @click="close(false)" />
        <!-- OK button -->
        <q-btn flat rounded color="primary" :label="$t('common.ok')" @click="signIn()" />
      </q-card-actions>
    </q-card>
  </PromiseDialog>
</template>

<script lang="ts">
import type { QInput, QSelect } from 'quasar'
import { computed, defineComponent, ref, watch } from 'vue'
import type { Dialog } from '@/dialogs'
import { PromiseDialog } from '@/components/dialog'
import { TestUsers } from '@/services/test-data'
import type { UnwrapNestedRefs } from 'vue'
import { isImplemented } from 'js-common-lib'
import { useI18n } from '@/i18n'
import { useServices } from '@/services'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type SignInDialog = SignInDialog.Props & SignInDialog.Features

namespace SignInDialog {
  export interface Props {}

  export type Features = UnwrapNestedRefs<WrapFeatures>

  export interface WrapFeatures extends Dialog<void, boolean> {}
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

const SignInDialog = defineComponent({
  components: {
    PromiseDialog,
  },

  props: {},

  setup(props: SignInDialog.Props, ctx) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const dialog = ref<PromiseDialog<void, boolean>>()

    const services = useServices()
    const i18n = useI18n()

    const emailInput = ref<QSelect>()
    const passwordInput = ref<QInput>()

    const email = ref<string | null>(null)
    const emails = TestUsers.map(user => user.email)
    const emailOptions = ref(emails)
    const emailRules = [
      (val: string) => Boolean(val) || i18n.t('error.required', { target: i18n.t('common.email') }),
    ]

    const password = ref('')
    const passwordRules = [
      (val: string) =>
        Boolean(val) || i18n.t('error.required', { target: i18n.t('common.password') }),
    ]

    const errorMessage = ref('')
    const isError = computed(() => Boolean(errorMessage.value))

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const open: SignInDialog.WrapFeatures['open'] = () => {
      return dialog.value!.open()
    }

    const close: SignInDialog.WrapFeatures['close'] = isOK => {
      dialog.value!.close(isOK)
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    async function signIn() {
      if (!validate()) return

      const signInResult = await services.account.signIn(email.value || '', password.value || '')
      if (signInResult) {
        close(true)
      } else {
        errorMessage.value = i18n.t('signIn.signInError', { email: email.value })
      }
    }

    function validate(): boolean {
      const emailValidated = emailInput.value!.validate()
      if (!emailValidated) return false

      const passwordValidated = passwordInput.value!.validate()
      if (!passwordValidated) return false

      return true
    }

    function resetValidation() {
      errorMessage.value = ''
      emailInput.value!.resetValidation()
      passwordInput.value!.resetValidation()
    }

    function clear() {
      email.value = null
      password.value = ''
      resetValidation()
    }

    function emailFilter(inputValue: string, update: (callbackFn: () => void) => void) {
      update(() => {
        if (!inputValue) {
          emailOptions.value = emails
        } else {
          const needle = inputValue.toLowerCase()
          emailOptions.value = emails.filter(email => email.toLowerCase().indexOf(needle) > -1)
        }
      })
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    watch(
      () => email.value,
      (newValue, oldValue) => {
        errorMessage.value = ''

        if (!newValue) return

        const user = TestUsers.find(user => user.email === newValue)
        user && (password.value = user.password)
      }
    )

    watch(
      () => password.value,
      (newValue, oldValue) => {
        errorMessage.value = ''
      }
    )

    function onBeforeHide() {
      clear()
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const result = {
      dialog,
      emailInput,
      passwordInput,
      email,
      emailOptions,
      emailRules,
      password,
      passwordRules,
      errorMessage,
      isError,
      open,
      close,
      signIn,
      emailFilter,
      onBeforeHide,
    }

    return isImplemented<SignInDialog.WrapFeatures, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default SignInDialog
</script>
