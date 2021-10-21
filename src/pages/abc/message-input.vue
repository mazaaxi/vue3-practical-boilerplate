<style lang="sass">
@import 'src/styles/app.variables'

.MessageInput
  .message-input-class
    color: var(--message-input-color)
</style>

<style lang="sass" scoped>
@import 'src/styles/app.variables'

.input
  width: var(--message-input-width)
</style>

<template>
  <div class="MessageInput">
    <q-input ref="hoge" v-model="inputTitle" class="input" input-class="message-input-class" :label="$t('common.title')" dense />
    <q-input v-model="inputMessage" class="input" input-class="message-input-class" :label="$t('common.message')" dense />
  </div>
</template>

<script lang="ts">
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

import { ComputedRef, UnwrapRef, computed, defineComponent } from 'vue'
import { QInput } from 'quasar'
import { isImplemented } from 'js-common-lib'

interface MessageInput extends MessageInput.Props, UnwrapRef<MessageInput.Features> {}

namespace MessageInput {
  export interface Props {
    readonly title: string
    readonly modelValue: string
  }

  export interface Features {
    displayMessage: ComputedRef<string>
  }

  export const Component = defineComponent({
    name: 'MessageInput',

    components: {
      QInput: QInput,
    },

    props: {
      modelValue: { type: String, default: '' },
      title: { type: String, default: '' },
    },

    emits: {
      'update:title': null,
      'update:modelValue': null,
    },

    setup(props: Props, ctx) {
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

      return isImplemented<Features, typeof result>(result)
    },
  })
}

export default MessageInput.Component
export { MessageInput }
</script>
