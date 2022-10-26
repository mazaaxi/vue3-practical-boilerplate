import { User, generateId } from '@/services'
import { toBeCopyUser, useServiceDependencies } from '@/tests/helpers'
import { cloneDeep } from 'lodash'
import dayjs from 'dayjs'

//==========================================================================
//
//  Test data
//
//==========================================================================

function User1(): User {
  return cloneDeep(
    ((User1 as any).instance =
      (User1 as any).instance ??
      <User>{
        id: generateId(),
        email: 'taro.yamada@example.com',
        first: 'Taro',
        last: 'Yamada',
        createdAt: dayjs(),
        updatedAt: dayjs(),
      })
  )
}

function User2(): User {
  return cloneDeep(
    ((User2 as any).instance =
      (User2 as any).instance ??
      <User>{
        id: generateId(),
        email: 'ichiro.suzuki@example.com',
        first: 'Ichiro',
        last: 'Suzuki',
        createdAt: dayjs(),
        updatedAt: dayjs(),
      })
  )
}

//==========================================================================
//
//  Test helpers
//
//==========================================================================

/**
 * Retrieves the "raw" users held by the store.
 * @param id ID of a user you want to retrieve
 */
function getStoreUser(id: string): User | undefined {
  const { stores } = useServiceDependencies()
  return stores.user.all.find(user => user.id === id)
}

//==========================================================================
//
//  Tests
//
//==========================================================================

describe('UserStore', () => {
  describe('get', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.user.setAll([User1(), User2()])

      const actual = stores.user.get(User1().id)!

      expect(actual).toEqual(User1())
      toBeCopyUser(stores, actual)
    })
  })

  describe('set', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.user.add(User1())

      // run the test target
      const user1 = User1()
      const actual = stores.user.set(user1)

      // verify the return value
      expect(actual).toEqual(user1)

      // verify the store status
      const updated = getStoreUser(user1.id)
      expect(updated).toEqual(user1)

      toBeCopyUser(stores, actual)
    })
  })

  describe('add', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()

      // run the test target
      const actual = stores.user.add(User1())

      // verify the return value
      expect(actual).toEqual(User1())

      // verify the store status
      const added = getStoreUser(User1().id)
      expect(added).toEqual(User1())

      toBeCopyUser(stores, actual)
    })

    it('if trying to add a user that already exists', () => {
      const { stores } = useServiceDependencies()
      stores.user.setAll([User1()])

      let actual!: Error
      try {
        stores.user.add(User1())
      } catch (err: any) {
        actual = err
      }

      const detail = JSON.stringify({ id: User1().id }, null, 2)
      expect(actual.message).toBe(`There is the user with the same user id: ${detail}`)
    })
  })

  describe('remove', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.user.setAll([User1()])

      // run the test target
      const actual = stores.user.remove(User1().id)!

      // verify the return value
      expect(actual).toEqual(User1())

      // verify the store status
      const exists = Boolean(getStoreUser(User1().id))
      expect(exists).toBeFalsy()

      toBeCopyUser(stores, actual)
    })

    it('if trying to remove a user that already exists', () => {
      const { stores } = useServiceDependencies()

      // run the test target
      const actual = stores.user.remove(User1().id)

      // verify the return value
      expect(actual).toBeUndefined()
    })
  })
})
