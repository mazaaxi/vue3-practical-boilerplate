import { CartItem, Product, generateId } from '@/services'
import { TestAPIContainer, TestServiceContainer, provideDependency } from '../../../../helpers'
import { CartItemEditResponse } from '@/services/apis'
import { TestUsers } from '@/services/test-data'
import dayjs from 'dayjs'

//==========================================================================
//
//  Test data
//
//==========================================================================

const TaroYamada = TestUsers[0]
const IchiroSuzuki = TestUsers[1]

function Products(): Product[] {
  return [
    {
      id: 'product1',
      title: 'iPad 4 Mini',
      price: 397.0,
      stock: 1,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 89.8,
      stock: 5,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'product3',
      title: 'MediaPad 10',
      price: 264.0,
      stock: 10,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'product4',
      title: 'Surface Go',
      price: 542.9,
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
      uid: TaroYamada.id,
      productId: 'product1',
      title: 'iPad 4 Mini',
      price: 397.0,
      quantity: 2,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'cartItem2',
      uid: TaroYamada.id,
      productId: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 89.8,
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

function sortIdFunc(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

function validateOnItemsChange<ITEM extends { id: string }>(
  services: TestServiceContainer,
  event: 'onProductsChange' | 'onUserCartItemsChange',
  expected: { newItem: ITEM | undefined; oldItem: ITEM | undefined }[]
) {
  const expectedItems = [...expected]

  return new Promise<void>(resolve => {
    services.shop[event]((newItem, oldItem) => {
      const expectedItem = expectedItems.splice(0, 1)[0]
      expect(expectedItem.newItem).toEqual(newItem)
      expect(expectedItem.oldItem).toEqual(oldItem)
      !expectedItems.length && resolve()
    })
  })
}

//==========================================================================
//
//  Tests
//
//==========================================================================

describe('ShopLogic', () => {
  beforeEach(async () => {
    const { services } = provideDependency()

    // Watching for user ID changes, but stopped because they get in the way of testing
    services.shop.userIdWatchStopHandle()
  })

  it('totalPrice', async () => {
    const { services, stores } = provideDependency()
    // store settings
    stores.cart.setAll(CartItems())
    // sign-in user settings
    await services.account.signIn(TaroYamada.id)

    const actual = services.shop.cartTotalPrice

    expect(actual).toBe(883.8)
  })

  describe('fetchProducts', () => {
    it('if products has not yet been loaded', async () => {
      const newProduct1: Product = Products()[0]
      const newProduct2: Product = Products()[1]
      const newProduct3: Product = Products()[2]
      const newProduct4: Product = Products()[3]
      const expectedStoreProducts = [newProduct1, newProduct2, newProduct3, newProduct4]

      const { services, apis, stores } = provideDependency()
      // mock settings
      const getProducts = td.replace<TestAPIContainer, 'getProducts'>(apis, 'getProducts')
      td.when(getProducts()).thenResolve(expectedStoreProducts)

      // event validation settings
      const event = validateOnItemsChange(services, 'onProductsChange', [
        { newItem: newProduct1, oldItem: undefined },
        { newItem: newProduct2, oldItem: undefined },
        { newItem: newProduct3, oldItem: undefined },
        { newItem: newProduct4, oldItem: undefined },
      ])

      // run the test target
      await services.shop.fetchProducts()

      // store validation
      const actual = [...stores.product.all].sort(sortIdFunc)
      expect(actual).toEqual(Products().sort(sortIdFunc))

      // wait for the event validation to end
      await event
    })

    it('if part of products has already been loaded', async () => {
      const oldProduct2 = Products()[1]
      const newProduct1: Product = Products()[0]
      const newProduct2: Product = { ...oldProduct2, title: 'FIRE HD 8 TABLET' }
      const newProduct3: Product = Products()[2]
      const newProduct4: Product = Products()[3]
      const expectedStoreProducts = [newProduct1, newProduct2, newProduct3, newProduct4]

      const { services, apis, stores } = provideDependency()
      // store settings
      stores.product.add(oldProduct2)
      // mock settings
      const getProducts = td.replace<TestAPIContainer, 'getProducts'>(apis, 'getProducts')
      td.when(getProducts()).thenResolve(expectedStoreProducts)

      // event validation settings
      const event = validateOnItemsChange(services, 'onProductsChange', [
        { newItem: newProduct1, oldItem: undefined },
        { newItem: newProduct2, oldItem: oldProduct2 },
        { newItem: newProduct3, oldItem: undefined },
        { newItem: newProduct4, oldItem: undefined },
      ])

      // run the test target
      await services.shop.fetchProducts()

      // store validation
      const actual = [...stores.product.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreProducts.sort(sortIdFunc))

      // wait for the event validation to end
      await event
    })

    it('if a non-existent product has been loaded', async () => {
      const oldProduct2 = Products()[1] // the product that exist locally, but not on the server
      const newProduct1: Product = Products()[0]
      const newProduct3: Product = Products()[2]
      const newProduct4: Product = Products()[3]
      const expectedStoreProducts = [newProduct1, newProduct3, newProduct4]

      const { services, apis, stores } = provideDependency()
      // store settings
      stores.product.add(oldProduct2)
      // mock settings
      const getProducts = td.replace<TestAPIContainer, 'getProducts'>(apis, 'getProducts')
      td.when(getProducts()).thenResolve(expectedStoreProducts)

      // event validation settings
      const event = validateOnItemsChange(services, 'onProductsChange', [
        { newItem: newProduct1, oldItem: undefined },
        { newItem: newProduct3, oldItem: undefined },
        { newItem: newProduct4, oldItem: undefined },
        { newItem: undefined, oldItem: oldProduct2 },
      ])

      // run the test target
      await services.shop.fetchProducts()

      // store validation
      const actual = [...stores.product.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreProducts.sort(sortIdFunc))

      // wait for the event validation to end
      await event
    })
  })

  describe('fetchUserCartItems', () => {
    it('if cart items has not yet been loaded', async () => {
      const newCartItem1: CartItem = CartItems()[0]
      const newCartItem2: CartItem = CartItems()[1]
      const expectedStoreCartItems = [newCartItem1, newCartItem2]

      const { services, apis, stores } = provideDependency()
      // mock settings
      const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
      td.when(getCartItems()).thenResolve(expectedStoreCartItems)
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      // event validation settings
      const event = validateOnItemsChange(services, 'onUserCartItemsChange', [
        { newItem: newCartItem1, oldItem: undefined },
        { newItem: newCartItem2, oldItem: undefined },
      ])

      // run the test target
      await services.shop.fetchUserCartItems()

      // store validation
      const actual = [...stores.cart.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreCartItems.sort(sortIdFunc))

      // wait for the event validation to end
      await event
    })

    it('if part of cart items has already been loaded', async () => {
      const oldCartItem2: CartItem = CartItems()[1]
      const newCartItem1: CartItem = CartItems()[0]
      const newCartItem2: CartItem = { ...oldCartItem2, price: 90, title: 'FIRE HD 8 TABLET' }
      const expectedStoreCartItems = [newCartItem1, newCartItem2]

      const { services, apis, stores } = provideDependency()
      // store settings
      stores.cart.add(oldCartItem2)
      // mock settings
      const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
      td.when(getCartItems()).thenResolve(expectedStoreCartItems)
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      // event validation settings
      const event = validateOnItemsChange(services, 'onUserCartItemsChange', [
        { newItem: newCartItem1, oldItem: undefined },
        { newItem: newCartItem2, oldItem: oldCartItem2 },
      ])

      // run the test target
      await services.shop.fetchUserCartItems()

      // store validation
      const actual = [...stores.cart.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreCartItems.sort(sortIdFunc))

      // wait for the event validation to end
      await event
    })

    it('if a non-existent cart item has been loaded', async () => {
      const oldCartItem2: CartItem = CartItems()[1] // the cart item that exist locally, but not on the server
      const newCartItem1: CartItem = CartItems()[0]
      const expectedStoreCartItems = [newCartItem1]

      const { services, apis, stores } = provideDependency()
      // store settings
      stores.cart.add(oldCartItem2)
      // mock settings
      const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
      td.when(getCartItems()).thenResolve(expectedStoreCartItems)
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      // event validation settings
      const event = validateOnItemsChange(services, 'onUserCartItemsChange', [
        { newItem: newCartItem1, oldItem: undefined },
        { newItem: undefined, oldItem: oldCartItem2 },
      ])

      // run the test target
      await services.shop.fetchUserCartItems()

      // store validation
      const actual = [...stores.cart.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreCartItems.sort(sortIdFunc))

      // wait for the event validation to end
      await event
    })

    it('if not signed-in', async () => {
      const { stores, services } = provideDependency()

      let actual!: Error
      try {
        // run the test target
        await services.shop.fetchUserCartItems()
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`There is no signed-in user.`)

      // validate that there is no change in the store
      expect(stores.cart.all.length).toBe(0)
    })

    it('if an error occurs in the API', async () => {
      const expected = new Error()
      const { services, apis, stores } = provideDependency()
      // mock settings
      const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
      td.when(getCartItems()).thenReject(expected)
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      let actual!: Error
      try {
        // run the test target
        await services.shop.fetchUserCartItems()
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)
      // validate that there is no change in the store
      expect(stores.cart.all.length).toBe(0)
    })
  })

  describe('incrementCartItem', () => {
    it('basic case - add', async () => {
      const quantity = 1

      const oldProduct3 = Products()[2]
      const newProduct3: Product = {
        ...oldProduct3,
        stock: oldProduct3.stock - quantity,
        updatedAt: dayjs(),
      }
      const expectedStoreProduct = newProduct3

      const newCartItem3: CartItem = {
        id: generateId(),
        uid: TaroYamada.id,
        productId: newProduct3.id,
        title: newProduct3.title,
        price: newProduct3.price,
        quantity,
        createdAt: dayjs(),
        updatedAt: dayjs(),
      }
      const expectedStoreCartItem = newCartItem3

      const response: CartItemEditResponse = {
        ...newCartItem3,
        product: {
          ...newProduct3,
        },
      }

      const { services, stores, apis } = provideDependency()
      // store settings
      stores.product.setAll(Products())
      // mock settings
      const addCartItems = td.replace<TestAPIContainer, 'addCartItems'>(apis, 'addCartItems')
      td.when(
        addCartItems([
          {
            uid: TaroYamada.id,
            productId: response.productId,
            title: response.title,
            price: response.price,
            quantity: response.quantity,
          },
        ])
      ).thenResolve([response])
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      // event validation settings
      const events: Promise<void>[] = []
      events.push(
        validateOnItemsChange(services, 'onProductsChange', [
          { newItem: newProduct3, oldItem: oldProduct3 },
        ])
      )
      events.push(
        validateOnItemsChange(services, 'onUserCartItemsChange', [
          { newItem: newCartItem3, oldItem: undefined },
        ])
      )

      // run the test target
      await services.shop.incrementCartItem(response.product.id)

      // store validation
      expect(stores.product.getById(expectedStoreProduct.id)).toEqual(expectedStoreProduct)
      expect(stores.cart.getById(expectedStoreCartItem.id)).toEqual(expectedStoreCartItem)

      // wait for the event validation to end
      await Promise.all(events)
    })

    it('basic case - update', async () => {
      const quantity = 1

      const oldProduct1 = Products()[0]
      const newProduct1: Product = {
        ...oldProduct1,
        stock: oldProduct1.stock - quantity,
        updatedAt: dayjs(),
      }
      const expectedStoreProduct = newProduct1
      const expectedEventProduct = { newProduct: newProduct1, oldProduct: oldProduct1 }

      const oldCartItem1 = CartItems()[0]
      const newCartItem1: CartItem = {
        ...oldCartItem1,
        quantity: oldCartItem1.quantity + quantity,
        updatedAt: dayjs(),
      }
      const expectedStoreCartItem = newCartItem1
      const expectedEventCartItem = { newCartItem: newCartItem1, oldCartItem: oldCartItem1 }

      const response: CartItemEditResponse = {
        ...newCartItem1,
        product: {
          ...newProduct1,
        },
      }

      const { services, apis, stores } = provideDependency()
      // store settings
      stores.product.setAll(Products())
      stores.cart.add(oldCartItem1)
      // mock settings
      const updateCartItems = td.replace<TestAPIContainer, 'updateCartItems'>(
        apis,
        'updateCartItems'
      )
      td.when(
        updateCartItems([
          {
            uid: TaroYamada.id,
            id: response.id,
            quantity: response.quantity,
          },
        ])
      ).thenResolve([response])
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      // event validation settings
      const events: Promise<void>[] = []
      events.push(
        validateOnItemsChange(services, 'onProductsChange', [
          { newItem: newProduct1, oldItem: oldProduct1 },
        ])
      )
      events.push(
        validateOnItemsChange(services, 'onUserCartItemsChange', [
          { newItem: newCartItem1, oldItem: oldCartItem1 },
        ])
      )

      // run the test target
      await services.shop.incrementCartItem(response.product.id)

      // store validation
      expect(stores.product.getById(expectedStoreProduct.id)).toEqual(expectedStoreProduct)
      expect(stores.cart.getById(expectedStoreCartItem.id)).toEqual(expectedStoreCartItem)

      // wait for the event validation to end
      await Promise.all(events)
    })

    it('if do not have enough stock', async () => {
      const products = Products()
      const product1 = products[0]
      // set a number of items in stock for a current product
      product1.stock = 0

      const { stores, apis, services } = provideDependency()
      // store settings
      stores.product.setAll(products)
      // mock settings
      const addCartItems = td.replace<TestAPIContainer, 'addCartItems'>(apis, 'addCartItems')
      td.when(addCartItems(td.matchers.anything())).thenReject(new Error())
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      let actual!: Error
      try {
        // run the test target
        await services.shop.incrementCartItem(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBeInstanceOf(Error)

      // validate that there is no change in the store
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
        await services.shop.incrementCartItem(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`There is no signed-in user.`)

      // validate that there is no change in the store
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all.length).toBe(0)
    })

    it('if an error occurs in the API', async () => {
      const products = Products()
      const product1 = products[0]

      const expected = new Error()
      const { stores, apis, services } = provideDependency()
      // store settings
      stores.product.setAll(products)
      // mock settings
      const addCartItems = td.replace<TestAPIContainer, 'addCartItems'>(apis, 'addCartItems')
      td.when(addCartItems(td.matchers.anything())).thenReject(expected)
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      let actual!: Error
      try {
        // run the test target
        await services.shop.incrementCartItem(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)

      // validate that there is no change in the store
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all.length).toBe(0)
    })
  })

  describe('decrementCartItem', () => {
    it('basic case - update', async () => {
      const quantity = 1

      const oldProduct1 = Products()[0]
      const newProduct1: Product = {
        ...oldProduct1,
        stock: oldProduct1.stock + quantity,
        updatedAt: dayjs(),
      }
      const expectedStoreProduct = newProduct1

      const oldCartItem1 = CartItems()[0]
      const newCartItem1: CartItem = {
        ...oldCartItem1,
        quantity: oldCartItem1.quantity - quantity,
        updatedAt: dayjs(),
      }
      const expectedStoreCartItem = newCartItem1

      const response: CartItemEditResponse = {
        ...newCartItem1,
        product: {
          ...newProduct1,
        },
      }

      const { services, apis, stores } = provideDependency()
      // store settings
      stores.product.setAll(Products())
      stores.cart.add(oldCartItem1)
      // mock settings
      const updateCartItems = td.replace<TestAPIContainer, 'updateCartItems'>(
        apis,
        'updateCartItems'
      )
      td.when(
        updateCartItems([
          {
            uid: TaroYamada.id,
            id: response.id,
            quantity: response.quantity,
          },
        ])
      ).thenResolve([response])
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      // event validation settings
      const events: Promise<void>[] = []
      events.push(
        validateOnItemsChange(services, 'onProductsChange', [
          { newItem: newProduct1, oldItem: oldProduct1 },
        ])
      )
      events.push(
        validateOnItemsChange(services, 'onUserCartItemsChange', [
          { newItem: newCartItem1, oldItem: oldCartItem1 },
        ])
      )

      // run the test target
      await services.shop.decrementCartItem(response.product.id)

      // store validation
      expect(stores.product.getById(expectedStoreProduct.id)).toEqual(expectedStoreProduct)
      expect(stores.cart.getById(expectedStoreCartItem.id)).toEqual(expectedStoreCartItem)

      // wait for the event validation to end
      await Promise.all(events)
    })

    it('basic case - remove', async () => {
      const quantity = 1

      const oldProduct1 = Products()[0]
      const newProduct1: Product = {
        ...oldProduct1,
        stock: oldProduct1.stock + quantity,
        updatedAt: dayjs(),
      }
      const expectedStoreProduct = newProduct1

      const oldCartItem1: CartItem = { ...CartItems()[0], quantity }
      const expectedStoreCartItem = oldCartItem1

      const response: CartItemEditResponse = {
        ...oldCartItem1,
        quantity: oldCartItem1.quantity - 1,
        product: {
          ...newProduct1,
        },
      }

      const { services, apis, stores } = provideDependency()
      // store settings
      stores.product.setAll(Products())
      stores.cart.add(oldCartItem1)
      // mock settings
      const removeCartItems = td.replace<TestAPIContainer, 'removeCartItems'>(
        apis,
        'removeCartItems'
      )
      td.when(removeCartItems([oldCartItem1.id])).thenResolve([response])
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      // event validation settings
      const events: Promise<void>[] = []
      events.push(
        validateOnItemsChange(services, 'onProductsChange', [
          { newItem: newProduct1, oldItem: oldProduct1 },
        ])
      )
      events.push(
        validateOnItemsChange(services, 'onUserCartItemsChange', [
          { newItem: undefined, oldItem: oldCartItem1 },
        ])
      )

      // run the test target
      await services.shop.decrementCartItem(response.product.id)

      // store validation
      expect(stores.product.getById(expectedStoreProduct.id)).toEqual(expectedStoreProduct)
      expect(stores.cart.getById(expectedStoreCartItem.id)).toBeUndefined()

      // wait for the event validation to end
      await Promise.all(events)
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
        await services.shop.decrementCartItem(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`There is no signed-in user.`)

      // validate that there is no change in the store
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
      const { services, apis, stores } = provideDependency()
      // store settings
      stores.product.setAll(Products())
      stores.cart.setAll(cartItems)
      // mock settings
      const removeCartItems = td.replace<TestAPIContainer, 'removeCartItems'>(
        apis,
        'removeCartItems'
      )
      td.when(removeCartItems(td.matchers.anything())).thenReject(expected)
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      let actual!: Error
      try {
        // run the test target
        await services.shop.decrementCartItem(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)

      // validate that there is no change in the store
      expect(stores.product.all).toEqual(Products())
      expect(stores.cart.all).toEqual(cartItems)
    })
  })

  describe('checkout', () => {
    it('basic case', async () => {
      const newCartItem1: CartItem = CartItems()[0]
      const newCartItem2: CartItem = CartItems()[1]

      const { services, apis, stores } = provideDependency()
      // store settings
      stores.product.setAll(Products())
      stores.cart.setAll([newCartItem1, newCartItem2])
      // mock settings
      const checkoutCart = td.replace<TestAPIContainer, 'checkoutCart'>(apis, 'checkoutCart')
      td.when(checkoutCart()).thenResolve(true)
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      // event validation settings
      const event = validateOnItemsChange(services, 'onUserCartItemsChange', [
        { newItem: undefined, oldItem: newCartItem1 },
        { newItem: undefined, oldItem: newCartItem2 },
      ])

      // run the test target
      await services.shop.checkout()

      // store validation
      expect(stores.cart.getById(newCartItem1.id)).toBeUndefined()
      expect(stores.cart.getById(newCartItem2.id)).toBeUndefined()
      expect(stores.product.all).toEqual(Products())

      // validate that the API was called with the proper arguments
      const exp = td.explain(apis.checkoutCart)
      expect(exp.calls.length).toBe(1) // only be called once
      expect(exp.calls[0].args[0]).toBeUndefined() // the first call should be no argument

      // wait for the event validation to end
      await event
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

      expect(actual.message).toBe(`There is no signed-in user.`)

      // validate that there is no change in the store
      expect(stores.product.all).toEqual(Products())
      expect(stores.cart.all).toEqual(CartItems())
    })

    it('if an error occurs in the API', async () => {
      const expected = new Error()
      const { services, apis, stores } = provideDependency()
      // store settings
      stores.product.setAll(Products())
      stores.cart.setAll(CartItems())
      // mock settings
      const checkoutCart = td.replace<TestAPIContainer, 'checkoutCart'>(apis, 'checkoutCart')
      td.when(checkoutCart()).thenReject(expected)
      // sign-in user settings
      await services.account.signIn(TaroYamada.id)

      let actual!: Error
      try {
        // run the test target
        await services.shop.checkout()
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)

      // validate that there is no change in the store
      expect(stores.product.all).toEqual(Products())
      expect(stores.cart.all).toEqual(CartItems())
    })
  })
})
