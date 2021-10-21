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
// コンポーネントで-v-model-を使う
// https://v3.ja.vuejs.org/guide/component-basics.html#コンポーネントで-v-model-を使う
//   - `modelValue`というプロパティ名は、`v-model`で使用される特別な名前である。
//     例: `<MessageInput v-model="message.body" />`
//   - `modelValue`プロパティの値は直接変更できない。
//     例: props.modelValue = 'hoge'
//   - `modelValue`プロパティの値を変更するには、`update:modelValue`イベントを新しい値とともに発火する必要がある。
//     例: ctx.emit('update:modelValue', newValue)

// v-model-の引数
// https://v3.ja.vuejs.org/guide/migration/v-model.html#v-model-の引数
//   - `v-model`に引数を渡せるようになり、これによって複数プロパティの双方向バインディングを行えるようになった。
//     例: `<MessageInput v-model:title="message.title" v-model="message.body" />`
//   - プロパティ名は任意の名(例: `title`)が指定でき、`modelValue`プロパティと同様、値は直接変更できない。
//     例: props.title = 'hoge'
//   - `title`プロパティの値を変更するには、`update:title`イベントを新しい値とともに発火する必要がある。
//     例: ctx.emit('update:title', newTitle)

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
