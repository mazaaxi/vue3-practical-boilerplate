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

.messageInputBox {
  .input,
  .messageInput {
    width: 100%;
  }

  .messageInput {
    --messageInputColor: #{$pink};
    --messageInputWidth: 100%;
  }

  .displayMessage {
    @extend %text-subtitle1;
  }
}
</style>

<template>
  <div class="AbcViewSP">
    <div class="messageInputBox column">
      <MessageInput
        ref="messageInput"
        v-model:title="message.title"
        v-model="message.body"
        class="messageInput"
      />
      <div class="displayMessage">{{ displayMessage }}</div>
      <q-btn
        class="self-end"
        color="primary"
        @click="clearBtnOnClick"
        flat
        dense
        rounded
        noCaps
        data-testid="clearBtn"
      >
        {{ $t('common.clear') }}</q-btn
      >
    </div>

    <div class="column q-mt-md q-gutter-y-sm">
      <q-input
        v-model="reversedMessage"
        label="Reversed Message"
        readonly
        data-testid="reversedMessage"
      />
      <q-input
        v-model="doubleReversedMessage"
        label="Double Reversed Message"
        readonly
        data-testid="doubleReversedMessage"
      />
      <q-input v-model="watchMessage" label="Watch Message" readonly data-testid="watchMessage" />
      <q-input
        v-model="watchEffectMessage"
        label="Watch Effect Message"
        readonly
        data-testid="watchEffectMessage"
      />
    </div>
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
