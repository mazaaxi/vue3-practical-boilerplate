<style lang="sass" scoped>
@import 'src/styles/app.variables'

.AbcViewPC
  margin-left: auto
  margin-right: auto
  margin-top: 48px
  padding: 32px
  max-width: 800px

.message-container
  .input, .message-input
    width: 100%

  .message-input
    --message-input-color: #{$pink}
    --message-input-width: 100%

.caption
  @extend %text-subtitle1
  font-weight: $text-weight-medium

.value
  @extend %text-subtitle1

.log-input
  font-family: 'MS Gothic', 'Osaka-Mono', monospace
  font-size: 13px
</style>

<template>
  <q-card class="AbcViewPC">
    <div class="layout horizontal center">
      <div v-show="isSignedIn">
        <div data-test="signedInEmail">{{ $t('abc.signedInUser', { name: user.fullName, email: user.email }) }}</div>
        <div>{{ $t('abc.signedInTime', { time: $d(new Date(), 'dateSec') }) }}</div>
      </div>
      <div class="flex-1" />
      <q-btn
        flat
        rounded
        color="primary"
        :label="isSignedIn ? $t('common.signOut') : $t('common.signIn')"
        @click="signInOrOutButtonOnClick"
        dense
        data-test="signInOrOutButton"
      />
    </div>

    <div class="message-container layout horizontal">
      <div class="layout vertical flex-1">
        <q-input v-model="message.title" class="input" :label="$t('common.title')" dense data-test="titleInput" />
        <q-input v-model="message.body" class="input" :label="$t('common.message')" dense data-test="messageInput" />
      </div>
      <div class="spacing-mx-10" />
      <MessageInput ref="messageInput" v-model:title="message.title" v-model="message.body" class="message-input flex-1" />
    </div>

    <div class="spacing-my-16">
      <div class="value">{{ displayMessage }}</div>
      <div class="layout horizontal center end-justified">
        <q-btn
          class="spacing-ml-10"
          flat
          rounded
          color="primary"
          :label="$t('common.send')"
          @click="sendButtonOnClick"
          :disabled="!isSignedIn"
          dense
        />
      </div>
    </div>

    <div class="spacing-my-16">
      <span class="caption">Reversed Message: </span>
      <span class="value" data-test="reversedMessage">{{ reversedMessage }}</span>
    </div>

    <div class="spacing-my-16">
      <span class="caption">Double Reversed Message: </span>
      <span class="value" data-test="doubleReversedMessage">{{ doubleReversedMessage }}</span>
      <span class="value" data-test="doubleReversedMessage">{{ doubleReversedMessage }}</span>
    </div>

    <div class="spacing-my-16">
      <span class="caption">Watch Effect Message: </span>
      <span class="value" data-test="watchEffectMessage">{{ watchEffectMessage }}</span>
    </div>

    <q-input ref="logInput" v-model="sentMessagesLog" class="log-input" type="textarea" filled readonly />
  </q-card>
</template>

<script lang="ts">
import { AbcView } from '@/pages/examples/abc/abc-view-script'
import { defineComponent } from 'vue'

interface AbcViewPC extends AbcView {}

const AbcViewPCComp = defineComponent({
  name: 'AbcViewPC',

  components: { ...AbcView.components },

  setup(props: AbcView.Props, ctx) {
    const base = AbcView.setup(props, ctx)
    return { ...base }
  },
})

export default AbcViewPCComp
export { AbcViewPC }
</script>
