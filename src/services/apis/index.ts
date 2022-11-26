import type { CartItem, Product } from '@/services/entities'
import { type ToEntity, toEntities, toEntity } from '@/services/base'
import { isImplemented, keysToSnake } from 'js-common-lib'
import { APIClient } from '@/services/apis/client'

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

//--------------------------------------------------
//  API types
//--------------------------------------------------

interface APIUser {
  id: string
  email: string
  first: string
  last: string
  created_at: string
  updated_at: string
}

interface APIProduct {
  id: string
  title: string
  price: number
  stock: number
  created_at: string
  updated_at: string
}

interface APICartItem {
  id: string
  uid: string
  product_id: string
  title: string
  price: number
  quantity: number
  created_at: string
  updated_at: string
}

interface APICartItemEditResponse {
  id: string
  uid: string
  product_id: string
  title: string
  price: number
  quantity: number
  created_at: string
  updated_at: string
  product: {
    id: string
    stock: number
    created_at: string
    updated_at: string
  }
}

interface APICartItemAddInput {
  uid: string
  product_id: string
  title: string
  price: number
  quantity: number
}

interface APICartItemUpdateInput {
  uid: string
  id: string
  quantity: number
}

//--------------------------------------------------
//  App types
//--------------------------------------------------

type CartItemAddInput = ToEntity<APICartItemAddInput>

type CartItemEditResponse = ToEntity<APICartItemEditResponse>

type CartItemUpdateInput = ToEntity<APICartItemUpdateInput>

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
      return toEntity(response.data[0])
    }

    const getProducts: AppAPIs['getProducts'] = async ids => {
      const response = await client.get<APIProduct[]>('products', {
        params: { ids },
      })
      return toEntities(response.data)
    }

    const getCartItems: AppAPIs['getCartItems'] = async () => {
      const response = await client.get<APICartItem[]>('cart_items', {
        shouldAuth: true,
      })
      return toEntities(response.data)
    }

    const addCartItems: AppAPIs['addCartItems'] = async items => {
      const response = await client.post<APICartItemEditResponse[]>('cart_items', {
        shouldAuth: true,
        data: keysToSnake(items),
      })
      return toEntities(response.data)
    }

    const updateCartItems: AppAPIs['updateCartItems'] = async items => {
      const response = await client.put<APICartItemEditResponse[]>('cart_items', {
        shouldAuth: true,
        data: keysToSnake(items),
      })
      return toEntities(response.data)
    }

    const removeCartItems: AppAPIs['removeCartItems'] = async cartItemIds => {
      const response = await client.delete<APICartItemEditResponse[]>('cart_items', {
        shouldAuth: true,
        params: { ids: cartItemIds },
      })
      return toEntities(response.data)
    }

    const checkoutCart: AppAPIs['checkoutCart'] = async () => {
      const response = await client.put<boolean>('cart_items/checkout', {
        shouldAuth: true,
      })
      return response.data
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
export type {
  APICartItem,
  APIProduct,
  APIUser,
  CartItemAddInput,
  CartItemEditResponse,
  CartItemUpdateInput,
  RawAppAPIs,
}
