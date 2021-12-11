import AbcViewPC from '@/pages/examples/abc/abc-view-pc.vue'
import { AccountService } from '@/services/modules/account'
import { TestUsers } from '@/services/test-data'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { provideDependency } from '../../../../helpers'
import { useRouterUtils } from '@/router'

describe('abc-view-pc.vue', () => {
  beforeEach(() => {
    provideDependency(({ stores, helpers, services }) => {
      const testUser = TestUsers[0]
      td.replace<AccountService, 'signIn'>(services.account, 'signIn', async (uid: string) => {
        stores.user.add(testUser)
        helpers.account.signIn(testUser)
      })
    })

    const { routes } = useRouterUtils()
    td.replace<typeof routes['examples']['abc']>(routes.examples.abc, 'message', {})
  })

  it('if signIn button is clicked', async () => {
    const wrapper = mount(AbcViewPC, {
      global: {
        stubs: {
          QCard: { template: '<div><slot></slot></div>' },
        },
      },
    })

    await wrapper.get('[data-test="signInOrOutButton"]').trigger('click')

    const signedInEmail = wrapper.get('[data-test="signedInEmail"]')
    expect(signedInEmail.text()).toBe(`Taro Yamada <taro.yamada@example.com>`)
  })

  it('if a message is entered ', async () => {
    const wrapper = mount(AbcViewPC, {
      global: {
        stubs: {
          QCard: { template: '<div><slot></slot></div>' },
        },
      },
    })

    const message = wrapper.vm.message as any as { title: string; body: string }
    message.body = 'hello'

    await nextTick()

    expect(wrapper.get('[data-test="reversedMessage"]').text()).toBe('olleh')
    expect(wrapper.get('[data-test="doubleReversedMessage"]').text()).toBe('hello')
    expect(wrapper.get('[data-test="watchEffectMessage"]').text()).toBe('hello')
  })
})
