<style lang="sass" scoped>
@import 'src/styles/app.variables'

.AbcPage
  body.screen--lg &, body.screen--xl &
    margin: 48px
    padding: 32px
  body.screen--md &
    margin: 24px
    padding: 16px
  body.screen--xs &, body.screen--sm &
    margin: 12px
    padding: 16px

.message-container
  body.screen--lg &, body.screen--xl &
    @extend %layout-horizontal
  body.screen--md & body.screen--xs &, body.screen--sm &
    @extend %layout-vertical

  .input, .message-input
    body.screen--lg &, body.screen--xl &
      width: 400px
    body.screen--md & body.screen--xs &, body.screen--sm &
      width: 100%

  .message-input
    --message-input-color: #{$pink}
    body.screen--lg &, body.screen--xl &
      --message-input-width: 400px
    body.screen--md & body.screen--xs &, body.screen--sm &
      --message-input-width: 100%

.caption
  @extend %text-subtitle1
  font-weight: $text-weight-medium

.value
  @extend %text-subtitle1
</style>

<template>
  <q-card class="AbcPage">
    <div v-show="isSignedIn">
      <div>{{ $t('abc.signedInUser', { name: user.fullName, email: user.email }) }}</div>
      <div>{{ $t('abc.signedInTime', { time: $d(new Date(), 'dateSec') }) }}</div>
    </div>

    <div class="message-container">
      <div class="layout vertical">
        <q-input v-model="message.title" class="input" :label="$t('common.title')" dense />
        <q-input v-model="message.body" class="input" :label="$t('common.message')" dense />
      </div>
      <div class="spacing-mx-10" />
      <MessageInput ref="messageInput" v-model:title="message.title" v-model="message.body" class="message-input" />
    </div>

    <div class="layout horizontal center spacing-my-16">
      <div class="value">{{ displayMessage }}</div>
      <q-btn flat rounded color="primary" :label="isSignedIn ? $t('common.signOut') : $t('common.signIn')" @click="signInOrOutButtonOnClick" />
      <q-btn flat rounded color="primary" :label="$t('common.send')" @click="sendButtonOnClick" :disabled="!isSignedIn" />
    </div>

    <div class="spacing-my-16">
      <span class="caption">Reversed Message: </span><span class="value">{{ reversedMessage }}</span>
    </div>

    <div class="spacing-my-16">
      <span class="caption">Double Reversed Message: </span>
      <span class="value">{{ doubleReversedYourName }}</span>
    </div>

    <div class="spacing-my-16">
      <span class="caption">Watch Effect Message: </span>
      <span class="value">{{ watchEffectMessage }}</span>
    </div>

    <q-input v-model="sentMessagesLog" filled type="textarea" readonly />
  </q-card>
</template>

<script lang="ts">
import { QBtn, QCard, QInput } from 'quasar'
import { SetupContext, computed, defineComponent, onMounted, reactive, ref, toRefs, watch, watchEffect } from 'vue'
import { MessageInput } from '@/views/abc/message-input.vue'
import { TestUsers } from '@/services/test-data'
import { useService } from '@/services'

namespace AbcPage {
  export interface Props {}

  export const clazz = defineComponent({
    name: 'AbcPage',

    components: {
      MessageInput: MessageInput.Component,
      QCard: QCard,
      QInput: QInput,
      QBtn: QBtn,
    },

    setup(props: Props, context: SetupContext) {
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
      //  Event listeners
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
    },
  })
}

export default AbcPage.clazz
</script>
