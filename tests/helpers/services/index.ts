import { AccountLogic } from '@/services/logics/account'
import { ShopLogic } from '@/services/logics/shop'
import { StoreContainer } from '@/services/stores'
import { TestUsers } from '@/services/test-data'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { User } from '@/services'
import { reactive } from 'vue'
import useStore = StoreContainer.useStore

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestServiceContainer extends UnwrapNestedRefs<ReturnType<typeof TestServiceContainer['newInstance']>> {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestServiceContainer {
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
  const stores = useStore()

  /**
   * Mocking the sign-in process
   */
  base.signIn.body = async uid => {
    const user = TestUsers.find(u => u.id == uid)
    if (!user) {
      throw new Error(`The specified user does not exist: '${uid}'`)
    }

    const exists = Boolean(stores.user.get(user.id))
    exists ? stores.user.set(user) : stores.user.add(user)
    User.populate(base.user.value, user)
    base.isSignedIn.value = true
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

export { TestServiceContainer }
export * from './apis'
export * from './stores'
export * from './helpers'
