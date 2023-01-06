import { AccountLogic } from '@/services/logics/account'
import { AppI18n } from '@/i18n'
import { AppStores } from '@/services/stores'
import { ShopLogic } from '@/services/logics/shop'
import { TestUsers } from '@/services/test-data'
import { User } from '@/services'
import { reactive } from 'vue'

//==========================================================================
//
//  Definition
//
//==========================================================================

type TestServices = ReturnType<typeof TestServices['newInstance']>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestServices {
  export function newInstance() {
    return reactive({
      account: AccountLogic.setup(TestAccountLogic.newWrapInstance()),
      shop: ShopLogic.setup(),
    })
  }
}

namespace TestAccountLogic {
  export function newWrapInstance() {
    const base = AccountLogic.newWrapInstance()
    const stores = AppStores.use()
    const i18n = AppI18n.use()

    /**
     * Mocking the sign-in process
     */
    base.signIn.body = async (email, password) => {
      const user = TestUsers.find(user => {
        return user.email === email && user.password === password
      })
      if (!user) {
        throw new Error(i18n.t('signIn.signInError', { email: email }))
      }

      const exists = Boolean(stores.user.get(user.id))
      exists ? stores.user.set(user) : stores.user.add(user)
      User.populate(base.user.value, user)
      base.isSignedIn.value = true

      return true
    }

    return {
      ...base,
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestServices }
export * from '@/tests/helpers/services/apis'
export * from '@/tests/helpers/services/stores'
export * from '@/tests/helpers/services/helpers'
