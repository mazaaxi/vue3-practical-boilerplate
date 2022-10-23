<style lang="scss" scoped>
.MessageInput {
  &::v-deep(.message-input-class) {
    color: var(--message-input-color);
  }
}

.input {
  width: var(--message-input-width);
}
</style>

<template>
  <div class="MessageInput">
    <q-input
      v-model="inputTitle"
      class="input"
      inputClass="message-input-class"
      :label="$t('common.title')"
      dense
      data-test="titleInput"
    />
    <q-input
      v-model="inputMessage"
      class="input"
      inputClass="message-input-class"
      :label="$t('common.message')"
      dense
      data-test="bodyInput"
    />
  </div>
</template>

<script lang="ts">
import type { ComputedRef, UnwrapNestedRefs } from 'vue'
import { computed, defineComponent } from 'vue'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface MessageInput extends MessageInput.Props, MessageInput.Features {}

namespace MessageInput {
  export interface Props {
    readonly title: string
    readonly modelValue: string
  }

  export type Features = UnwrapNestedRefs<WrapFeatures>

  export interface WrapFeatures {
    readonly displayMessage: ComputedRef<string>
  }
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

// Using v-model on Components
// https://v3.vuejs.org/guide/component-basics.html#using-v-model-on-components
//   - A property name `modelValue` is a special name used in `v-model`.
//     ex. `<MessageInput v-model="message.body" />`
//   - A value of the `modelValue` property cannot be changed directly.
//     ex. props.modelValue = 'hoge'
//   - To change a value of the `modelValue` property, you need to fire an
//     `update:modelValue` event with the new value.
//     ex. ctx.emit('update:modelValue', newValue)

// v-model arguments
// https://v3.vuejs.org/guide/migration/v-model.html#v-model-arguments
//   - You can pass arguments to `v-model`, which allows bidirectional binding of
//     multiple properties.
//     ex. `<MessageInput v-model:title="message.title" v-model="message.body" />`
//   - The property name can be any name (e.g. `title`), and like the `modelValue`
//     property, a value cannot be changed directly.
//     ex. props.title = 'hoge'
//   - To change a value of the `title` property, you need to fire an
//     `update:title` event with the new value.
//     ex. ctx.emit('update:title', newTitle)

const MessageInput = defineComponent({
  name: 'MessageInput',

  components: {},

  props: {
    modelValue: { type: String, default: '' },
    title: { type: String, default: '' },
  },

  emits: {
    'update:title': null,
    'update:modelValue': null,
  },

  setup(props: MessageInput.Props, ctx) {
    const inputTitle = computed({
      get: () => props.title,
      set: v => ctx.emit('update:title', v),
    })

    const inputMessage = computed({
      get: () => props.modelValue,
      set: v => ctx.emit('update:modelValue', v),
    })

    const displayMessage = computed(() => {
      if (!inputTitle.value && !inputMessage.value) {
        return `NO MESSAGE`
      }
      return `${inputTitle.value}: ${inputMessage.value}`
    })

    const result = {
      inputTitle,
      inputMessage,
      displayMessage,
    }

    return isImplemented<MessageInput.WrapFeatures, typeof result>(result)
  },
})

//==========================================================================
//
//  Export
//
//==========================================================================

export default MessageInput
</script>
