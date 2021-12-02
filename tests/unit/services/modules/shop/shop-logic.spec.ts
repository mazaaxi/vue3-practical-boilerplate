import { CartItem, Product, User, generateId } from '@/services'
import { TestAPIContainer, TestHelperContainer, provideDependency } from '../../../../helpers'
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
        get isSignedIn() {
          return Boolean(signInUser.id)
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

  it('totalPrice', async () => {
    const { services, helpers } = provideDependency(({ stores, helpers }) => {
      // store settings
      stores.cart.setAll(CartItems())
      // sign-in user settings
      helpers.account.signIn(TaroYamada)
    })

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
      const expectedEventProducts = {
        [newProduct1.id]: { newProduct: newProduct1, oldProduct: undefined },
        [newProduct2.id]: { newProduct: newProduct2, oldProduct: undefined },
        [newProduct3.id]: { newProduct: newProduct3, oldProduct: undefined },
        [newProduct4.id]: { newProduct: newProduct4, oldProduct: undefined },
      }

      const { services, stores } = provideDependency(({ apis }) => {
        // mock settings
        const getProducts = td.replace<TestAPIContainer, 'getProducts'>(apis, 'getProducts')
        td.when(getProducts()).thenResolve(expectedStoreProducts)
      })

      // event validation
      services.shop.onProductsChange((newProduct, oldProduct) => {
        const id = (newProduct?.id || oldProduct?.id) as string
        expect(expectedEventProducts[id]).toEqual({ newProduct, oldProduct })
      })

      // run the test target
      await services.shop.fetchProducts()

      // store validation
      const actual = [...stores.product.all].sort(sortIdFunc)
      expect(actual).toEqual(Products().sort(sortIdFunc))
    })

    it('if part of products has already been loaded', async () => {
      const oldProduct2 = Products()[1]
      const newProduct1: Product = Products()[0]
      const newProduct2: Product = { ...oldProduct2, title: 'FIRE HD 8 TABLET' }
      const newProduct3: Product = Products()[2]
      const newProduct4: Product = Products()[3]
      const expectedStoreProducts = [newProduct1, newProduct2, newProduct3, newProduct4]
      const expectedEventProducts = {
        [newProduct1.id]: { newProduct: newProduct1, oldProduct: undefined },
        [newProduct2.id]: { newProduct: newProduct2, oldProduct: oldProduct2 },
        [newProduct3.id]: { newProduct: newProduct3, oldProduct: undefined },
        [newProduct4.id]: { newProduct: newProduct4, oldProduct: undefined },
      }

      const { services, stores } = provideDependency(({ apis, stores }) => {
        // store settings
        stores.product.add(oldProduct2)
        // mock settings
        const getProducts = td.replace<TestAPIContainer, 'getProducts'>(apis, 'getProducts')
        td.when(getProducts()).thenResolve(expectedStoreProducts)
      })

      // event validation
      services.shop.onProductsChange((newProduct, oldProduct) => {
        const productId = (newProduct?.id || oldProduct?.id) as string
        expect(expectedEventProducts[productId]).toEqual({ newProduct, oldProduct })
      })

      // run the test target
      await services.shop.fetchProducts()

      // store validation
      const actual = [...stores.product.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreProducts.sort(sortIdFunc))
    })

    it('if a non-existent product has been loaded', async () => {
      const oldProduct2 = Products()[1] // the product that exist locally, but not on the server
      const newProduct1: Product = Products()[0]
      const newProduct3: Product = Products()[2]
      const newProduct4: Product = Products()[3]
      const expectedStoreProducts = [newProduct1, newProduct3, newProduct4]
      const expectedEventProducts = {
        [newProduct1.id]: { newProduct: newProduct1, oldProduct: undefined },
        [oldProduct2.id]: { newProduct: undefined, oldProduct: oldProduct2 },
        [newProduct3.id]: { newProduct: newProduct3, oldProduct: undefined },
        [newProduct4.id]: { newProduct: newProduct4, oldProduct: undefined },
      }

      const { services, stores } = provideDependency(({ apis, stores }) => {
        // store settings
        stores.product.add(oldProduct2)
        // mock settings
        const getProducts = td.replace<TestAPIContainer, 'getProducts'>(apis, 'getProducts')
        td.when(getProducts()).thenResolve(expectedStoreProducts)
      })

      // event validation
      services.shop.onProductsChange((newProduct, oldProduct) => {
        const productId = (newProduct?.id || oldProduct?.id) as string
        expect(expectedEventProducts[productId]).toEqual({ newProduct, oldProduct })
      })

      // run the test target
      await services.shop.fetchProducts()

      // store validation
      const actual = [...stores.product.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreProducts.sort(sortIdFunc))
    })
  })

  describe('fetchCartItems', () => {
    it('if cart items has not yet been loaded', async () => {
      const newCartItem1: CartItem = CartItems()[0]
      const newCartItem2: CartItem = CartItems()[1]
      const expectedStoreCartItems = [newCartItem1, newCartItem2]
      const expectedEventCartItems = {
        [newCartItem1.id]: { newCartItem: newCartItem1, oldCartItem: undefined },
        [newCartItem2.id]: { newCartItem: newCartItem2, oldCartItem: undefined },
      }

      const { services, stores, helpers } = provideDependency(({ apis, helpers }) => {
        // mock settings
        const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
        td.when(getCartItems()).thenResolve(expectedStoreCartItems)
        // sign-in user settings
        helpers.account.signIn(TaroYamada)
      })

      // event validation
      services.shop.onUserCartItemsChange((newCartItem, oldCartItem) => {
        const id = (newCartItem?.id || oldCartItem?.id) as string
        expect(expectedEventCartItems[id]).toEqual({ newCartItem, oldCartItem })
      })

      // run the test target
      await services.shop.fetchUserCartItems()

      // store validation
      const actual = [...stores.cart.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreCartItems.sort(sortIdFunc))
    })

    it('if part of cart items has already been loaded', async () => {
      const oldCartItem2: CartItem = CartItems()[1]
      const newCartItem1: CartItem = CartItems()[0]
      const newCartItem2: CartItem = { ...oldCartItem2, price: 90, title: 'FIRE HD 8 TABLET' }
      const expectedStoreCartItems = [newCartItem1, newCartItem2]
      const expectedEventCartItems = {
        [newCartItem1.id]: { newCartItem: newCartItem1, oldCartItem: undefined },
        [newCartItem2.id]: { newCartItem: newCartItem2, oldCartItem: oldCartItem2 },
      }

      const { services, stores } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.cart.add(oldCartItem2)
        // mock settings
        const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
        td.when(getCartItems()).thenResolve(expectedStoreCartItems)
        // sign-in user settings
        helpers.account.signIn(TaroYamada)
      })

      // event validation
      services.shop.onUserCartItemsChange((newCartItem, oldCartItem) => {
        const id = (newCartItem?.id || oldCartItem?.id) as string
        expect(expectedEventCartItems[id]).toEqual({ newCartItem, oldCartItem })
      })

      // run the test target
      await services.shop.fetchUserCartItems()

      // store validation
      const actual = [...stores.cart.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreCartItems.sort(sortIdFunc))
    })

    it('if a non-existent cart item has been loaded', async () => {
      const oldCartItem2: CartItem = CartItems()[1] // the cart item that exist locally, but not on the server
      const newCartItem1: CartItem = CartItems()[0]
      const expectedStoreCartItems = [newCartItem1]
      const expectedEventCartItems = {
        [newCartItem1.id]: { newCartItem: newCartItem1, oldCartItem: undefined },
        [oldCartItem2.id]: { newCartItem: undefined, oldCartItem: oldCartItem2 },
      }

      const { services, stores } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.cart.add(oldCartItem2)
        // mock settings
        const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
        td.when(getCartItems()).thenResolve(expectedStoreCartItems)
        // sign-in user settings
        helpers.account.signIn(TaroYamada)
      })

      // event validation
      services.shop.onUserCartItemsChange((newCartItem, oldCartItem) => {
        const id = (newCartItem?.id || oldCartItem?.id) as string
        expect(expectedEventCartItems[id]).toEqual({ newCartItem, oldCartItem })
      })

      // run the test target
      await services.shop.fetchUserCartItems()

      // store validation
      const actual = [...stores.cart.all].sort(sortIdFunc)
      expect(actual).toEqual(expectedStoreCartItems.sort(sortIdFunc))
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

      expect(actual.message).toBe(`Not signed-in.`)

      // validate that there is no change in the store
      expect(stores.cart.all.length).toBe(0)
    })

    it('if an error occurs in the API', async () => {
      const expected = new Error()
      const { stores, services } = provideDependency(({ apis, helpers }) => {
        // mock settings
        const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
        td.when(getCartItems()).thenReject(expected)
        // sign-in user settings
        helpers.account.signIn(TaroYamada)
      })

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
      const newProduct3: Product = { ...oldProduct3, stock: oldProduct3.stock - quantity, updatedAt: dayjs() }
      const expectedStoreProduct = newProduct3
      const expectedEventProduct = { newProduct: newProduct3, oldProduct: oldProduct3 }

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
      const expectedEventCartItem = { newCartItem: newCartItem3, oldCartItem: undefined }

      const response: CartItemEditResponse = {
        ...newCartItem3,
        product: {
          ...newProduct3,
        },
      }

      const { services, stores } = provideDependency(({ apis, stores, helpers }) => {
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
        helpers.account.signIn(TaroYamada)
      })

      // event validation
      services.shop.onProductsChange((newProduct, oldProduct) => {
        expect(expectedEventProduct).toEqual({ newProduct, oldProduct })
      })
      services.shop.onUserCartItemsChange((newCartItem, oldCartItem) => {
        expect(expectedEventCartItem).toEqual({ newCartItem, oldCartItem })
      })

      // run the test target
      await services.shop.incrementCartItem(response.product.id)

      // store validation
      expect(stores.product.getById(expectedStoreProduct.id)).toEqual(expectedStoreProduct)
      expect(stores.cart.getById(expectedStoreCartItem.id)).toEqual(expectedStoreCartItem)
    })

    it('basic case - update', async () => {
      const quantity = 1

      const oldProduct1 = Products()[0]
      const newProduct1: Product = { ...oldProduct1, stock: oldProduct1.stock - quantity, updatedAt: dayjs() }
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

      const { services, stores } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.add(oldCartItem1)
        // mock settings
        const updateCartItems = td.replace<TestAPIContainer, 'updateCartItems'>(apis, 'updateCartItems')
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
        helpers.account.signIn(TaroYamada)
      })

      // event validation
      services.shop.onProductsChange((newProduct, oldProduct) => {
        expect(expectedEventProduct).toEqual({ newProduct, oldProduct })
      })
      services.shop.onUserCartItemsChange((newCartItem, oldCartItem) => {
        expect(expectedEventCartItem).toEqual({ newCartItem, oldCartItem })
      })

      // run the test target
      await services.shop.incrementCartItem(response.product.id)

      // store validation
      expect(stores.product.getById(expectedStoreProduct.id)).toEqual(expectedStoreProduct)
      expect(stores.cart.getById(expectedStoreCartItem.id)).toEqual(expectedStoreCartItem)
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
        helpers.account.signIn(TaroYamada)
      })

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

      expect(actual.message).toBe(`Not signed-in.`)

      // validate that there is no change in the store
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
        helpers.account.signIn(TaroYamada)
      })

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
      const newProduct1: Product = { ...oldProduct1, stock: oldProduct1.stock + quantity, updatedAt: dayjs() }
      const expectedStoreProduct = newProduct1
      const expectedEventProduct = { newProduct: newProduct1, oldProduct: oldProduct1 }

      const oldCartItem1 = CartItems()[0]
      const newCartItem1: CartItem = {
        ...oldCartItem1,
        quantity: oldCartItem1.quantity - quantity,
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

      const { services, stores } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.add(oldCartItem1)
        // mock settings
        const updateCartItems = td.replace<TestAPIContainer, 'updateCartItems'>(apis, 'updateCartItems')
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
        helpers.account.signIn(TaroYamada)
      })

      // event validation
      services.shop.onProductsChange((newProduct, oldProduct) => {
        expect(expectedEventProduct).toEqual({ newProduct, oldProduct })
      })
      services.shop.onUserCartItemsChange((newCartItem, oldCartItem) => {
        expect(expectedEventCartItem).toEqual({ newCartItem, oldCartItem })
      })

      // run the test target
      await services.shop.decrementCartItem(response.product.id)

      // store validation
      expect(stores.product.getById(expectedStoreProduct.id)).toEqual(expectedStoreProduct)
      expect(stores.cart.getById(expectedStoreCartItem.id)).toEqual(expectedStoreCartItem)
    })

    it('basic case - remove', async () => {
      const quantity = 1

      const oldProduct1 = Products()[0]
      const newProduct1: Product = { ...oldProduct1, stock: oldProduct1.stock + quantity, updatedAt: dayjs() }
      const expectedStoreProduct = newProduct1
      const expectedEventProduct = { newProduct: newProduct1, oldProduct: oldProduct1 }

      const oldCartItem1: CartItem = { ...CartItems()[0], quantity }
      const expectedStoreCartItem = oldCartItem1
      const expectedEventCartItem = { newCartItem: undefined, oldCartItem: oldCartItem1 }

      const response: CartItemEditResponse = {
        ...oldCartItem1,
        quantity: oldCartItem1.quantity - 1,
        product: {
          ...newProduct1,
        },
      }

      const { services, stores } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.add(oldCartItem1)
        // mock settings
        const removeCartItems = td.replace<TestAPIContainer, 'removeCartItems'>(apis, 'removeCartItems')
        td.when(removeCartItems([oldCartItem1.id])).thenResolve([response])
        // sign-in user settings
        helpers.account.signIn(TaroYamada)
      })

      // event validation
      services.shop.onProductsChange((newProduct, oldProduct) => {
        expect(expectedEventProduct).toEqual({ newProduct, oldProduct })
      })
      services.shop.onUserCartItemsChange((newCartItem, oldCartItem) => {
        expect(expectedEventCartItem).toEqual({ newCartItem, oldCartItem })
      })

      // run the test target
      await services.shop.decrementCartItem(response.product.id)

      // store validation
      expect(stores.product.getById(expectedStoreProduct.id)).toEqual(expectedStoreProduct)
      expect(stores.cart.getById(expectedStoreCartItem.id)).toBeUndefined()
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

      expect(actual.message).toBe(`Not signed-in.`)

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
      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.setAll(cartItems)
        // mock settings
        const removeCartItems = td.replace<TestAPIContainer, 'removeCartItems'>(apis, 'removeCartItems')
        td.when(removeCartItems(td.matchers.anything())).thenReject(expected)
        // sign-in user settings
        helpers.account.signIn(TaroYamada)
      })

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
      const expectedEventCartItems = {
        [newCartItem1.id]: { newCartItem: undefined, oldCartItem: newCartItem1 },
        [newCartItem2.id]: { newCartItem: undefined, oldCartItem: newCartItem2 },
      }

      const { apis, services, stores } = provideDependency(({ apis, stores, helpers }) => {
        // store settings
        stores.product.setAll(Products())
        stores.cart.setAll([newCartItem1, newCartItem2])
        // mock settings
        const checkoutCart = td.replace<TestAPIContainer, 'checkoutCart'>(apis, 'checkoutCart')
        td.when(checkoutCart()).thenResolve(true)
        // sign-in user settings
        helpers.account.signIn(TaroYamada)
      })

      // event validation
      services.shop.onUserCartItemsChange((newCartItem, oldCartItem) => {
        const id = (newCartItem?.id || oldCartItem?.id) as string
        expect(expectedEventCartItems[id]).toEqual({ newCartItem, oldCartItem })
      })

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

      // validate that there is no change in the store
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
        helpers.account.signIn(TaroYamada)
      })

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
