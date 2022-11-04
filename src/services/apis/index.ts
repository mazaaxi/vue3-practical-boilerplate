import type {
  APICartItem,
  APICartItemEditResponse,
  APIProduct,
  CartItem,
  CartItemEditResponse,
  Product,
} from '@/services/entities'
import { isImplemented, keysToCamel, keysToSnake } from 'js-common-lib'
import { APIClient } from '@/services/apis/client'
import type { KeysToCamel } from 'js-common-lib'
import dayjs from 'dayjs'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface APIs {
  getProduct(id: string): Promise<Product | undefined>
  getProducts(ids?: string[]): Promise<Product[]>
  getCartItems(): Promise<CartItem[]>
  addCartItems(items: CartItemAddInput[]): Promise<CartItemEditResponse[]>
  updateCartItems(items: CartItemUpdateInput[]): Promise<CartItemEditResponse[]>
  removeCartItems(cartItemIds: string[]): Promise<CartItemEditResponse[]>
  checkoutCart(): Promise<boolean>
}

interface APICartItemAddInput {
  uid: string
  product_id: string
  title: string
  price: number
  quantity: number
}
type CartItemAddInput = KeysToCamel<APICartItemAddInput>

interface APICartItemUpdateInput {
  uid: string
  id: string
  quantity: number
}
type CartItemUpdateInput = KeysToCamel<APICartItemUpdateInput>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace APIs {
  let instance: APIs

  export function setupAPIs(apis?: APIs): APIs {
    instance = apis ?? newInstance()
    return instance
  }

  export function useAPIs(): APIs {
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

    const getProduct: APIs['getProduct'] = async id => {
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

    const getProducts: APIs['getProducts'] = async ids => {
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

    const getCartItems: APIs['getCartItems'] = async () => {
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

    const addCartItems: APIs['addCartItems'] = async items => {
      const response = await client.post<APICartItemEditResponse[]>(
        'cart_items',
        keysToSnake(items),
        {
          shouldAuth: true,
        }
      )
      return response.data.map(item => apiAPICartItemEditResponseToEntity(item))
    }

    const updateCartItems: APIs['updateCartItems'] = async items => {
      const response = await client.put<APICartItemEditResponse[]>(
        'cart_items',
        keysToSnake(items),
        {
          shouldAuth: true,
        }
      )
      return response.data.map(item => apiAPICartItemEditResponseToEntity(item))
    }

    const removeCartItems: APIs['removeCartItems'] = async cartItemIds => {
      const response = await client.delete<APICartItemEditResponse[]>('cart_items', {
        shouldAuth: true,
        params: { ids: cartItemIds },
      })
      return response.data.map(item => apiAPICartItemEditResponseToEntity(item))
    }

    const checkoutCart: APIs['checkoutCart'] = async () => {
      const response = await client.put<boolean>('cart_items/checkout', undefined, {
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
      getProduct,
      getProducts,
      getCartItems,
      addCartItems,
      updateCartItems,
      removeCartItems,
      checkoutCart,
      client,
    }

    return isImplemented<APIs, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupAPIs, useAPIs } = APIs
export { APIs, setupAPIs, useAPIs }
export type { CartItemAddInput, CartItemEditResponse, CartItemUpdateInput }
