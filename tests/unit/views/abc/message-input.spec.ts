import MessageInput from '@/pages/abc/message-input.vue'
import { mount } from '@vue/test-utils'

describe('message-input.vue', () => {
  it('template', () => {
    const title = 'Quasar'
    const body = 'Beyond the framework.'

    const wrapper = mount(MessageInput, {
      props: {
        title,
        modelValue: body,
      },
      global: {
        stubs: {
          QInput: {
            template: '<div />',
          },
        },
      },
    })

    const titleInput = wrapper.element.children[0]
    expect(titleInput.attributes.getNamedItem('modelValue')!.value).toBe(title)
    expect(titleInput.attributes.getNamedItem('label')!.value).toBe('Title')

    const bodyInput = wrapper.element.children[1]
    expect(bodyInput.attributes.getNamedItem('modelValue')!.value).toBe(body)
    expect(bodyInput.attributes.getNamedItem('label')!.value).toBe('Message')
  })
})
