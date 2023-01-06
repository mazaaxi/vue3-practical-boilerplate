import type { Ref, UnwrapNestedRefs } from 'vue'
import { extensibleMethod, isImplemented } from 'js-common-lib'
import { reactive, ref } from 'vue'
import { AppStores } from '@/services/stores'
import type { DeepReadonly } from 'js-common-lib'
import { TestUsers } from '@/services/test-data'
import { User } from '@/services/entities'

//==========================================================================
//
//  Definition
//
//==========================================================================

type AccountLogic = UnwrapNestedRefs<WrapAccountLogic>

interface WrapAccountLogic {
  readonly user: DeepReadonly<Ref<User>>
  readonly isSignedIn: Ref<boolean>
  signIn(email: string, password: string): Promise<boolean>
  signOut(): Promise<void>
  validateSignedIn(): void
}

interface InternalAccountLogic {
  readonly user: AccountLogic['user']
  readonly isSignedIn: AccountLogic['isSignedIn']
  validateSignedIn: AccountLogic['validateSignedIn']
}

type RawAccountLogic = ReturnType<typeof AccountLogic.newWrapInstance>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AccountLogic {
  let instance: RawAccountLogic

  export function setup<T extends RawAccountLogic>(logic?: T): T {
    instance = logic ?? newWrapInstance()
    return instance as T
  }

  export function use(): InternalAccountLogic {
    return reactive(instance)
  }

  export function newWrapInstance() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const stores = AppStores.use()

    const user = ref<User>(User.createEmptyUser())

    const isSignedIn = ref(false)

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const signIn = extensibleMethod<WrapAccountLogic['signIn']>(async (email, password) => {
      const signedInUser = TestUsers.find(user => {
        return user.email === email && user.password === password
      })
      if (!signedInUser) {
        return false
      }

      const exists = Boolean(stores.user.get(signedInUser.id))
      exists ? stores.user.set(signedInUser) : stores.user.add(signedInUser)
      User.populate(user.value, signedInUser)
      isSignedIn.value = true

      // TODO
      //  The id token stored in the local storage here will be used in the API request.
      //  However, the implementation here is pseudo, and a authentication process
      //  should be implemented based on the specifications of an application.
      localStorage.setItem('idToken', JSON.stringify({ uid: user.value.id }))

      return true
    })

    const signOut: WrapAccountLogic['signOut'] = async () => {
      User.populate(user.value, User.createEmptyUser())
      isSignedIn.value = false
    }

    const validateSignedIn: WrapAccountLogic['validateSignedIn'] = () => {
      if (!isSignedIn.value) {
        throw new Error(`There is no signed-in user.`)
      }
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      user,
      isSignedIn,
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
