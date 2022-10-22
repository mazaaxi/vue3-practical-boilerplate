import { CartItem, generateId } from '@/services'
import { toBeCopyCartItem, useServiceDependencies } from '../../../helpers'
import { TestUsers } from '@/services/test-data'
import dayjs from 'dayjs'

//==========================================================================
//
//  Test data
//
//==========================================================================

const TaroYamada = TestUsers[0]
const IchiroSuzuki = TestUsers[1]

function CartItems(): CartItem[] {
  return [
    {
      id: 'cartItem1',
      uid: TaroYamada.id,
      productId: 'product1',
      title: 'iPad 4 Mini',
      price: 39700,
      quantity: 2,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'cartItem2',
      uid: TaroYamada.id,
      productId: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 8980,
      quantity: 1,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'cartItem3',
      uid: IchiroSuzuki.id,
      productId: 'product1',
      title: 'iPad 4 Mini',
      price: 39700,
      quantity: 1,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
  ]
}

function CartItem1(): CartItem {
  return CartItems()[0]
}

function CartItem2(): CartItem {
  return CartItems()[1]
}

//==========================================================================
//
//  Tests
//
//==========================================================================

describe('CartStore', () => {
  it('all', async () => {
    const { stores } = useServiceDependencies()
    stores.cart.setAll(CartItems())

    const actual = stores.cart.all

    expect(actual).toEqual(CartItems())
  })

  describe('getById', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.getById(CartItem1().id)!

      expect(actual).toEqual(CartItem1())

      toBeCopyCartItem(stores, actual)
    })

    it('if a non-existent cart item id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.getById('9999')

      expect(actual).toBeUndefined()
    })
  })

  describe('sgetById', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.sgetById(CartItem1().id)

      expect(actual).toEqual(CartItem1())

      toBeCopyCartItem(stores, actual)
    })

    it('if a non-existent cart item id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      let actual!: Error
      try {
        // run the test target
        stores.cart.sgetById('9999')
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified CartItem was not found: '9999'`)
    })
  })

  describe('getByProductId', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.getByProductId(CartItem1().productId)!

      expect(actual).toEqual(CartItem1())
      toBeCopyCartItem(stores, actual)
    })

    it('if a non-existent product id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.getByProductId('9999')

      expect(actual).toBeUndefined()
    })
  })

  describe('sgetByProductId', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.sgetByProductId(CartItem1().productId)

      expect(actual).toEqual(CartItem1())
      toBeCopyCartItem(stores, actual)
    })

    it('if a non-existent product id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      let actual!: Error
      try {
        // run the test target
        stores.cart.sgetByProductId('9999')
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified CartItem was not found: {"productId":"9999"}`)
    })
  })

  describe('getListByUID', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.getListByUID(TaroYamada.id)

      expect(actual[0]).toEqual(CartItem1())
      expect(actual[1]).toEqual(CartItem2())
      toBeCopyCartItem(stores, actual)
    })
  })

  describe('add', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      const cartItemX = CartItem.clone(CartItem1())
      cartItemX.id = generateId()
      cartItemX.uid = 'userX'
      cartItemX.productId = 'productX'
      cartItemX.title = 'Product X'
      cartItemX.price = 999
      cartItemX.quantity = 888

      // run the test target
      const actual = stores.cart.add(cartItemX)

      expect(actual).toEqual(cartItemX)

      const added = stores.cart.sgetById(cartItemX.id)
      expect(added).toEqual(cartItemX)

      toBeCopyCartItem(stores, actual)
    })

    it('if cart item contains extra properties', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      const cartItemX = CartItem.clone(CartItem1())
      cartItemX.id = generateId()
      cartItemX.uid = 'userX'
      cartItemX.productId = 'productX'
      cartItemX.title = 'Product X'
      cartItemX.price = 999
      cartItemX.quantity = 888

      // run the test target
      const actual = stores.cart.add({
        ...cartItemX,
        zzz: 'zzz', // extra property
      } as any)

      expect(actual).toEqual(cartItemX)
      expect(actual).not.toHaveProperty('zzz')

      const added = stores.cart.sgetById(cartItemX.id)
      expect(added).toEqual(cartItemX)
      expect(added).not.toHaveProperty('zzz')

      toBeCopyCartItem(stores, actual)
    })

    it('if specify a cart item id that already exists', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      let actual!: Error
      try {
        // run the test target
        stores.cart.add(CartItem1())
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified CartItem already exists: '${CartItem1().id}'`)
    })
  })

  describe('set', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      const cartItem1 = CartItem.clone(CartItem1())
      cartItem1.title = 'aaa'

      // run the test target
      // NOTE: change only some properties
      const actual = stores.cart.set({
        id: cartItem1.id,
        title: cartItem1.title,
      })!

      expect(actual).toEqual(cartItem1)

      toBeCopyCartItem(stores, actual)
    })

    it('if cart item contains extra properties', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      const cartItem1 = CartItem.clone(CartItem1())

      // run the test target
      const actual = stores.cart.set({
        ...cartItem1,
        zzz: 'zzz', // extra property
      } as any)!

      expect(actual).toEqual(cartItem1)
      expect(actual).not.toHaveProperty('zzz')

      const updated = stores.cart.sgetById(cartItem1.id)
      expect(updated).toEqual(cartItem1)
      expect(updated).not.toHaveProperty('zzz')

      toBeCopyCartItem(stores, actual)
    })

    it('if a non-existent cart item id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.set({
        ...CartItem1(),
        id: '9999',
      })

      expect(actual).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.remove(CartItem1().id)!

      expect(actual).toEqual(CartItem1())

      toBeCopyCartItem(stores, actual)
    })

    it('if a non-existent cart item id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      const actual = stores.cart.remove(CartItem1().id)

      expect(actual).toBeDefined()
    })
  })

  describe('clear', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.cart.setAll(CartItems())

      // run the test target
      stores.cart.clear()

      expect(stores.cart.all.length).toBe(0)
    })
  })
})
