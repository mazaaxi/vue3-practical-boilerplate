import {
  SetupContext,
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
  watchEffect,
} from 'vue'
import MessageInput from '@/pages/examples/abc/MessageInput.vue'
import { QInput } from 'quasar'
import { TestUsers } from '@/services/test-data'
import { useRouter } from '@/router'
import { useServices } from '@/services'

//==========================================================================
//
//  Interfaces
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
      const { title, body } = route.message
      message.title = title || ''
      message.body = body || ''
    })

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const services = useServices()
    const router = useRouter()
    const route = router.routes.examples.abc

    const isSignedIn = computed(() => services.account.isSignedIn)

    // see below for why we use `toRefs`:
    // https://v3.vuejs.org/guide/reactivity-fundamentals.html#destructuring-reactive-state
    const user = reactive({
      ...toRefs(services.account.user),
      fullName: computed(() => `${services.account.user.first} ${services.account.user.last}`),
    })

    const messageInput = ref<MessageInput>()
    const logInput = ref<QInput>()

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
        nextTick(() => {
          const inputEl = logInput.value!.getNativeElement() as HTMLTextAreaElement
          inputEl.scrollTop = inputEl.scrollHeight
        })
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
      logInput,
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

export { BaseAbcView }
