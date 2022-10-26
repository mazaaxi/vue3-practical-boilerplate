import AbcViewPC from '@/pages/examples/abc/ABCViewPC.vue'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { useRouter } from '@/router'
import { useServiceDependencies } from '@/tests/helpers'

describe('ABCViewPC.vue', () => {
  beforeEach(() => {
    useServiceDependencies()

    // disable router as it gets in the way during testing
    const { routes } = useRouter()
    td.replace<typeof routes['examples']['abc']>(routes.examples.abc, 'message', {})
  })

  it('dummy', async () => {})

  // it('if signIn button is clicked', async () => {
  //   const wrapper = mount(AbcViewPC, {
  //     global: {
  //       stubs: {
  //         QCard: { template: '<div><slot></slot></div>' },
  //       },
  //     },
  //   })
  //
  //   await wrapper.get('[data-test="signInOrOutButton"]').trigger('click')
  //
  //   const signedInEmail = wrapper.get('[data-test="signedInEmail"]')
  //   expect(signedInEmail.text()).toBe(`Taro Yamada <taro.yamada@example.com>`)
  // })

  // it('if a message is entered ', async () => {
  //   const wrapper = mount(AbcViewPC, {
  //     global: {
  //       stubs: {
  //         QCard: { template: '<div><slot></slot></div>' },
  //       },
  //     },
  //   })
  //
  //   const message = wrapper.vm.message as any as { title: string; body: string }
  //   message.body = 'hello'
  //
  //   await nextTick()
  //
  //   expect(wrapper.get('[data-test="reversedMessage"]').text()).toBe('olleh')
  //   expect(wrapper.get('[data-test="doubleReversedMessage"]').text()).toBe('hello')
  //   expect(wrapper.get('[data-test="watchEffectMessage"]').text()).toBe('hello')
  // })
})
