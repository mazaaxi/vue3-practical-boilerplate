import { CartItem, generateId } from '@/services'
import { provideDependency, toBeCopyCartItem } from '../../../helpers'
import dayjs from 'dayjs'

//==========================================================================
//
//  Test data
//
//==========================================================================

function CartItems(): CartItem[] {
  return [
    {
      id: 'cartItem1',
      uid: 'taro.yamada',
      productId: 'product1',
      title: 'iPad 4 Mini',
      price: 39700,
      quantity: 2,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'cartItem2',
      uid: 'taro.yamada',
      productId: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 8980,
      quantity: 1,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
  ]
}

function CartItem1(): CartItem {
  return CartItems()[0]
}

//==========================================================================
//
//  Tests
//
//==========================================================================

describe('CartStore', () => {
  it('all', async () => {
    const { stores } = provideDependency(({ stores }) => {
      stores.cart.setAll(CartItems())
    })

    // テスト対象実行
    const actual = stores.cart.all

    expect(actual).toEqual(CartItems())
  })

  it('totalPrice', async () => {
    const { stores } = provideDependency(({ stores }) => {
      stores.cart.setAll(CartItems())
    })

    // テスト対象実行
    const actual = stores.cart.totalPrice

    expect(actual).toBe(88380)
  })

  describe('getById', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      const actual = stores.cart.getById(CartItem1().id)!

      expect(actual).toEqual(CartItem1())
      toBeCopyCartItem(stores, actual)
    })

    it('存在しないカートアイテムIDを指定した場合', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      const actual = stores.cart.getById('9999')

      expect(actual).toBeUndefined()
    })
  })

  describe('sgetById', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      const actual = stores.cart.sgetById(CartItem1().id)

      expect(actual).toEqual(CartItem1())
      toBeCopyCartItem(stores, actual)
    })

    it('存在しないカートアイテムIDを指定した場合', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      let actual!: Error
      try {
        // テスト対象実行
        stores.cart.sgetById('9999')
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified CartItem was not found: '9999'`)
    })
  })

  describe('getByProductId', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      const actual = stores.cart.getByProductId(CartItem1().productId)!

      expect(actual).toEqual(CartItem1())
      toBeCopyCartItem(stores, actual)
    })

    it('存在しない商品IDを指定した場合', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      const actual = stores.cart.getByProductId('9999')

      expect(actual).toBeUndefined()
    })
  })

  describe('sgetByProductId', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      const actual = stores.cart.sgetByProductId(CartItem1().productId)

      expect(actual).toEqual(CartItem1())
      toBeCopyCartItem(stores, actual)
    })

    it('存在しない商品IDを指定した場合', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      let actual!: Error
      try {
        // テスト対象実行
        stores.cart.sgetByProductId('9999')
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified CartItem was not found: {"productId":"9999"}`)
    })
  })

  describe('add', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      const cartItemX = CartItem.clone(CartItem1())
      cartItemX.id = generateId()
      cartItemX.uid = 'userX'
      cartItemX.productId = 'productX'
      cartItemX.title = 'Product X'
      cartItemX.price = 999
      cartItemX.quantity = 888

      // テスト対象実行
      const actual = stores.cart.add(cartItemX)

      expect(actual).toEqual(cartItemX)
      toBeCopyCartItem(stores, actual)

      const added = stores.cart.sgetById(cartItemX.id)
      expect(added).toEqual(cartItemX)
    })

    it('余分なプロパティを含んだ場合', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      const cartItemX = CartItem.clone(CartItem1())
      cartItemX.id = generateId()
      cartItemX.uid = 'userX'
      cartItemX.productId = 'productX'
      cartItemX.title = 'Product X'
      cartItemX.price = 999
      cartItemX.quantity = 888

      // テスト対象実行
      const actual = stores.cart.add({
        ...cartItemX,
        zzz: 'zzz',
      } as any)

      expect(actual).toEqual(cartItemX)
      expect(actual).not.toHaveProperty('zzz')
      toBeCopyCartItem(stores, actual)

      const added = stores.cart.sgetById(cartItemX.id)
      expect(added).toEqual(cartItemX)
      expect(added).not.toHaveProperty('zzz')
    })

    it('既に存在するカートアイテムIDを指定した場合', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      let actual!: Error
      try {
        // テスト対象実行
        stores.cart.add(CartItem1())
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified CartItem already exists: '${CartItem1().id}'`)
    })
  })

  describe('set', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      const cartItem1 = CartItem.clone(CartItem1())
      cartItem1.title = 'aaa'

      // テスト対象実行
      // ※一部のプロパティだけを変更
      const actual = stores.cart.set({
        id: cartItem1.id,
        title: cartItem1.title,
      })!

      expect(actual).toEqual(cartItem1)
      toBeCopyCartItem(stores, actual)
    })

    it('余分なプロパティを含んだ場合', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      const cartItem1 = CartItem.clone(CartItem1())

      // テスト対象実行
      const actual = stores.cart.set({
        ...cartItem1,
        zzz: 'zzz',
      } as any)!

      expect(actual).toEqual(cartItem1)
      expect(actual).not.toHaveProperty('zzz')
      toBeCopyCartItem(stores, actual)

      const updated = stores.cart.sgetById(cartItem1.id)
      expect(updated).toEqual(cartItem1)
      expect(updated).not.toHaveProperty('zzz')
    })

    it('存在しないカートアイテムIDを指定した場合', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      const actual = stores.cart.set({
        ...CartItem1(),
        id: '9999',
      })

      expect(actual).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      const actual = stores.cart.remove(CartItem1().id)!

      expect(actual).toEqual(CartItem1())
      toBeCopyCartItem(stores, actual)
    })

    it('存在しないカートアイテムIDを指定した場合', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      const actual = stores.cart.remove(CartItem1().id)

      expect(actual).toBeDefined()
    })
  })

  describe('clear', () => {
    it('ベーシックケース', () => {
      const { stores } = provideDependency(({ stores }) => {
        stores.cart.setAll(CartItems())
      })

      // テスト対象実行
      stores.cart.clear()

      expect(stores.cart.all.length).toBe(0)
    })
  })
})
