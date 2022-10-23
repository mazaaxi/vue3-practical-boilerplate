import { AccountLogic } from '@/services/logics/account'
import { ShopLogic } from '@/services/logics/shop'
import { TestUsers } from '@/services/test-data'
import type { UnwrapNestedRefs } from 'vue'
import { User } from '@/services'
import { reactive } from 'vue'
import { useStores } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestServices extends UnwrapNestedRefs<ReturnType<typeof TestServices['newInstance']>> {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestServices {
  export function newInstance() {
    return {
      account: AccountLogic.setupInstance(reactive(newTestAccountLogic())),
      shop: ShopLogic.setupInstance(reactive(ShopLogic.newWrapInstance())),
    }
  }
}

//--------------------------------------------------
//  AccountLogic
//--------------------------------------------------

function newTestAccountLogic() {
  const base = AccountLogic.newWrapInstance()
  const stores = useStores()

  /**
   * Mocking the sign-in process
   */
  base.signIn.body = async (email, password) => {
    const user = TestUsers.find(user => {
      return user.email === email && user.password === password
    })
    if (!user) {
      throw new Error(`The specified "${email}" does not exist or the password does not match.`)
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

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestServices }
export * from './apis'
export * from './stores'
export * from './helpers'
