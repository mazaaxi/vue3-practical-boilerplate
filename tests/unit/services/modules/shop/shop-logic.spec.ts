import { CartItem, Product, User, generateId } from '@/services'
import { TestAPIContainer, TestHelperContainer, provideDependency, toBeCopyCartItem, toBeCopyProduct } from '../../../../helpers'
import { AccountHelper } from '@/services/helpers'
import { CartItemEditResponse } from '@/services/apis'
import { TestUsers } from '@/services/test-data'
import { UserStore } from '@/services/stores/user'
import dayjs from 'dayjs'

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
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 8980,
      stock: 5,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'product3',
      title: 'MediaPad 10',
      price: 26400,
      stock: 10,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'product4',
      title: 'Surface Go',
      price: 54290,
      stock: 0,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
  ]
}

function CartItems(): CartItem[] {
  return [
    {
      id: 'cartItem1',
      uid: SignInUser.id,
      productId: 'product1',
      title: 'iPad 4 Mini',
      price: 39700,
      quantity: 2,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'cartItem2',
      uid: SignInUser.id,
      productId: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 8980,
      quantity: 1,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
  ]
}

//==========================================================================
//
//  Tests
//
//==========================================================================

describe('ShopService', () => {
  beforeEach(async () => {
    provideDependency(({ helpers }) => {
      let signInUser: User = UserStore.createEmptyUser()
      td.replace<TestHelperContainer, 'account'>(helpers, 'account', <AccountHelper>{
        ...helpers.account,
        get user() {
          return signInUser
        },
        signIn: user => {
          signInUser = user
        },
        signOut: () => {
          signInUser = UserStore.createEmptyUser()
        },
        validateSignedIn() {
          if (!signInUser.id) throw new Error(`Not signed-in.`)
        },
      })
    })
  })

  it('fetchProducts', async () => {
    const { stores, services } = provideDependency(({ apis }) => {
      // mock settings
      const getProducts = td.replace<TestAPIContainer, 'getProducts'>(apis, 'getProducts')
      td.when(getProducts()).thenResolve(Products())
    })

    // run the test target
    const actual = await services.shop.fetchProducts()

    expect(actual).toEqual(Products())
    expect(stores.product.all).toEqual(Products())
    toBeCopyProduct(stores, actual)
  })

  describe('fetchCartItems', () => {
    it('basic case', async () => {
      const { stores, helpers, services } = provideDependency(({ apis, helpers }) => {
        // mock settings
        const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
        td.when(getCartItems(SignInUser.id)).thenResolve(CartItems())
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      // run the test target
      const actual = await services.shop.fetchCartItems()

      expect(actual).toEqual(CartItems())
      expect(stores.cart.all).toEqual(CartItems())
      toBeCopyCartItem(stores, actual)
    })

    it('if not signed-in', async () => {
      const { stores, services } = provideDependency()

      let actual!: Error
      try {
        // run the test target
        await services.shop.fetchCartItems()
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`Not signed-in.`)

      // verify that there is no change in the store
      expect(stores.cart.all.length).toBe(0)
    })

    it('if an error occurs in the API', async () => {
      const expected = new Error()
      const { stores, services } = provideDependency(({ apis, helpers }) => {
        // mock settings
        const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
        td.when(getCartItems(SignInUser.id)).thenReject(expected)
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // run the test target
        await services.shop.fetchCartItems()
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)
      // verify that there is no change in the store
      expect(stores.cart.all.length).toBe(0)
    })
  })

  describe('addItemToCart', () => {
    it('basic case - add', async () => {
      // set a number of items in stock for a current product
      const products = Products()
      const product3 = products[2]
      product3.stock = 10
      // response object after API execution
      const response: CartItemEditResponse = {
        id: generateId(),
        uid: SignInUser.id,
        productId: product3.id,
        title: product3.title,
        price: product3.price,
        quantity: 1,
        createdAt: dayjs(),
        updatedAt: dayjs(),
        product: {
          id: product3.id,
          stock: product3.stock - 1,
          createdAt: dayjs(),
          updatedAt: dayjs(),
        },
      }

      const { stores, helpers, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(products)
        // mock settings
        const addCartItems = td.replace<TestAPIContainer, 'addCartItems'>(apis, 'addCartItems')
        td.when(
          addCartItems([
            {
              uid: SignInUser.id,
              productId: response.productId,
              title: response.title,
              price: response.price,
              quantity: response.quantity,
            },
          ])
        ).thenResolve([response])
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      // run the test target
      await services.shop.addItemToCart(response.product.id)

      // verify that the item has added to the cart
      const cartItem = stores.cart.sgetById(response.id)
      expect(cartItem.quantity).toBe(response.quantity)
      // verify that the number of products in stock has properly decremented
      const product = stores.product.sgetById(response.productId)
      expect(product.stock).toBe(response.product.stock)
    })

    it('basic case - update', async () => {
      // set a number of items in stock for a current product
      const products = Products()
      const product1 = products[0]
      product1.stock = 10
      // response object after API execution
      const cartItem1 = CartItems()[0]
      expect(cartItem1.productId).toBe(product1.id)
      const response: CartItemEditResponse = {
        ...cartItem1,
        quantity: cartItem1.quantity + 1,
        updatedAt: dayjs(),
        product: {
          id: cartItem1.productId,
          stock: product1.stock - 1,
          createdAt: product1.createdAt,
          updatedAt: dayjs(),
        },
      }

      const { stores, helpers, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(products)
        stores.cart.setAll(CartItems())
        // mock settings
        const updateCartItems = td.replace<TestAPIContainer, 'updateCartItems'>(apis, 'updateCartItems')
        td.when(updateCartItems([{ id: response.id, uid: SignInUser.id, quantity: response.quantity }])).thenResolve([response])
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      // run the test target
      await services.shop.addItemToCart(response.product.id)

      // verify the number of cart items has properly incremented
      const cartItem = stores.cart.sgetById(response.id)
      expect(cartItem.quantity).toBe(response.quantity)
      // verify that the number of products in stock has properly decremented
      const product = stores.product.sgetById(response.productId)
      expect(product.stock).toBe(response.product.stock)
    })

    it('if do not have enough stock', async () => {
      const products = Products()
      const product1 = products[0]
      // set a number of items in stock for a current product
      product1.stock = 0

      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(products)
        // mock settings
        const addCartItems = td.replace<TestAPIContainer, 'addCartItems'>(apis, 'addCartItems')
        td.when(addCartItems(td.matchers.anything())).thenReject(new Error())
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // run the test target
        await services.shop.addItemToCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBeInstanceOf(Error)

      // verify that there is no change in the store
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all.length).toBe(0)
    })

    it('if not signed-in', async () => {
      const products = Products()
      const product1 = products[0]

      const { stores, services } = provideDependency(({ stores }) => {
        // store settings
        stores.product.setAll(products)
      })

      let actual!: Error
      try {
        // run the test target
        await services.shop.addItemToCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`Not signed-in.`)

      // verify that there is no change in the store
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all.length).toBe(0)
    })

    it('if an error occurs in the API', async () => {
      const products = Products()
      const product1 = products[0]

      const expected = new Error()
      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(products)
        // mock settings
        const addCartItems = td.replace<TestAPIContainer, 'addCartItems'>(apis, 'addCartItems')
        td.when(addCartItems(td.matchers.anything())).thenReject(expected)
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // run the test target
        await services.shop.addItemToCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)

      // verify that there is no change in the store
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all.length).toBe(0)
    })
  })

  describe('removeItemFromCart', () => {
    it('basic case - update', async () => {
      // set a number of items in stock for a current product
      const products = Products()
      const product1 = products[0]
      product1.stock = 10
      // set a current cart quantity
      const cartItems = CartItems()
      const cartItem1 = cartItems[0]
      cartItem1.quantity = 2
      // response object after API execution
      expect(cartItem1.productId).toBe(product1.id)
      const response: CartItemEditResponse = {
        ...cartItem1,
        quantity: cartItem1.quantity - 1,
        product: {
          id: cartItem1.productId,
          stock: product1.stock + 1,
          createdAt: product1.updatedAt,
          updatedAt: dayjs(),
        },
      }

      const { stores, helpers, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(products)
        stores.cart.setAll(cartItems)
        // mock settings
        const updateCartItems = td.replace<TestAPIContainer, 'updateCartItems'>(apis, 'updateCartItems')
        td.when(updateCartItems([{ id: response.id, uid: SignInUser.id, quantity: response.quantity }])).thenResolve([response])
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      // run the test target
      await services.shop.removeItemFromCart(response.product.id)

      // verify that the number of cart items has properly decremented
      const cartItem = stores.cart.sgetById(response.id)
      expect(cartItem.quantity).toBe(response.quantity)
      // verify that the number of products in stock has properly incremented
      const product = stores.product.sgetById(response.productId)
      expect(product.stock).toBe(response.product.stock)
    })

    it('basic case - remove', async () => {
      // set a number of items in stock for a current product
      const products = Products()
      const product1 = products[0]
      product1.stock = 10
      // set a current cart quantity
      const cartItems = CartItems()
      const cartItem1 = cartItems[0]
      cartItem1.quantity = 1
      // response object after API execution
      expect(cartItem1.productId).toBe(product1.id)
      const response: CartItemEditResponse = {
        ...cartItem1,
        quantity: cartItem1.quantity - 1,
        product: {
          id: cartItem1.productId,
          stock: product1.stock + 1,
          createdAt: product1.updatedAt,
          updatedAt: dayjs(),
        },
      }

      const { stores, helpers, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(products)
        stores.cart.setAll(cartItems)
        // mock settings
        const removeCartItems = td.replace<TestAPIContainer, 'removeCartItems'>(apis, 'removeCartItems')
        td.when(removeCartItems([response.id])).thenResolve([response])
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      // run the test target
      await services.shop.removeItemFromCart(response.product.id)

      // verify that cart items have removed
      const cartItem = stores.cart.getById(response.id)
      expect(cartItem).toBeUndefined()
      // 商品の在庫数が適切にプラスされたか検証
      // verify that the number of products in stock has properly incremented
      const product = stores.product.sgetById(response.productId)
      expect(product.stock).toBe(response.product.stock)
    })

    it('if not signed-in', async () => {
      const products = Products()
      const product1 = products[0]
      const cartItems = CartItems()

      const { stores, services } = provideDependency(({ stores }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.setAll(cartItems)
      })

      let actual!: Error
      try {
        // run the test target
        await services.shop.removeItemFromCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`Not signed-in.`)

      // verify that there is no change in the store
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all).toEqual(cartItems)
    })

    it('if an error occurs in the API', async () => {
      const products = Products()
      const product1 = products[0]
      // set a current cart quantity
      const cartItems = CartItems()
      const cartItem1 = cartItems[0]
      cartItem1.quantity = 1

      const expected = new Error()
      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.setAll(cartItems)
        // mock settings
        const removeCartItems = td.replace<TestAPIContainer, 'removeCartItems'>(apis, 'removeCartItems')
        td.when(removeCartItems(td.matchers.anything())).thenReject(expected)
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // run the test target
        await services.shop.removeItemFromCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)

      // verify that there is no change in the store
      expect(stores.product.all).toEqual(Products())
      expect(stores.cart.all).toEqual(cartItems)
    })
  })

  describe('checkout', () => {
    it('basic case', async () => {
      const { apis, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.setAll(CartItems())
        // mock settings
        const checkoutCart = td.replace<TestAPIContainer, 'checkoutCart'>(apis, 'checkoutCart')
        td.when(checkoutCart()).thenResolve(true)
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      // run the test target
      await services.shop.checkout()

      expect(services.shop.cartItems.length).toBe(0)
      expect(services.shop.products).toEqual(Products())

      // verify that the API was called with the proper arguments
      const exp = td.explain(apis.checkoutCart)
      expect(exp.calls.length).toBe(1) // only be called once
      expect(exp.calls[0].args[0]).toBeUndefined() // the first call should be no argument
    })

    it('if not signed-in', async () => {
      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.setAll(CartItems())
      })

      let actual!: Error
      try {
        // run the test target
        await services.shop.checkout()
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`Not signed-in.`)

      // verify that there is no change in the store
      expect(stores.product.all).toEqual(Products())
      expect(stores.cart.all).toEqual(CartItems())
    })

    it('if an error occurs in the API', async () => {
      const expected = new Error()
      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.setAll(CartItems())
        // mock settings
        const checkoutCart = td.replace<TestAPIContainer, 'checkoutCart'>(apis, 'checkoutCart')
        td.when(checkoutCart()).thenReject(expected)
        // sign-in user settings
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // run the test target
        await services.shop.checkout()
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)

      // verify that there is no change in the store
      expect(stores.product.all).toEqual(Products())
      expect(stores.cart.all).toEqual(CartItems())
    })
  })
})
