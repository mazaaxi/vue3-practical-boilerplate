import { CartItem, Product } from '@/services/base'
import { CartItemAddInput, CartItemUpdateInput, useAPI } from '@/services/apis'
import { ComputedRef, computed, watch } from 'vue'
import { DeepReadonly, isImplemented } from 'js-common-lib'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { useHelper } from '@/services/helpers'
import { useStore } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface ShopService extends UnwrapNestedRefs<RawShopService> {}

interface RawShopService {
  readonly products: DeepReadonly<Product[]>
  readonly cartItems: DeepReadonly<CartItem[]>
  readonly cartTotalPrice: ComputedRef<number>
  fetchProducts(): Promise<Product[]>
  fetchCartItems(): Promise<CartItem[]>
  addItemToCart(productId: string): Promise<void>
  removeItemFromCart(productId: string): Promise<void>
  checkout(): Promise<void>
  getExchangeRate(locale: string): number
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace ShopService {
  export function newRawInstance() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const apis = useAPI()
    const helpers = useHelper()
    const stores = useStore()

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const fetchProducts: RawShopService['fetchProducts'] = async () => {
      const products = await apis.getProducts()
      stores.product.setAll(products)
      return Product.clone(stores.product.all)
    }

    const fetchCartItems: RawShopService['fetchCartItems'] = async () => {
      helpers.account.validateSignedIn()

      const cartItems = await apis.getCartItems(helpers.account.user.id)
      stores.cart.setAll(cartItems)
      return CartItem.clone(stores.cart.all)
    }

    const addItemToCart: RawShopService['addItemToCart'] = async productId => {
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

    const removeItemFromCart: RawShopService['removeItemFromCart'] = async productId => {
      helpers.account.validateSignedIn()

      const cartItem = stores.cart.sgetByProductId(productId)
      if (cartItem.quantity > 1) {
        await updateCartItem(productId, -1)
      } else {
        await removeCartItem(productId)
      }
    }

    const checkout: RawShopService['checkout'] = async () => {
      helpers.account.validateSignedIn()

      await apis.checkoutCart()

      // カートを空にする
      stores.cart.removeByUID(helpers.account.user.id)
    }

    const getExchangeRate: RawShopService['getExchangeRate'] = locale => {
      if (locale === 'en' || locale === 'en-US') {
        return 1
      } else if (locale === 'ja' || locale === 'ja-US') {
        return 105
      } else {
        return 1
      }
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    async function addCartItem(productId: string): Promise<void> {
      const product = stores.product.sgetById(productId)!
      const newCartItem: CartItemAddInput = {
        uid: helpers.account.user.id,
        productId,
        title: product.title,
        price: product.price,
        quantity: 1,
      }
      const apiResponse = (await apis.addCartItems([newCartItem]))[0]
      stores.product.set(apiResponse.product)
      stores.cart.add(apiResponse)
    }

    async function updateCartItem(productId: string, quantity: number): Promise<void> {
      const cartItem = stores.cart.sgetByProductId(productId)
      const updateCartItem: CartItemUpdateInput = {
        id: cartItem.id,
        uid: helpers.account.user.id,
        quantity: cartItem.quantity + quantity,
      }
      const apiResponse = (await apis.updateCartItems([updateCartItem]))[0]
      stores.product.set(apiResponse.product)
      stores.cart.set(apiResponse)
    }

    async function removeCartItem(productId: string): Promise<void> {
      const cartItem = stores.cart.sgetByProductId(productId)
      const apiResponse = (await apis.removeCartItems([cartItem.id]))[0]
      stores.product.set(apiResponse.product)
      stores.cart.remove(apiResponse.id)
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
      () => helpers.account.isSignedIn,
      async (newValue, oldValue) => {
        // sign-in is complete
        if (newValue) {
          await fetchProducts()
          await fetchCartItems()
        }
        // signed-out
        else {
          stores.cart.setAll([])
        }
      }
    )

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      products: stores.product.all,
      cartItems: stores.cart.all,
      cartTotalPrice: computed(() => stores.cart.totalPrice),
      fetchProducts,
      fetchCartItems,
      addItemToCart,
      removeItemFromCart,
      checkout,
      getExchangeRate,
    }

    return isImplemented<RawShopService, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { ShopService }
