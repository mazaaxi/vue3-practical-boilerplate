<style lang="scss" scoped>
.AbcViewPC {
  max-width: 800px;
  margin-top: 48px;
  margin-right: auto;
  margin-left: auto;

  .viewWrapper {
    padding: 32px;
    margin: 0 40px;
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
  <div class="AbcViewPC">
    <q-card class="viewWrapper">
      <div class="messageInputBox column">
        <MessageInput
          ref="messageInput"
          v-model:title="message.title"
          v-model="message.body"
          class="messageInput"
          data-testid="messageInput"
        />
        <div class="row space-mt-10">
          <div class="displayMessage col-grow">{{ displayMessage }}</div>
          <q-btn
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
    </q-card>
  </div>
</template>

<script lang="ts">
import { BaseAbcView } from '@/pages/examples/abc/BaseABCView'
import { defineComponent } from 'vue'

interface AbcViewPC extends BaseAbcView {}

const AbcViewPC = defineComponent({
  components: { ...BaseAbcView.components },

  setup(props: BaseAbcView.Props, ctx) {
    const base = BaseAbcView.setup(props, ctx)
    return { ...base }
  },
})

export default AbcViewPC
</script>
