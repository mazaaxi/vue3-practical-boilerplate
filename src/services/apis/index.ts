import { CartItem, Product, ToRawEntity, toEntities } from '@/services/base'
import { APIClient } from '@/services/apis/client'
import { isImplemented } from 'js-common-lib'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface APIContainer {
  getProduct(id: string): Promise<Product | undefined>
  getProducts(ids?: string[]): Promise<Product[]>
  getCartItem(id: string): Promise<CartItem | undefined>
  getCartItems(ids?: string[]): Promise<CartItem[]>
  addCartItems(items: CartItemAddInput[]): Promise<CartItemEditResponse[]>
  updateCartItems(items: CartItemUpdateInput[]): Promise<CartItemEditResponse[]>
  removeCartItems(cartItemIds: string[]): Promise<CartItemEditResponse[]>
  checkoutCart(): Promise<boolean>
}

interface CartItemAddInput {
  uid: string
  productId: string
  title: string
  price: number
  quantity: number
}

interface CartItemUpdateInput {
  uid: string
  id: string
  quantity: number
}

interface CartItemEditResponse extends CartItem {
  product: Pick<Product, 'id' | 'stock' | 'createdAt' | 'updatedAt'>
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace APIContainer {
  let instance: APIContainer

  export function setupAPI(apis?: APIContainer): APIContainer {
    instance = apis ? apis : newRawInstance()
    return instance
  }

  export function useAPI(): APIContainer {
    return instance
  }

  export function newRawInstance() {
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

    const getProduct: APIContainer['getProduct'] = async id => {
      const response = await client.get<ToRawEntity<Product>[]>('products', {
        params: { ids: [id] },
      })
      if (response.data.length === 0) return
      return toEntities(response.data)[0]
    }

    const getProducts: APIContainer['getProducts'] = async ids => {
      const response = await client.get<ToRawEntity<Product>[]>('products', {
        params: { ids },
      })
      return toEntities(response.data)
    }

    const getCartItem: APIContainer['getCartItem'] = async id => {
      const response = await client.get<ToRawEntity<CartItem>[]>('cartItems', {
        isAuth: true,
        params: { ids: [id] },
      })
      if (response.data.length === 0) return
      return toEntities(response.data)[0]
    }

    const getCartItems: APIContainer['getCartItems'] = async ids => {
      const response = await client.get<ToRawEntity<CartItem>[]>('cartItems', {
        isAuth: true,
        params: { ids },
      })
      return toEntities(response.data)
    }

    const addCartItems: APIContainer['addCartItems'] = async items => {
      const response = await client.post<ToRawEntity<CartItemEditResponse>[]>('cartItems', items, { isAuth: true })
      return toEntities(response.data)
    }

    const updateCartItems: APIContainer['updateCartItems'] = async items => {
      const response = await client.put<ToRawEntity<CartItemEditResponse>[]>('cartItems', items, { isAuth: true })
      return toEntities(response.data)
    }

    const removeCartItems: APIContainer['removeCartItems'] = async cartItemIds => {
      const response = await client.delete<ToRawEntity<CartItemEditResponse>[]>('cartItems', {
        isAuth: true,
        params: { ids: cartItemIds },
      })
      return toEntities(response.data)
    }

    const checkoutCart: APIContainer['checkoutCart'] = async () => {
      const response = await client.put<boolean>('cartItems/checkout', undefined, { isAuth: true })
      return response.data
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      getProduct,
      getProducts,
      getCartItem,
      getCartItems,
      addCartItems,
      updateCartItems,
      removeCartItems,
      checkoutCart,
      client,
    }

    return isImplemented<APIContainer, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupAPI, useAPI } = APIContainer
export { APIContainer, CartItemAddInput, CartItemEditResponse, CartItemUpdateInput, setupAPI, useAPI }
