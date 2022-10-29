import { beforeEach, describe, expect, it, vi } from 'vitest'
import AbcViewPC from '@/pages/examples/abc/ABCViewPC.vue'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { useServiceDependencies } from '@/tests/helpers'

vi.mock('@/router', () => {
  return {
    useRouter: vi.fn().mockImplementation(() => {
      return { routes: { examples: { abc: { message: {} } } } }
    }),
  }
})

describe('ABCViewPC.vue', () => {
  beforeEach(() => {
    useServiceDependencies()
  })

  it('When a message is entered ', async () => {
    const wrapper = mount(AbcViewPC, {
      global: {
        stubs: {
          QCard: { template: '<div><slot></slot></div>' },
          QBtn: { template: '<div><slot></slot></div>' },
          QInput: { template: '<div />' },
          MessageInput: { template: '<div />' },
        },
      },
    })

    const message = wrapper.vm.message
    message.title = 'hi'
    message.body = 'hello'

    await nextTick()

    const messageInput = wrapper.get('[data-testid="messageInput"]')
    expect(messageInput.attributes('title')).toBe('hi')
    expect(messageInput.attributes('modelvalue')).toBe('hello')

    const reversedMessage = wrapper.get('[data-testid="reversedMessage"]')
    expect(reversedMessage.attributes('modelvalue')).toBe('olleh')

    const doubleReversedMessage = wrapper.get('[data-testid="doubleReversedMessage"]')
    expect(doubleReversedMessage.attributes('modelvalue')).toBe('hello')

    const watchMessage = wrapper.get('[data-testid="watchMessage"]')
    expect(watchMessage.attributes('modelvalue')).toBe('hello')

    const watchEffectMessage = wrapper.get('[data-testid="watchEffectMessage"]')
    expect(watchEffectMessage.attributes('modelvalue')).toBe('hello')
  })

  it('When the clear button is clicked', async () => {
    const wrapper = mount(AbcViewPC, {
      global: {
        stubs: {
          QCard: { template: '<div><slot></slot></div>' },
          QBtn: { template: '<div><slot></slot></div>' },
          QInput: { template: '<div />' },
          MessageInput: { template: '<div />' },
        },
      },
    })

    const message = wrapper.vm.message
    message.title = 'hi'
    message.body = 'hello'

    await wrapper.get('[data-testid="clearBtn"]').trigger('click')

    const messageInput = wrapper.get('[data-testid="messageInput"]')
    expect(messageInput.attributes('title')).toBe('')
    expect(messageInput.attributes('modelvalue')).toBe('')
  })
})
