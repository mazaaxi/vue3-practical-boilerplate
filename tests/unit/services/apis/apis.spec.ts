import { CartItem, Product, ToRawEntity, toRawEntities } from '@/services'
import { CartItemEditResponse } from '@/services/apis'
import { TestUsers } from '@/services/test-data'
import dayjs from 'dayjs'
import { provideDependency } from '../../../helpers'

jest.setTimeout(25000)

//==========================================================================
//
//  Test data
//
//==========================================================================

const SignInUser = TestUsers[0]

function Products(): Product[] {
  return [
    {
      id: 'product1',
      title: 'iPad 4 Mini',
      price: 39700,
      stock: 1,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
    {
      id: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 8980,
      stock: 5,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
    {
      id: 'product3',
      title: 'MediaPad 10',
      price: 26400,
      stock: 10,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
    {
      id: 'product4',
      title: 'Surface Go',
      price: 54290,
      stock: 0,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
  ]
}

function RawProducts(): ToRawEntity<Product>[] {
  return toRawEntities(Products())
}

function CartItems(): CartItem[] {
  return [
    {
      id: 'cartItem1',
      uid: 'taro.yamada',
      productId: 'product1',
      title: 'iPad 4 Mini',
      price: 39700,
      quantity: 2,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
    {
      id: 'cartItem2',
      uid: 'taro.yamada',
      productId: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 8980,
      quantity: 1,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
  ]
}

function RawCartItems(): ToRawEntity<CartItem>[] {
  return toRawEntities(CartItems())
}

//==========================================================================
//
//  Test helpers
//
//==========================================================================

/**
 * 擬似的なサインインを実現するためにテスト用IDトークンを設定します。
 */
function setTestIdToken(): void {
  // ここでローカルストレージに保存したIDトークンはAPIリクエストで使用される
  localStorage.setItem('idToken', JSON.stringify({ uid: SignInUser.id }))
}

//==========================================================================
//
//  Tests
//
//==========================================================================

describe('APIContainer', () => {
  describe('getProduct', () => {
    it('ベーシックケース', async () => {
      const { apis } = provideDependency()
      await apis.putTestData({
        products: RawProducts(),
      })

      const product1 = Products()[0]

      // テスト対象実行
      const actual = await apis.getProduct(product1.id)

      expect(actual).toMatchObject(product1)
    })
  })

  describe('getProducts', () => {
    it('ベーシックケース - 引数なし', async () => {
      const { apis } = provideDependency()
      await apis.putTestData({
        products: RawProducts(),
      })

      // テスト対象実行
      const actual = await apis.getProducts()

      expect(actual).toMatchObject(Products())
    })

    it('ベーシックケース - 引数あり', async () => {
      const { apis } = provideDependency()
      await apis.putTestData({
        products: RawProducts(),
      })

      const [product1, product2] = Products()

      // テスト対象実行
      const actual = await apis.getProducts([product1.id, product2.id])

      expect(actual).toMatchObject([product1, product2])
    })
  })

  it('getCartItem', async () => {
    const { apis } = provideDependency()
    await apis.putTestData({
      cartItems: RawCartItems(),
    })

    setTestIdToken()
    const cartItem1 = CartItems()[0]

    // テスト対象実行
    const actual = await apis.getCartItem(cartItem1.id)

    expect(actual).toMatchObject(cartItem1)
  })

  describe('getCartItems', () => {
    it('ベーシックケース - 引数なし', async () => {
      const { apis } = provideDependency()
      await apis.putTestData({
        cartItems: RawCartItems(),
      })

      setTestIdToken()

      // テスト対象実行
      const actual = await apis.getCartItems()

      expect(actual).toMatchObject(CartItems())
    })

    it('ベーシックケース - 引数あり', async () => {
      const { apis } = provideDependency()
      await apis.putTestData({
        cartItems: RawCartItems(),
      })

      setTestIdToken()
      const [cartItem1, cartItem2] = CartItems()

      // テスト対象実行
      const actual = await apis.getCartItems([cartItem1.id, cartItem2.id])

      expect(actual).toMatchObject([cartItem1, cartItem2])
    })
  })

  describe('addCartItems', () => {
    it('ベーシックケース', async () => {
      const { apis } = provideDependency()
      await apis.putTestData({
        products: RawProducts(),
        cartItems: RawCartItems(),
      })

      setTestIdToken()
      const product3 = Products()[2]
      const now = dayjs()

      // テスト対象実行
      const actual = await apis.addCartItems([
        {
          uid: SignInUser.id,
          productId: product3.id,
          title: product3.title,
          price: product3.price,
          quantity: 1,
        },
      ])

      // テスト結果検証
      expect(actual.length).toBe(1)

      const addedCartItem = actual[0]
      expect(addedCartItem.id.length > 0).toBeTruthy()
      expect(addedCartItem.createdAt.isAfter(now)).toBeTruthy()
      expect(addedCartItem.updatedAt.isAfter(now)).toBeTruthy()
      expect(addedCartItem.product.createdAt).toEqual(product3.createdAt)
      expect(addedCartItem.product.updatedAt.isAfter(now)).toBeTruthy()

      expect(addedCartItem).toMatchObject({
        uid: 'taro.yamada',
        productId: product3.id,
        title: product3.title,
        price: product3.price,
        quantity: 1,
        product: {
          id: product3.id,
          stock: product3.stock - 1,
        },
      } as CartItemEditResponse)
    })
  })

  describe('updateCartItems', () => {
    it('ベーシックケース', async () => {
      const { apis } = provideDependency()
      await apis.putTestData({
        products: RawProducts(),
        cartItems: RawCartItems(),
      })

      setTestIdToken()
      const product1 = Products()[0]
      const cartItem1 = CartItems()[0]
      const now = dayjs()

      // テスト対象実行
      const actual = await apis.updateCartItems([
        {
          id: cartItem1.id,
          uid: SignInUser.id,
          quantity: cartItem1.quantity + 1,
        },
      ])

      // テスト結果検証
      expect(actual.length).toBe(1)

      const updatedCartItem = actual[0]
      expect(updatedCartItem.createdAt).toEqual(cartItem1.createdAt)
      expect(updatedCartItem.updatedAt.isAfter(now)).toBeTruthy()
      expect(updatedCartItem.product.createdAt).toEqual(product1.createdAt)
      expect(updatedCartItem.product.updatedAt.isAfter(now)).toBeTruthy()

      expect(updatedCartItem).toMatchObject({
        id: cartItem1.id,
        uid: cartItem1.uid,
        productId: cartItem1.productId,
        title: cartItem1.title,
        price: cartItem1.price,
        quantity: cartItem1.quantity + 1,
        product: {
          id: cartItem1.productId,
          stock: product1.stock - 1,
        },
      } as CartItemEditResponse)
    })
  })

  describe('removeCartItems', () => {
    it('ベーシックケース', async () => {
      const { apis } = provideDependency()
      await apis.putTestData({
        products: RawProducts(),
        cartItems: RawCartItems(),
      })

      setTestIdToken()
      const product1 = Products()[0]
      const cartItem1 = CartItems()[0]
      const now = dayjs()

      // テスト対象実行
      const actual = await apis.removeCartItems([cartItem1.id])

      // テスト結果検証
      expect(actual.length).toBe(1)

      const removedCartItem = actual[0]
      expect(removedCartItem.createdAt).toEqual(cartItem1.createdAt)
      expect(removedCartItem.updatedAt).toEqual(cartItem1.updatedAt)
      expect(removedCartItem.product.createdAt).toEqual(product1.createdAt)
      expect(removedCartItem.product.updatedAt.isAfter(now)).toBeTruthy()

      expect(removedCartItem).toMatchObject({
        id: cartItem1.id,
        uid: cartItem1.uid,
        productId: cartItem1.productId,
        title: cartItem1.title,
        price: cartItem1.price,
        quantity: cartItem1.quantity,
        product: {
          id: cartItem1.productId,
          stock: product1.stock + cartItem1.quantity,
        },
      } as CartItemEditResponse)
    })
  })

  describe('checkoutCart', () => {
    it('ベーシックケース', async () => {
      const { apis } = provideDependency()
      await apis.putTestData({
        products: RawProducts(),
        cartItems: RawCartItems(),
      })

      setTestIdToken()

      // テスト対象実行
      const actual = await apis.checkoutCart()

      // テスト結果検証
      expect(actual).toBeTruthy()

      const current = await apis.getCartItems()
      expect(current.length).toBe(0)
    })
  })
})
