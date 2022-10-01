import { DeepPartial, DeepReadonly, isImplemented } from 'js-common-lib'
import { Ref, ref } from 'vue'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { User } from '@/services/base'
import dayjs from 'dayjs'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface UserStore extends UnwrapNestedRefs<WrapUserStore> {}

interface WrapUserStore {
  readonly all: DeepReadonly<Ref<User[]>>
  get(id: string): User | undefined
  set(input: UserForSet): User
  add(user: User): User
  remove(id: string): User | undefined
  setAll(inputs: User[]): void
  removeAll(): User[]
}

type UserForSet = DeepReadonly<
  DeepPartial<User> & {
    id: string
  }
>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace UserStore {
  export function newWrapInstance() {
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const all = ref<User[]>([])

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const get: UserStore['get'] = id => {
      const stateUser = getStateUser(id)
      return User.clone(stateUser)
    }

    const set: UserStore['set'] = input => {
      const stateUser = getStateUser(input.id)
      if (!stateUser) {
        const detail = JSON.stringify({ id: input.id }, null, 2)
        throw new Error(`The specified user was not found: ${detail}`)
      }

      return User.clone(User.populate(stateUser, input))
    }

    const add: UserStore['add'] = user => {
      if (getStateUser(user.id)) {
        const detail = JSON.stringify({ id: user.id }, null, 2)
        throw new Error(`There is the user with the same user id: ${detail}`)
      }

      const stateUser = User.clone(user)
      all.value.push(stateUser)
      return User.clone(stateUser)
    }

    const remove: UserStore['remove'] = id => {
      const index = all.value.findIndex(user => user.id === id)
      if (index < 0) return undefined

      const result = all.value.splice(index, 1)[0]
      return User.clone(result)
    }

    const setAll: UserStore['setAll'] = inputs => {
      removeAll()
      for (const node of inputs) {
        all.value.push(User.clone(node))
      }
    }

    const removeAll: UserStore['removeAll'] = () => {
      return all.value.splice(0)
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function getStateUser(id: string): User | undefined {
      return all.value.find(item => item.id === id)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      all,
      get,
      set,
      add,
      remove,
      setAll,
      removeAll,
    }

    return isImplemented<WrapUserStore, typeof instance>(instance)
  }

  export function createEmptyUser(): User {
    return {
      id: '',
      email: '',
      first: '',
      last: '',
      createdAt: dayjs(0),
      updatedAt: dayjs(0),
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { UserStore }
