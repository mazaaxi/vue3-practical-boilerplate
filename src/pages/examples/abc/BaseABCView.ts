import { computed, onMounted, reactive, ref, toRefs, watch, watchEffect } from 'vue'
import { AppRouter } from '@/router'
import { AppServices } from '@/services'
import MessageInput from '@/pages/examples/abc/MessageInput.vue'
import type { QInput } from 'quasar'
import type { SetupContext } from 'vue'

//==========================================================================
//
//  Definition
//
//==========================================================================

interface BaseAbcView extends BaseAbcView.Props {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace BaseAbcView {
  export interface Props {}

  export const components = {
    MessageInput,
  }

  export function setup(props: Props, context: SetupContext) {
    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onMounted(() => {
      const { title, body } = route.props
      message.title = title || ''
      message.body = body || ''
    })

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const services = AppServices.use()
    const router = AppRouter.use()
    const route = router.routes.examples.abc

    // see below for why we use `toRefs`:
    // https://v3.vuejs.org/guide/reactivity-fundamentals.html#destructuring-reactive-state
    const user = reactive({
      ...toRefs(services.account.user),
      fullName: computed(() => `${services.account.user.first} ${services.account.user.last}`),
    })

    const messageInput = ref<MessageInput>()
    const logInput = ref<QInput>()

    const message = reactive({ title: '', body: '' })

    const displayMessage = computed(() => messageInput.value?.displayMessage || '')

    const reversedMessage = computed(() => message.body.split('').reverse().join(''))

    const doubleReversedMessage = computed(() => reversedMessage.value.split('').reverse().join(''))

    const watchMessage = ref('')

    const watchEffectMessage = ref('')

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    watch(
      () => message,
      (newValue, oldValue) => {
        watchMessage.value = newValue.body
      },
      { deep: true }
    )

    watchEffect(() => {
      watchEffectMessage.value = message.body
    })

    function clearBtnOnClick() {
      Object.assign(message, { title: '', body: '' })
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      messageInput,
      logInput,
      user,
      message,
      displayMessage,
      reversedMessage,
      doubleReversedMessage,
      watchMessage,
      watchEffectMessage,
      clearBtnOnClick,
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { BaseAbcView }
