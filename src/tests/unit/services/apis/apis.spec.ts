import type { APICartItem, APIProduct, CartItemEditResponse } from '@/services/apis'
import { CartItem, type Product, toRawEntities } from '@/services'
import { describe, expect, it } from 'vitest'
import { TestUsers } from '@/services/test-data'
import dayjs from 'dayjs'
import { useServiceDependencies } from '@/tests/helpers'

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
      price: 397.0,
      stock: 1,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
    {
      id: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 89.8,
      stock: 5,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
    {
      id: 'product3',
      title: 'MediaPad 10',
      price: 264.0,
      stock: 10,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
    {
      id: 'product4',
      title: 'Surface Go',
      price: 542.9,
      stock: 0,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
  ]
}

function APIProducts(): APIProduct[] {
  return toRawEntities(Products())
}

function CartItems(): CartItem[] {
  return [
    {
      id: 'cartItem1',
      uid: SignInUser.id,
      productId: 'product1',
      title: 'iPad 4 Mini',
      price: 397.0,
      quantity: 2,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
    {
      id: 'cartItem2',
      uid: SignInUser.id,
      productId: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 89.8,
      quantity: 1,
      createdAt: dayjs('2020-01-01T00:00:00.000Z'),
      updatedAt: dayjs('2020-01-02T00:00:00.000Z'),
    },
  ]
}

function APICartItems(): APICartItem[] {
  return toRawEntities(CartItems())
}

//==========================================================================
//
//  Test helpers
//
//==========================================================================

/**
 * Set up a test id token to achieve a pseudo sign-in.
 */
function setTestIdToken(): void {
  // here, the id token stored in the local storage is used in the API request
  localStorage.setItem('idToken', JSON.stringify({ uid: SignInUser.id }))
}

//==========================================================================
//
//  Tests
//
//==========================================================================

describe('AppAPIs', () => {
  describe('getProduct', () => {
    it('basic case', async () => {
      const { apis } = useServiceDependencies()
      await apis.putTestData({
        products: APIProducts(),
      })

      const product1 = Products()[0]

      // run the test target
      const actual = await apis.getProduct(product1.id)

      expect(actual).toMatchObject(product1)
    })
  })

  describe('getProducts', () => {
    it('basic case - without arguments', async () => {
      const { apis } = useServiceDependencies()
      await apis.putTestData({
        products: APIProducts(),
      })

      // run the test target
      const actual = await apis.getProducts() // without arguments

      expect(actual).toMatchObject(Products())
    })

    it('basic case - with arguments', async () => {
      const { apis } = useServiceDependencies()
      await apis.putTestData({
        products: APIProducts(),
      })

      const [product1, product2] = Products() // with arguments

      // run the test target
      const actual = await apis.getProducts([product1.id, product2.id])

      expect(actual).toMatchObject([product1, product2])
    })
  })

  describe('getCartItems', () => {
    it('basic case', async () => {
      const { apis } = useServiceDependencies()
      await apis.putTestData({
        cart_items: APICartItems(),
      })

      setTestIdToken()

      // run the test target
      const actual = await apis.getCartItems()

      expect(actual).toMatchObject(CartItems())
    })
  })

  describe('addCartItems', () => {
    it('basic case', async () => {
      const { apis } = useServiceDependencies()
      await apis.putTestData({
        products: APIProducts(),
        cart_items: APICartItems(),
      })

      setTestIdToken()
      const product3 = Products()[2]
      const now = dayjs()

      // run the test target
      const actual = await apis.addCartItems([
        {
          uid: SignInUser.id,
          productId: product3.id,
          title: product3.title,
          price: product3.price,
          quantity: 1,
        },
      ])

      expect(actual.length).toBe(1)

      const addedCartItem = actual[0]
      expect(addedCartItem.id.length > 0).toBeTruthy()
      expect(addedCartItem.createdAt.isAfter(now)).toBeTruthy()
      expect(addedCartItem.updatedAt.isAfter(now)).toBeTruthy()
      expect(addedCartItem.product.createdAt).toEqual(product3.createdAt)
      expect(addedCartItem.product.updatedAt.isAfter(now)).toBeTruthy()

      expect(addedCartItem).toMatchObject({
        uid: SignInUser.id,
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
    it('basic case', async () => {
      const { apis } = useServiceDependencies()
      await apis.putTestData({
        products: APIProducts(),
        cart_items: APICartItems(),
      })

      setTestIdToken()
      const product1 = Products()[0]
      const cartItem1 = CartItems()[0]
      const now = dayjs()

      // run the test target
      const actual = await apis.updateCartItems([
        {
          id: cartItem1.id,
          uid: SignInUser.id,
          quantity: cartItem1.quantity + 1,
        },
      ])

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
    it('basic case', async () => {
      const { apis } = useServiceDependencies()
      await apis.putTestData({
        products: APIProducts(),
        cart_items: APICartItems(),
      })

      setTestIdToken()
      const product1 = Products()[0]
      const cartItem1 = CartItems()[0]
      const now = dayjs()

      // run the test target
      const actual = await apis.removeCartItems([cartItem1.id])

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
    it('basic case', async () => {
      const { apis } = useServiceDependencies()
      await apis.putTestData({
        products: APIProducts(),
        cart_items: APICartItems(),
      })

      setTestIdToken()

      // run the test target
      const actual = await apis.checkoutCart()

      expect(actual).toBeTruthy()

      const current = await apis.getCartItems()
      expect(current.length).toBe(0)
    })
  })
})
