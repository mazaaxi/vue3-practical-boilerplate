import type {
  APICartItem,
  APICartItemEditResponse,
  APIProduct,
  CartItem,
  CartItemAddInput,
  CartItemEditResponse,
  CartItemUpdateInput,
  Product,
} from '@/services/entities'
import { isImplemented, keysToCamel, keysToSnake } from 'js-common-lib'
import { APIClient } from '@/services/apis/client'
import dayjs from 'dayjs'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface AppAPIs {
  getProduct(id: string): Promise<Product | undefined>
  getProducts(ids?: string[]): Promise<Product[]>
  getCartItems(): Promise<CartItem[]>
  addCartItems(items: CartItemAddInput[]): Promise<CartItemEditResponse[]>
  updateCartItems(items: CartItemUpdateInput[]): Promise<CartItemEditResponse[]>
  removeCartItems(cartItemIds: string[]): Promise<CartItemEditResponse[]>
  checkoutCart(): Promise<boolean>
}

type RawAppAPIs = ReturnType<typeof AppAPIs['newInstance']>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AppAPIs {
  let instance: RawAppAPIs

  export function setup<T extends RawAppAPIs>(apis?: T): T {
    instance = apis ?? newInstance()
    return instance as T
  }

  export function use(): AppAPIs {
    return instance
  }

  export function newInstance() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const client = APIClient.newInstance()

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const getProduct: AppAPIs['getProduct'] = async id => {
      const response = await client.get<APIProduct[]>('products', {
        params: { ids: [id] },
      })
      if (response.data.length === 0) return

      const product = response.data[0]
      return keysToCamel<typeof product, Product>(product, {
        convertor: (key, value) => {
          if (key === 'created_at') return dayjs(value)
          if (key === 'updated_at') return dayjs(value)
          return value
        },
      })
    }

    const getProducts: AppAPIs['getProducts'] = async ids => {
      const response = await client.get<APIProduct[]>('products', {
        params: { ids },
      })

      return keysToCamel<typeof response.data, Product[]>(response.data, {
        convertor: (key, value) => {
          if (key === 'created_at') return dayjs(value)
          if (key === 'updated_at') return dayjs(value)
          return value
        },
      })
    }

    const getCartItems: AppAPIs['getCartItems'] = async () => {
      const response = await client.get<APICartItem[]>('cart_items', {
        shouldAuth: true,
      })

      return keysToCamel<typeof response.data, CartItem[]>(response.data, {
        convertor: (key, value) => {
          if (key === 'created_at') return dayjs(value)
          if (key === 'updated_at') return dayjs(value)
          return value
        },
      })
    }

    const addCartItems: AppAPIs['addCartItems'] = async items => {
      const response = await client.post<APICartItemEditResponse[]>('cart_items', {
        shouldAuth: true,
        data: keysToSnake(items),
      })
      return response.data.map(item => apiAPICartItemEditResponseToEntity(item))
    }

    const updateCartItems: AppAPIs['updateCartItems'] = async items => {
      const response = await client.put<APICartItemEditResponse[]>('cart_items', {
        shouldAuth: true,
        data: keysToSnake(items),
      })
      return response.data.map(item => apiAPICartItemEditResponseToEntity(item))
    }

    const removeCartItems: AppAPIs['removeCartItems'] = async cartItemIds => {
      const response = await client.delete<APICartItemEditResponse[]>('cart_items', {
        shouldAuth: true,
        params: { ids: cartItemIds },
      })
      return response.data.map(item => apiAPICartItemEditResponseToEntity(item))
    }

    const checkoutCart: AppAPIs['checkoutCart'] = async () => {
      const response = await client.put<boolean>('cart_items/checkout', {
        shouldAuth: true,
      })
      return response.data
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function apiAPICartItemEditResponseToEntity(
      item: APICartItemEditResponse
    ): CartItemEditResponse {
      return keysToCamel<APICartItemEditResponse, CartItemEditResponse>(item, {
        convertor: (key, value) => {
          if (key === 'product') {
            type APIProduct = APICartItemEditResponse['product']
            return keysToCamel<APIProduct>(value, {
              convertor: (key, value) => {
                if (key === 'created_at') return dayjs(value)
                if (key === 'updated_at') return dayjs(value)
                return value
              },
            })
          }
          if (key === 'created_at') return dayjs(value)
          if (key === 'updated_at') return dayjs(value)
          return value
        },
      })
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      client,
      getProduct,
      getProducts,
      getCartItems,
      addCartItems,
      updateCartItems,
      removeCartItems,
      checkoutCart,
    }

    return isImplemented<AppAPIs, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AppAPIs }
export type { RawAppAPIs }
