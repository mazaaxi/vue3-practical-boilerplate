import { CartItem, Product } from '@/services/base'
import { CartItemAddInput, CartItemUpdateInput, useAPI } from '@/services/apis'
import { ComputedRef, computed, watch } from 'vue'
import { DeepUnreadonly, arrayToDict, isImplemented } from 'js-common-lib'
import { Unsubscribe, createNanoEvents } from 'nanoevents'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { useHelper } from '@/services/helpers'
import { useStore } from '@/services/stores'
const cloneDeep = require('rfdc')()

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface ShopLogic extends UnwrapNestedRefs<WrapShopLogic> {}

interface WrapShopLogic {
  readonly cartTotalPrice: ComputedRef<number>
  fetchProducts(): Promise<void>
  fetchUserCartItems(): Promise<void>
  getAllProducts(): Product[]
  getUserCartItems(uid: string): CartItem[]
  incrementCartItem(productId: string): Promise<void>
  decrementCartItem(productId: string): Promise<void>
  checkout(): Promise<void>
  getExchangeRate(locale: string): number
  onProductsChange(cb: (newProduct?: Product, oldProduct?: Product) => void): Unsubscribe
  onUserCartItemsChange(cb: (newCartItem?: CartItem, oldCartItem?: CartItem) => void): Unsubscribe
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace ShopLogic {
  export function newWrapInstance() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const apis = useAPI()
    const helpers = useHelper()
    const stores = useStore()

    const emitter = createNanoEvents<{
      productsChange: (newProduct?: Product, oldProduct?: Product) => void
      userCartItemsChange: (newCartItem?: CartItem, oldCartItem?: CartItem) => void
    }>()

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const cartTotalPrice = computed(() => {
      if (!helpers.account.isSignedIn) return 0

      const cartItems = stores.cart.getListByUID(helpers.account.user.id)
      return cartItems.reduce((result, item) => {
        return result + item.price * item.quantity
      }, 0)
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const fetchProducts: WrapShopLogic['fetchProducts'] = async () => {
      const responseProducts = await apis.getProducts()
      const responseProductDict = arrayToDict(responseProducts, 'id')

      responseProducts.forEach(responseProduct => {
        const exists = stores.product.getById(responseProduct.id)
        if (exists) {
          const updated = stores.product.set(responseProduct)
          emitter.emit('productsChange', updated, exists)
        } else {
          const added = stores.product.add(responseProduct)
          emitter.emit('productsChange', added, undefined)
        }
      })

      stores.product.all.forEach(product => {
        const exists = responseProductDict[product.id]
        if (!exists) {
          const removed = stores.product.remove(product.id)
          emitter.emit('productsChange', undefined, removed)
        }
      })
    }

    const fetchUserCartItems: WrapShopLogic['fetchUserCartItems'] = async () => {
      helpers.account.validateSignedIn()

      const responseCartItems = await apis.getCartItems()
      const responseCartItemDict = arrayToDict(responseCartItems, 'id')

      responseCartItems.forEach(responseCartItem => {
        const exists = stores.cart.getById(responseCartItem.id)
        if (exists) {
          const updated = stores.cart.set(responseCartItem)
          emitter.emit('userCartItemsChange', updated, exists)
        } else {
          const added = stores.cart.add(responseCartItem)
          emitter.emit('userCartItemsChange', added, undefined)
        }
      })

      stores.cart.all.forEach(cartItem => {
        const exists = responseCartItemDict[cartItem.id]
        if (!exists) {
          const removed = stores.cart.remove(cartItem.id)
          emitter.emit('userCartItemsChange', undefined, removed)
        }
      })
    }

    const getAllProducts: WrapShopLogic['getAllProducts'] = () => {
      return cloneDeep(stores.product.all) as DeepUnreadonly<Product[]>
    }

    const getUserCartItems: WrapShopLogic['getUserCartItems'] = () => {
      helpers.account.validateSignedIn()

      return stores.cart.getListByUID(helpers.account.user.id)
    }

    const incrementCartItem: WrapShopLogic['incrementCartItem'] = async productId => {
      helpers.account.validateSignedIn()

      const product = stores.product.sgetById(productId)
      if (product.stock <= 0) {
        throw new Error(`Out of stock.`)
      }

      const cartItem = stores.cart.getByProductId(productId)
      if (!cartItem) {
        await addCartItem(productId)
      } else {
        await updateCartItem(productId, 1)
      }
    }

    const decrementCartItem: WrapShopLogic['decrementCartItem'] = async productId => {
      helpers.account.validateSignedIn()

      const cartItem = stores.cart.sgetByProductId(productId)
      if (cartItem.quantity > 1) {
        await updateCartItem(productId, -1)
      } else {
        await removeCartItem(productId)
      }
    }

    const checkout: WrapShopLogic['checkout'] = async () => {
      helpers.account.validateSignedIn()

      await apis.checkoutCart()

      // empty the cart
      const removedCartItems = stores.cart.removeByUID(helpers.account.user.id)
      removedCartItems.forEach(removedCartItem => {
        emitter.emit('userCartItemsChange', undefined, removedCartItem)
      })
    }

    const getExchangeRate: WrapShopLogic['getExchangeRate'] = locale => {
      if (locale === 'en' || locale === 'en-US') {
        return 1
      } else if (locale === 'ja' || locale === 'ja-JP') {
        return 105
      } else {
        return 1
      }
    }

    const onProductsChange: WrapShopLogic['onProductsChange'] = cb => {
      return emitter.on('productsChange', cb)
    }

    const onUserCartItemsChange: WrapShopLogic['onUserCartItemsChange'] = cb => {
      return emitter.on('userCartItemsChange', cb)
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    async function addCartItem(productId: string): Promise<CartItem> {
      const product = stores.product.sgetById(productId)!
      const input: CartItemAddInput = {
        uid: helpers.account.user.id,
        productId,
        title: product.title,
        price: product.price,
        quantity: 1,
      }
      const apiResponse = (await apis.addCartItems([input]))[0]

      const oldProduct = stores.product.getById(apiResponse.product.id)
      const newProduct = stores.product.set(apiResponse.product)
      emitter.emit('productsChange', newProduct, oldProduct)

      const newCartItem = stores.cart.add(apiResponse)
      emitter.emit('userCartItemsChange', newCartItem, undefined)

      return newCartItem
    }

    async function updateCartItem(productId: string, quantity: number): Promise<CartItem> {
      const cartItem = stores.cart.sgetByProductId(productId)
      const input: CartItemUpdateInput = {
        id: cartItem.id,
        uid: helpers.account.user.id,
        quantity: cartItem.quantity + quantity,
      }
      const apiResponse = (await apis.updateCartItems([input]))[0]

      const oldProduct = stores.product.getById(apiResponse.product.id)
      const newProduct = stores.product.set(apiResponse.product)
      emitter.emit('productsChange', newProduct, oldProduct)

      const oldCartItem = stores.cart.getById(apiResponse.id)
      const newCartItem = stores.cart.set(apiResponse)!
      emitter.emit('userCartItemsChange', newCartItem, oldCartItem)

      return newCartItem
    }

    async function removeCartItem(productId: string): Promise<CartItem> {
      const cartItem = stores.cart.sgetByProductId(productId)
      const apiResponse = (await apis.removeCartItems([cartItem.id]))[0]

      const oldProduct = stores.product.getById(apiResponse.product.id)
      const newProduct = stores.product.set(apiResponse.product)
      emitter.emit('productsChange', newProduct, oldProduct)

      const oldCartItem = stores.cart.remove(apiResponse.id)!
      emitter.emit('userCartItemsChange', undefined, oldCartItem)

      return oldCartItem
    }

    function getRandomInt(max: number) {
      return Math.floor(Math.random() * Math.floor(max))
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    watch(
      () => helpers.account.user.id,
      async (newValue, oldValue) => {
        // sign-in is complete
        if (newValue) {
          await fetchProducts()
          await fetchUserCartItems()
        }
        // signed-out
        else {
          const removedCartItems = stores.cart.removeByUID(oldValue)
          removedCartItems.forEach(removedCartItem => {
            emitter.emit('userCartItemsChange', undefined, removedCartItem)
          })
        }
      }
    )

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      cartTotalPrice,
      fetchProducts,
      fetchUserCartItems,
      getAllProducts,
      getUserCartItems,
      incrementCartItem,
      decrementCartItem,
      checkout,
      getExchangeRate,
      onProductsChange,
      onUserCartItemsChange,
    }

    return isImplemented<WrapShopLogic, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { ShopLogic }
