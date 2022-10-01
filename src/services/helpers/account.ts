import { DeepReadonly, isImplemented } from 'js-common-lib'
import { Ref, computed, ref } from 'vue'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { User } from '@/services'
import { UserStore } from '@/services/stores/user'
import { useStore } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface AccountHelper extends UnwrapNestedRefs<WrapAccountHelper> {}

interface WrapAccountHelper {
  readonly user: DeepReadonly<Ref<User>>
  readonly isSignedIn: Ref<boolean>
  signIn(user: User): void
  signOut(): void
  validateSignedIn(): void
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AccountHelper {
  export function newWrapInstance() {
    const stores = useStore()

    const user = ref<User>(UserStore.createEmptyUser())

    const isSignedIn = ref(false)

    const signIn: AccountHelper['signIn'] = signInUser => {
      if (stores.user.get(signInUser.id)) {
        User.populate(user.value, stores.user.set(signInUser))
      } else {
        User.populate(user.value, stores.user.add(signInUser))
      }
      isSignedIn.value = true
    }

    const signOut: AccountHelper['signOut'] = () => {
      User.populate(user.value, UserStore.createEmptyUser())
      isSignedIn.value = false
    }

    const validateSignedIn: AccountHelper['validateSignedIn'] = () => {
      if (!isSignedIn.value) {
        throw new Error(`There is no user signed-in.`)
      }
    }

    const result = {
      user: computed<User>(() => user.value),
      isSignedIn,
      signIn,
      signOut,
      validateSignedIn,
    }

    return isImplemented<WrapAccountHelper, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AccountHelper }
