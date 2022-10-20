import { DeepReadonly, extensibleMethod, isImplemented } from 'js-common-lib'
import { Ref, reactive, ref } from 'vue'
import { TestUsers } from '@/services/test-data'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { User } from '@/services/base'
import { UserStore } from '@/services/stores/user'
import { useStores } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface AccountLogic extends UnwrapNestedRefs<WrapAccountLogic> {}

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

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AccountLogic {
  let instance: AccountLogic

  export function setupInstance<T extends AccountLogic>(logic?: T): T {
    instance = logic ?? reactive(newWrapInstance())
    return instance as T
  }

  export function useInternalInstance(): InternalAccountLogic {
    return instance
  }

  export function newWrapInstance() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const stores = useStores()

    const user = ref<User>(UserStore.createEmptyUser())

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
      User.populate(user.value, UserStore.createEmptyUser())
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
