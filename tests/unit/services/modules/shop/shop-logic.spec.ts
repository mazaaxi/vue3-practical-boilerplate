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
          if (!signInUser.id) throw new Error(`Not signed in.`)
        },
      })
    })
  })

  it('fetchProducts', async () => {
    const { stores, services } = provideDependency(({ apis }) => {
      // モック設定
      const getProducts = td.replace<TestAPIContainer, 'getProducts'>(apis, 'getProducts')
      td.when(getProducts()).thenResolve(Products())
    })

    // テスト対象実行
    const actual = await services.shop.fetchProducts()

    expect(actual).toEqual(Products())
    expect(stores.product.all).toEqual(Products())
    toBeCopyProduct(stores, actual)
  })

  describe('fetchCartItems', () => {
    it('ベーシックケース', async () => {
      const { stores, helpers, services } = provideDependency(({ apis, helpers }) => {
        // モック設定
        const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
        td.when(getCartItems()).thenResolve(CartItems())
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      // テスト対象実行
      const actual = await services.shop.fetchCartItems()

      expect(actual).toEqual(CartItems())
      expect(stores.cart.all).toEqual(CartItems())
      toBeCopyCartItem(stores, actual)
    })

    it('サインインしていない場合', async () => {
      const { stores, services } = provideDependency()

      let actual!: Error
      try {
        // テスト対象実行
        await services.shop.fetchCartItems()
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`Not signed in.`)

      // ストアに変化がないことを検証
      expect(stores.cart.all.length).toBe(0)
    })

    it('APIでエラーが発生した場合', async () => {
      const expected = new Error()
      const { stores, services } = provideDependency(({ apis, helpers }) => {
        // モック設定
        const getCartItems = td.replace<TestAPIContainer, 'getCartItems'>(apis, 'getCartItems')
        td.when(getCartItems()).thenReject(expected)
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // テスト対象実行
        await services.shop.fetchCartItems()
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)
      // ストアに変化がないことを検証
      expect(stores.cart.all.length).toBe(0)
    })
  })

  describe('addItemToCart', () => {
    it('ベーシックケース - 追加', async () => {
      // 現在の商品の在庫数を設定
      const products = Products()
      const product3 = products[2]
      product3.stock = 10
      // API実行後のレスポンスオブジェクト
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
        // ストア設定
        stores.product.setAll(products)
        // モック設定
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
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      // テスト対象実行
      await services.shop.addItemToCart(response.product.id)

      // カートにアイテムが追加されたか検証
      const cartItem = stores.cart.sgetById(response.id)
      expect(cartItem.quantity).toBe(response.quantity)
      // 商品の在庫数が適切にマイナスされたか検証
      const product = stores.product.sgetById(response.productId)
      expect(product.stock).toBe(response.product.stock)
    })

    it('ベーシックケース - 更新', async () => {
      // 現在の商品の在庫数を設定
      const products = Products()
      const product1 = products[0]
      product1.stock = 10
      // API実行後のレスポンスオブジェクト
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
        // ストア設定
        stores.product.setAll(products)
        stores.cart.setAll(CartItems())
        // モック設定
        const updateCartItems = td.replace<TestAPIContainer, 'updateCartItems'>(apis, 'updateCartItems')
        td.when(updateCartItems([{ id: response.id, uid: SignInUser.id, quantity: response.quantity }])).thenResolve([response])
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      // テスト対象実行
      await services.shop.addItemToCart(response.product.id)

      // カートアイテムの個数が適切にプラスされたか検証
      const cartItem = stores.cart.sgetById(response.id)
      expect(cartItem.quantity).toBe(response.quantity)
      // 商品の在庫数が適切にマイナスされたか検証
      const product = stores.product.sgetById(response.productId)
      expect(product.stock).toBe(response.product.stock)
    })

    it('在庫が足りなかった場合', async () => {
      const products = Products()
      const product1 = products[0]
      // 現在の商品の在庫数を設定
      product1.stock = 0

      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // ストア設定
        stores.product.setAll(products)
        // モック設定
        const addCartItems = td.replace<TestAPIContainer, 'addCartItems'>(apis, 'addCartItems')
        td.when(addCartItems(td.matchers.anything())).thenReject(new Error())
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // テスト対象実行
        await services.shop.addItemToCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBeInstanceOf(Error)

      // ストアに変化がないことを検証
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all.length).toBe(0)
    })

    it('サインインしていない場合', async () => {
      const products = Products()
      const product1 = products[0]

      const { stores, services } = provideDependency(({ stores }) => {
        // ストア設定
        stores.product.setAll(products)
      })

      let actual!: Error
      try {
        // テスト対象実行
        await services.shop.addItemToCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`Not signed in.`)

      // ストアに変化がないことを検証
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all.length).toBe(0)
    })

    it('APIでエラーが発生した場合', async () => {
      const products = Products()
      const product1 = products[0]

      const expected = new Error()
      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // ストア設定
        stores.product.setAll(products)
        // モック設定
        const addCartItems = td.replace<TestAPIContainer, 'addCartItems'>(apis, 'addCartItems')
        td.when(addCartItems(td.matchers.anything())).thenReject(expected)
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // テスト対象実行
        await services.shop.addItemToCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)

      // ストアに変化がないことを検証
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all.length).toBe(0)
    })
  })

  describe('removeItemFromCart', () => {
    it('ベーシックケース - 更新', async () => {
      // 現在の商品の在庫数を設定
      const products = Products()
      const product1 = products[0]
      product1.stock = 10
      // 現在のカートの数量を設定
      const cartItems = CartItems()
      const cartItem1 = cartItems[0]
      cartItem1.quantity = 2
      // API実行後のレスポンスオブジェクト
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
        // ストア設定
        stores.product.setAll(products)
        stores.cart.setAll(cartItems)
        // モック設定
        const updateCartItems = td.replace<TestAPIContainer, 'updateCartItems'>(apis, 'updateCartItems')
        td.when(updateCartItems([{ id: response.id, uid: SignInUser.id, quantity: response.quantity }])).thenResolve([response])
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      // テスト対象実行
      await services.shop.removeItemFromCart(response.product.id)

      // カートアイテムの個数が適切にマイナスされたか検証
      const cartItem = stores.cart.sgetById(response.id)
      expect(cartItem.quantity).toBe(response.quantity)
      // 商品の在庫数が適切にプラスされたか検証
      const product = stores.product.sgetById(response.productId)
      expect(product.stock).toBe(response.product.stock)
    })

    it('ベーシックケース - 削除', async () => {
      // 現在の商品の在庫数を設定
      const products = Products()
      const product1 = products[0]
      product1.stock = 10
      // 現在のカートの数量を設定
      const cartItems = CartItems()
      const cartItem1 = cartItems[0]
      cartItem1.quantity = 1
      // API実行後のレスポンスオブジェクト
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
        // ストア設定
        stores.product.setAll(products)
        stores.cart.setAll(cartItems)
        // モック設定
        const removeCartItems = td.replace<TestAPIContainer, 'removeCartItems'>(apis, 'removeCartItems')
        td.when(removeCartItems([response.id])).thenResolve([response])
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      // テスト対象実行
      await services.shop.removeItemFromCart(response.product.id)

      // カートアイテムが削除されたか検証
      const cartItem = stores.cart.getById(response.id)
      expect(cartItem).toBeUndefined()
      // 商品の在庫数が適切にプラスされたか検証
      const product = stores.product.sgetById(response.productId)
      expect(product.stock).toBe(response.product.stock)
    })

    it('サインインしていない場合', async () => {
      const products = Products()
      const product1 = products[0]
      const cartItems = CartItems()

      const { stores, services } = provideDependency(({ stores }) => {
        // ストア設定
        stores.product.setAll(Products())
        stores.cart.setAll(cartItems)
      })

      let actual!: Error
      try {
        // テスト対象実行
        await services.shop.removeItemFromCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`Not signed in.`)

      // ストアに変化がないことを検証
      expect(stores.product.all).toEqual(products)
      expect(stores.cart.all).toEqual(cartItems)
    })

    it('APIでエラーが発生した場合', async () => {
      const products = Products()
      const product1 = products[0]
      // 現在のカートの数量を設定
      const cartItems = CartItems()
      const cartItem1 = cartItems[0]
      cartItem1.quantity = 1

      const expected = new Error()
      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // ストア設定
        stores.product.setAll(Products())
        stores.cart.setAll(cartItems)
        // モック設定
        const removeCartItems = td.replace<TestAPIContainer, 'removeCartItems'>(apis, 'removeCartItems')
        td.when(removeCartItems(td.matchers.anything())).thenReject(expected)
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // テスト対象実行
        await services.shop.removeItemFromCart(product1.id)
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)

      // ストアに変化がないことを検証
      expect(stores.product.all).toEqual(Products())
      expect(stores.cart.all).toEqual(cartItems)
    })
  })

  describe('checkout', () => {
    it('ベーシックケース', async () => {
      const { apis, services } = provideDependency(({ apis, stores, helpers }) => {
        // ストア設定
        stores.product.setAll(Products())
        stores.cart.setAll(CartItems())
        // モック設定
        const checkoutCart = td.replace<TestAPIContainer, 'checkoutCart'>(apis, 'checkoutCart')
        td.when(checkoutCart()).thenResolve(true)
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      // テスト対象の実行
      await services.shop.checkout()

      expect(services.shop.cartItems.length).toBe(0)
      expect(services.shop.products).toEqual(Products())

      // APIが適切な引数でコールされたか検証
      const exp = td.explain(apis.checkoutCart)
      expect(exp.calls.length).toBe(1) // 1回呼び出されるはず
      expect(exp.calls[0].args[0]).toBeUndefined() // 1回目の呼び出しが引数なしなはず
    })

    it('サインインしていない場合', async () => {
      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // ストア設定
        stores.product.setAll(Products())
        stores.cart.setAll(CartItems())
      })

      let actual!: Error
      try {
        // テスト対象実行
        await services.shop.checkout()
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`Not signed in.`)

      // ストアに変化がないことを検証
      expect(stores.product.all).toEqual(Products())
      expect(stores.cart.all).toEqual(CartItems())
    })

    it('APIでエラーが発生した場合', async () => {
      const expected = new Error()
      const { stores, services } = provideDependency(({ apis, stores, helpers }) => {
        // ストア設定
        stores.product.setAll(Products())
        stores.cart.setAll(CartItems())
        // モック設定
        const checkoutCart = td.replace<TestAPIContainer, 'checkoutCart'>(apis, 'checkoutCart')
        td.when(checkoutCart()).thenReject(expected)
        // サインインユーザー設定
        helpers.account.signIn(SignInUser)
      })

      let actual!: Error
      try {
        // テスト対象実行
        await services.shop.checkout()
      } catch (err: any) {
        actual = err
      }

      expect(actual).toBe(expected)

      // ストアに変化がないことを検証
      expect(stores.product.all).toEqual(Products())
      expect(stores.cart.all).toEqual(CartItems())
    })
  })
})
