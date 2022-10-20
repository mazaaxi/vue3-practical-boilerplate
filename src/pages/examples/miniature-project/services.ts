import { ComputedRef, Ref, computed, reactive, ref } from 'vue'
import {
  DeepPartial,
  DeepReadonly,
  RequiredAre,
  isImplemented,
  pickProps,
  sleep,
} from 'js-common-lib'
import { ItemsChangeType, generateId } from '@/services'
import { Unsubscribe, createNanoEvents } from 'nanoevents'
import { UnwrapNestedRefs } from '@vue/reactivity'
const cloneDeep = require('rfdc')()

//==========================================================================
//
//  Entities
//
//==========================================================================

interface User {
  id: string
  first: string
  last: string
  age: number
}

//==========================================================================
//
//  APIs
//
//==========================================================================

//--------------------------------------------------------------------------
//  APIs
//--------------------------------------------------------------------------

interface APIs {
  getAllUsers(): Promise<User[]>
  addUser(user: User): Promise<User>
  setUser(user: RequiredAre<DeepPartial<User>, 'id'>): Promise<User>
  removeUser(id: string): Promise<User>
}

namespace APIs {
  const users: User[] = []
  for (let i = 1; i <= 3; i++) {
    users.push({
      id: generateId(),
      first: 'First' + i.toString().padStart(5, '0'),
      last: 'Last' + i.toString().padStart(5, '0'),
      age: Math.floor(Math.random() * 101) + 0,
    })
  }

  let instance: APIs

  export function setupAPIs(): APIs {
    instance = newInstance()
    return instance
  }

  export function useAPIs(): APIs {
    return instance
  }

  export function newInstance() {
    const getAllUsers: APIs['getAllUsers'] = async () => {
      await sleep(500)
      return cloneDeep(users)
    }

    const addUser: APIs['addUser'] = async user => {
      await sleep(500)
      if (users.find(item => item.id === user.id)) {
        throw new Error(`A user with the same id '${user.id}' already exists.`)
      }
      users.push(user)
      return cloneDeep(user)
    }

    const setUser: APIs['setUser'] = async user => {
      await sleep(500)
      const target = users.find(item => item.id === user.id)
      if (!target) {
        throw new Error(`The user with the specified id '${user.id}' does not exist.`)
      }
      return cloneDeep(Object.assign(target, user))
    }

    const removeUser: APIs['removeUser'] = async id => {
      await sleep(500)
      const index = users.findIndex(item => item.id === id)
      if (index < 0) {
        throw new Error(`The user with the specified id '${id}' does not exist.`)
      }
      const target = users.splice(index, 1)[0]
      return cloneDeep(target)
    }

    const result = {
      getAllUsers,
      addUser,
      setUser,
      removeUser,
    }

    return isImplemented<APIs, typeof result>(result)
  }
}

const { setupAPIs, useAPIs } = APIs

//==========================================================================
//
//  Stores
//
//==========================================================================

//--------------------------------------------------------------------------
//  Stores
//--------------------------------------------------------------------------

interface Stores {
  readonly user: UserStore
}

namespace Stores {
  let instance: Stores

  export function setupStores(): Stores {
    instance = {
      user: UserStore.setupInstance(),
    }
    return instance
  }

  export function useStores(): Stores {
    return instance
  }
}

const { setupStores, useStores } = Stores

//--------------------------------------------------------------------------
//  UserStore
//--------------------------------------------------------------------------

interface UserStore extends UnwrapNestedRefs<WrapUserStore> {}

interface WrapUserStore {
  readonly all: DeepReadonly<Ref<User[]>>
  readonly averageAge: ComputedRef<number>
  get(id: string): User | undefined
  add(user: User): User
  set(user: RequiredAre<DeepPartial<User>, 'id'>): User
  remove(uid: string): User
}

namespace UserStore {
  let instance: UserStore

  export function setupInstance(): UserStore {
    instance = reactive(newWrapInstance())
    return instance
  }

  export function newWrapInstance() {
    const all = ref<User[]>([])

    const averageAge = computed(() => {
      if (all.value.length === 0) return 0
      const totalAge = all.value.reduce((result, user) => result + user.age, 0)
      return Math.round(totalAge / all.value.length)
    })

    const get: WrapUserStore['get'] = id => {
      const user = all.value.find(user => user.id === id)
      return cloneDeep(user)
    }

    const add: WrapUserStore['add'] = user => {
      if (get(user.id)) {
        throw new Error(`A user with the same id '${user.id}' already exists.`)
      }

      const newUser = pickProps(user, ['id', 'first', 'last', 'age'])
      all.value.push(newUser)

      return cloneDeep(newUser)
    }

    const set: WrapUserStore['set'] = user => {
      const target = all.value.find(item => item.id === user.id)
      if (!target) {
        throw new Error(`The user with the specified id '${user.id}' does not exist.`)
      }

      Object.assign(target, pickProps(user, ['id', 'first', 'last', 'age']))

      return cloneDeep(target)
    }

    const remove: WrapUserStore['remove'] = id => {
      const index = all.value.findIndex(user => user.id === id)
      if (index < 0) {
        throw new Error(`The user with the specified id '${id}' does not exist.`)
      }

      const target = all.value.splice(index, 1)[0]

      return cloneDeep(target)
    }

    const result = {
      all,
      averageAge,
      get,
      add,
      set,
      remove,
    }

    return isImplemented<WrapUserStore, typeof result>(result)
  }
}

//==========================================================================
//
//  Services
//
//==========================================================================

//--------------------------------------------------------------------------
//  Services
//--------------------------------------------------------------------------

interface Services {
  readonly admin: AdminLogic
}

namespace Services {
  let instance: Services

  export function setupServices(): Services {
    setupAPIs()
    setupStores()

    instance = {
      admin: AdminLogic.setupInstance(),
    }
    return instance
  }

  export function useServices(): Services {
    return instance
  }
}

const { setupServices, useServices } = Services

//--------------------------------------------------------------------------
//  AdminLogic
//--------------------------------------------------------------------------

interface AdminLogic extends UnwrapNestedRefs<WrapAdminLogic> {}

interface WrapAdminLogic {
  averageUserAge: ComputedRef<number>
  fetchUsers(): Promise<void>
  addUser(user: User): Promise<User>
  setUser(user: RequiredAre<DeepPartial<User>, 'id'>): Promise<User>
  removeUser(id: string): Promise<User>
  getAllUsers(): User[]
  onUsersChange(
    cb: (changeType: ItemsChangeType, newUser?: User, oldUser?: User) => void
  ): Unsubscribe
}

namespace AdminLogic {
  let instance: AdminLogic

  export function setupInstance() {
    instance = reactive(newWrapInstance())
    return instance
  }

  export function newWrapInstance() {
    const apis = useAPIs()
    const stores = useStores()
    const emitter = createNanoEvents<{
      usersChange: (changeType: ItemsChangeType, newUser?: User, oldUser?: User) => void
    }>()

    const fetchUsers: WrapAdminLogic['fetchUsers'] = async () => {
      const response = await apis.getAllUsers()
      response.forEach(responseUser => {
        const exists = stores.user.get(responseUser.id)
        if (exists) {
          const updated = stores.user.set(responseUser)
          emitter.emit('usersChange', 'Update', updated, exists)
        } else {
          const added = stores.user.add(responseUser)
          emitter.emit('usersChange', 'Add', added, undefined)
        }
      })
    }

    const addUser: WrapAdminLogic['addUser'] = async user => {
      const response = await apis.addUser(user)
      const added = stores.user.add(response)
      emitter.emit('usersChange', 'Add', added, undefined)
      return added
    }

    const setUser: WrapAdminLogic['setUser'] = async user => {
      const oldUser = stores.user.get(user.id)
      const response = await apis.setUser(user)
      const updated = stores.user.set(response)
      emitter.emit('usersChange', 'Update', updated, oldUser)
      return updated
    }

    const removeUser: WrapAdminLogic['removeUser'] = async id => {
      const response = await apis.removeUser(id)
      const removed = stores.user.remove(response.id)
      emitter.emit('usersChange', 'Remove', undefined, removed)
      return removed
    }

    const getAllUsers: WrapAdminLogic['getAllUsers'] = () => {
      return cloneDeep(stores.user.all)
    }

    const onUsersChange: WrapAdminLogic['onUsersChange'] = cb => {
      return emitter.on('usersChange', cb)
    }

    const result = {
      averageUserAge: computed(() => stores.user.averageAge),
      fetchUsers,
      addUser,
      setUser,
      removeUser,
      getAllUsers,
      onUsersChange,
    }

    return isImplemented<WrapAdminLogic, typeof result>(result)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { User, setupServices, useServices }
