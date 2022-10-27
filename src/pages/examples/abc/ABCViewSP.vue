<style lang="scss" scoped>
.AbcViewSP {
  body.screen--md & {
    padding: 16px;
    margin: 24px;
  }

  body.screen--xs &,
  body.screen--sm & {
    padding: 16px;
    margin: 12px;
  }
}

.message-container {
  @extend %layout-vertical;

  .input,
  .messageInput {
    width: 100%;
  }

  .messageInput {
    --messageInputColor: #{$pink};
    --messageInputWidth: 100%;
  }
}

.caption {
  @extend %text-subtitle1;
  font-weight: $text-weight-medium;
}

.value {
  @extend %text-subtitle1;
}

.logInput {
  font-family: 'MS Gothic', 'Osaka-Mono', monospace;
  font-size: 13px;
}
</style>

<template>
  <div class="AbcViewSP">
    <div class="layout horizontal center">
      <div v-show="isSignedIn">
        <div>{{ $t('abc.signedInUser', { name: user.fullName, email: user.email }) }}</div>
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
      />
    </div>

    <div class="message-container">
      <div class="layout vertical">
        <q-input v-model="message.title" class="input" :label="$t('common.title')" dense />
        <q-input v-model="message.body" class="input" :label="$t('common.message')" dense />
      </div>
      <div class="space-mx-10" />
      <MessageInput
        ref="messageInput"
        v-model:title="message.title"
        v-model="message.body"
        class="messageInput"
      />
    </div>

    <div class="space-my-16">
      <div class="value">{{ displayMessage }}</div>
      <div class="layout horizontal center end-justified">
        <q-btn
          class="space-ml-10"
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

    <div class="space-my-16">
      <span class="caption">Reversed Message: </span
      ><span class="value">{{ reversedMessage }}</span>
    </div>

    <div class="space-my-16">
      <span class="caption">Double Reversed Message: </span>
      <span class="value">{{ doubleReversedMessage }}</span>
    </div>

    <div class="space-my-16">
      <span class="caption">Watch Effect Message: </span>
      <span class="value">{{ watchEffectMessage }}</span>
    </div>

    <q-input
      ref="logInput"
      v-model="sentMessagesLog"
      class="logInput"
      type="textarea"
      filled
      readonly
    />
  </div>
</template>

<script lang="ts">
import { BaseAbcView } from '@/pages/examples/abc/BaseABCView'
import { defineComponent } from 'vue'

interface AbcViewSP extends BaseAbcView {}

const AbcViewSP = defineComponent({
  components: { ...BaseAbcView.components },

  setup(props: BaseAbcView.Props, ctx) {
    const base = BaseAbcView.setup(props, ctx)
    return { ...base }
  },
})

export default AbcViewSP
</script>
