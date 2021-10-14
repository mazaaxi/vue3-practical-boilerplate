import { User, generateId } from '@/services'
import { DeepReadonly } from 'js-common-lib'
import { cloneDeep } from 'lodash'
import dayjs from 'dayjs'
import { provideDependency } from '../../../helpers'

//==========================================================================
//
//  Test data
//
//==========================================================================

function User1(): User {
  return cloneDeep(
    ((User1 as any).instance ??= {
      id: generateId(),
      email: 'taro.yamada@example.com',
      displayName: 'タロー',
      createdAt: dayjs(),
      updatedAt: dayjs(),
    })
  )
}

function User1_dummy(): User {
  return cloneDeep(
    ((User1 as any).instance ??= {
      id: User1().id,
      email: 'dummy@example.com',
      displayName: 'ダミー',
      createdAt: dayjs(0),
      updatedAt: dayjs(0),
    })
  )
}

function User2(): User {
  return cloneDeep(
    ((User2 as any).instance ??= {
      id: generateId(),
      email: 'ichiro.suzuki@example.com',
      displayName: 'イチロー',
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
 * ストアが保持する生のユーザーを取得します。
 */
function getStateUser(id: string): User | undefined {
  const { stores } = provideDependency()
  return stores.user.state.all.find(user => user.id === id)
}

/**
 * 指定されたアイテムがストアのコピーであることを検証します。
 */
function toBeCopy<T extends DeepReadonly<User>>(actual: T): void {
  const users = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  for (const user of users) {
    const stateNode = getStateUser(user.id)
    expect(user).not.toBe(stateNode)
  }
}

//==========================================================================
//
//  Tests
//
//==========================================================================

describe('UserStore', () => {
  describe('get', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency()
      stores.user.setAll([User1(), User2()])

      const actual = stores.user.get(User1().id)!

      expect(actual).toEqual(User1())
      toBeCopy(actual)
    })
  })

  describe('set', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency()
      stores.user.add(User1_dummy())

      // テスト対象実行
      const user1 = User1()
      const actual = stores.user.set(user1)

      // 戻り値の検証
      expect(actual).toEqual(user1)
      // ストアの値を検証
      const updated = getStateUser(user1.id)
      expect(updated).toEqual(user1)

      toBeCopy(actual)
    })
  })

  describe('add', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency()

      // テスト対象実行
      const actual = stores.user.add(User1())

      // 戻り値の検証
      expect(actual).toEqual(User1())
      // ストアの値を検証
      const added = getStateUser(User1().id)
      expect(added).toEqual(User1())

      toBeCopy(actual)
    })

    it('既に存在するプロフィールを追加しようとした場合', () => {
      const { stores } = provideDependency()
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
    it('ベーシックケース', () => {
      const { stores } = provideDependency()
      stores.user.setAll([User1()])

      // テスト対象実行
      const actual = stores.user.remove(User1().id)!

      // 戻り値の検証
      expect(actual).toEqual(User1())
      // ストアの値を検証
      const exists = Boolean(getStateUser(User1().id))
      expect(exists).toBeFalsy()

      toBeCopy(actual)
    })

    it('存在しないプロフィールを削除しようとした場合', () => {
      const { stores } = provideDependency()

      // テスト対象実行
      const actual = stores.user.remove(User1().id)

      // 戻り値の検証
      expect(actual).toBeUndefined()
    })
  })
})
