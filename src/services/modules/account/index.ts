import { ComputedRef, UnwrapRef, computed } from 'vue'
import { DeepReadonly, isImplemented } from 'js-common-lib'
import { TestUsers } from '@/services/test-data'
import { User } from '@/services/base'
import { useHelper } from '@/services/helpers'
import { useStore } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface AccountService extends UnwrapRef<RawAccountService> {
  readonly user: DeepReadonly<User>
}

interface RawAccountService {
  readonly user: ComputedRef<User>
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

namespace AccountService {
  export function newRawInstance() {
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

    const signIn: AccountService['signIn'] = async uid => {
      const user = TestUsers.find(user => user.id === uid)
      if (!user) {
        throw new Error(`The specified User was not found: '${uid}'`)
      }

      stores.user.set(user)
      helpers.account.signIn(user)

      // TODO
      //  The id token stored in the local storage here will be used in the API request.
      //  However, the implementation here is pseudo, and the authentication process
      //  should be implemented based on the specifications of the application.
      localStorage.setItem('idToken', JSON.stringify({ uid: user.id }))
    }

    const signOut: AccountService['signOut'] = async () => {
      helpers.account.signOut()
    }

    const validateSignedIn = helpers.account.validateSignedIn

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      user: computed(() => helpers.account.user),
      isSignedIn: computed(() => helpers.account.isSignedIn),
      signIn,
      signOut,
      validateSignedIn,
    }

    return isImplemented<RawAccountService, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AccountService }
