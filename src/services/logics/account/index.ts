import { ComputedRef, computed } from 'vue'
import { DeepReadonly, isImplemented } from 'js-common-lib'
import { TestUsers } from '@/services/test-data'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { User } from '@/services/base'
import { useHelper } from '@/services/helpers'
import { useStore } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface AccountLogic extends UnwrapNestedRefs<WrapAccountLogic> {}

interface WrapAccountLogic {
  readonly user: DeepReadonly<User>
  readonly isSignedIn: ComputedRef<boolean>
  signIn(uid: string): Promise<void>
  signOut(): Promise<void>
  validateSignedIn(): void
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AccountLogic {
  export function newWrapInstance() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const stores = useStore()
    const helpers = useHelper()

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const signIn: AccountLogic['signIn'] = async uid => {
      const user = TestUsers.find(user => user.id === uid)
      if (!user) {
        throw new Error(`The specified user does not exist: '${uid}'`)
      }

      const exists = stores.user.get(user.id)
      exists ? stores.user.set(user) : stores.user.add(user)
      helpers.account.signIn(user)

      // TODO
      //  The id token stored in the local storage here will be used in the API request.
      //  However, the implementation here is pseudo, and the authentication process
      //  should be implemented based on the specifications of the application.
      localStorage.setItem('idToken', JSON.stringify({ uid: user.id }))
    }

    const signOut: AccountLogic['signOut'] = async () => {
      helpers.account.signOut()
    }

    const validateSignedIn = helpers.account.validateSignedIn

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      user: helpers.account.user,
      isSignedIn: computed(() => helpers.account.isSignedIn),
      signIn,
      signOut,
      validateSignedIn,
    }

    return isImplemented<WrapAccountLogic, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AccountLogic }
