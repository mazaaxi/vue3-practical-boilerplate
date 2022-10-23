import { beforeEach, describe, expect, it, vi } from 'vitest'
import AbcViewPC from '@/pages/examples/abc/ABCViewPC.vue'
import { TestUsers } from '@/services/test-data'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { useDialogs } from '@/dialogs'
import { useServiceDependencies } from '@/tests/helpers'

vi.mock('@/router', () => {
  return {
    useRouter: vi.fn().mockImplementation(() => {
      return { routes: { examples: { abc: { message: {} } } } }
    }),
  }
})

const signIn = {
  open: vi.fn().mockImplementation(async () => {
    const { services } = useServiceDependencies()
    const taro = TestUsers[0]
    await services.account.signIn(taro.email, taro.password)
  }),
}
vi.mock('@/dialogs', () => {
  return {
    useDialogs: vi.fn().mockImplementation(() => {
      return { signIn }
    }),
  }
})

describe('ABCViewPC.vue', () => {
  beforeEach(() => {
    useServiceDependencies()
  })

  // it('if signIn button is clicked', async () => {
  //   const wrapper = mount(AbcViewPC, {
  //     global: {
  //       stubs: {
  //         QCard: { template: '<div><slot></slot></div>' },
  //         QBtn: { template: '<div><slot></slot></div>' },
  //         QInput: { template: '<div></div>' },
  //         // QBtn: true,
  //         // QInput: true,
  //       },
  //     },
  //   })
  //
  //   await wrapper.get('[data-testid="signInOrOutButton"]').trigger('click')
  //
  //   const dialogs = useDialogs()
  //   expect(dialogs.signIn.open).toBeCalledTimes(1)
  //
  //   const signedInEmail = wrapper.get('[data-testid="signedInEmail"]')
  //   expect(signedInEmail.text()).toBe(`Taro Yamada <taro.yamada@example.com>`)
  // })

  it('if a message is entered ', async () => {
    const wrapper = mount(AbcViewPC, {
      global: {
        stubs: {
          QCard: { template: '<div><slot></slot></div>' },
          QBtn: { template: '<div><slot></slot></div>' },
          QInput: { template: '<div></div>' },
        },
      },
    })

    const dialogs = useDialogs()
    expect(dialogs.signIn.open).toBeCalledTimes(0)

    const message = wrapper.vm.message
    message.body = 'hello'

    await nextTick()

    expect(wrapper.get('[data-testid="reversedMessage"]').text()).toBe('olleh')
    expect(wrapper.get('[data-testid="doubleReversedMessage"]').text()).toBe('hello')
    expect(wrapper.get('[data-testid="watchEffectMessage"]').text()).toBe('hello')
  })
})
