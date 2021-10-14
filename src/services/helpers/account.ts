import { ComputedRef, UnwrapRef, computed, reactive } from 'vue'
import { DeepReadonly, isImplemented } from 'js-common-lib'
import { User } from '@/services'
import { UserStore } from '@/services/stores/user'
import { useStore } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface AccountHelper extends UnwrapRef<RawAccountHelper> {
  readonly user: DeepReadonly<User>
}

interface RawAccountHelper {
  readonly user: ComputedRef<User>
  isSignedIn: ComputedRef<boolean>
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
  export function newRawInstance() {
    const stores = useStore()

    const state = reactive({
      user: UserStore.createEmptyUser(),
      isSignedIn: false,
    })

    const isSignedIn = computed(() => state.isSignedIn)

    const signIn: AccountHelper['signIn'] = user => {
      if (stores.user.get(user.id)) {
        User.populate(state.user, stores.user.set(user))
      } else {
        User.populate(state.user, stores.user.add(user))
      }
      state.isSignedIn = true
    }

    const signOut: AccountHelper['signOut'] = () => {
      User.populate(state.user, UserStore.createEmptyUser())
      state.isSignedIn = false
    }

    const validateSignedIn: AccountHelper['validateSignedIn'] = () => {
      if (!state.isSignedIn) {
        throw new Error(`There is no user signed in.`)
      }
    }

    const instance = {
      user: computed<User>(() => state.user),
      isSignedIn,
      signIn,
      signOut,
      validateSignedIn,
    }

    return isImplemented<RawAccountHelper, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AccountHelper }
