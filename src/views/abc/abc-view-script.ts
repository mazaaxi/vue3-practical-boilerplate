import { QBtn, QCard, QInput } from 'quasar'
import { SetupContext, computed, onMounted, reactive, ref, toRefs, watch, watchEffect } from 'vue'
import { MessageInput } from '@/views/abc/message-input.vue'
import { TestUsers } from '@/services/test-data'
import { useService } from '@/services'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface AbcView extends AbcView.Props {}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace AbcView {
  export interface Props {}

  export const components = {
    MessageInput: MessageInput.Component,
    QCard: QCard,
    QInput: QInput,
    QBtn: QBtn,
  }

  export function setup(props: Props, context: SetupContext) {
    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onMounted(() => {
      message.title = 'ABC Page'
      message.body = 'A simple tutorial on Vue.'
    })

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const services = useService()

    const isSignedIn = computed(() => services.account.isSignedIn)

    const user = reactive({
      ...toRefs(services.account.user),
      fullName: computed(() => `${services.account.user.first} ${services.account.user.last}`),
    })

    const messageInput = ref<MessageInput>()

    const message = reactive({
      title: '',
      body: '',
    })

    const sentMessages = reactive<{ [uid: string]: string[] }>({})

    const sentMessagesLog = ref('')

    const displayMessage = computed(() => messageInput.value?.displayMessage || '')

    const reversedMessage = computed(() => message.body.split('').reverse().join(''))

    const doubleReversedYourName = computed(() => reversedMessage.value.split('').reverse().join(''))

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

    async function signInOrOutButtonOnClick() {
      if (isSignedIn.value) {
        await services.account.signOut()
      } else {
        const index = Math.floor(Math.random() * 2)
        await services.account.signIn(TestUsers[index].id)
      }
    }

    const sendButtonOnClick = () => {
      sentMessages[user.id] ??= []
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
      doubleReversedYourName,
      watchEffectMessage,
      signInOrOutButtonOnClick,
      sendButtonOnClick,
    }
  }
}

//========================================================================
//
//  Export
//
//========================================================================

export { AbcView }
