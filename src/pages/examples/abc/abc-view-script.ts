import MessageInputComp, { MessageInput } from '@/pages/examples/abc/message-input.vue'
import { SetupContext, computed, onUnmounted, reactive, ref, toRefs, watch, watchEffect } from 'vue'
import { TestUsers } from '@/services/test-data'
import { useRouterUtils } from '@/router'
import { useService } from '@/services'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface AbcView extends AbcView.Props {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AbcView {
  export interface Props {}

  export const components = {
    MessageInput: MessageInputComp,
  }

  export function setup(props: Props, context: SetupContext) {
    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onUnmounted(() => {
      offAfterRouteUpdate()
    })

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const services = useService()
    const { routes } = useRouterUtils()
    const route = routes.examples.abc

    const isSignedIn = computed(() => services.account.isSignedIn)

    // see below for why we use `toRefs`:
    // https://v3.vuejs.org/guide/reactivity-fundamentals.html#destructuring-reactive-state
    const user = reactive({
      ...toRefs(services.account.user),
      fullName: computed(() => `${services.account.user.first} ${services.account.user.last}`),
    })

    const messageInput = ref<MessageInput>()

    const message = reactive({ title: '', body: '' })

    const sentMessages = reactive<{ [uid: string]: string[] }>({})

    const sentMessagesLog = ref('')

    const displayMessage = computed(() => messageInput.value?.displayMessage || '')

    const reversedMessage = computed(() => message.body.split('').reverse().join(''))

    const doubleReversedMessage = computed(() => reversedMessage.value.split('').reverse().join(''))

    const watchEffectMessage = ref('')

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    watchEffect(() => {
      watchEffectMessage.value = message.body
    })

    watch(
      () => sentMessages,
      (newValue, oldValue) => {
        const latestMessage = sentMessages[user.id][0]
        sentMessagesLog.value = `[${user.id}] ${latestMessage}\n${sentMessagesLog.value}`
      },
      { deep: true }
    )

    const offAfterRouteUpdate = route.onAfterRouteUpdate(() => {
      const { title, body } = route.message
      message.title = title || ''
      message.body = body || ''
    })

    async function signInOrOutButtonOnClick() {
      if (isSignedIn.value) {
        await services.account.signOut()
      } else {
        const index = Math.floor(Math.random() * 2)
        await services.account.signIn(TestUsers[index].id)
      }
    }

    const sendButtonOnClick = () => {
      sentMessages[user.id] = sentMessages[user.id] ?? []
      sentMessages[user.id].unshift(displayMessage.value)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      messageInput,
      isSignedIn,
      user,
      message,
      sentMessagesLog,
      displayMessage,
      reversedMessage,
      doubleReversedMessage,
      watchEffectMessage,
      signInOrOutButtonOnClick,
      sendButtonOnClick,
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AbcView }
