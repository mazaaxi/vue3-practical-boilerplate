import MessageInput from '@/pages/examples/abc/MessageInput.vue'
import { mount } from '@vue/test-utils'

describe('message-input.vue', () => {
  it('verify the template when initially displayed', () => {
    const title = 'Quasar'
    const body = 'Beyond the framework.'

    const wrapper = mount(MessageInput, {
      props: {
        title,
        modelValue: body,
      },
      global: {
        stubs: {
          QInput: { template: '<div />' },
        },
      },
    })

    const titleInput = wrapper.get('[data-testid="titleInput"]')
    expect(titleInput.attributes('modelvalue')).toBe(title)
    expect(titleInput.attributes('label')).toBe('Title')

    const messageInput = wrapper.get('[data-testid="bodyInput"]')
    expect(messageInput.attributes('modelvalue')).toBe(body)
    expect(messageInput.attributes('label')).toBe('Message')
  })
})
