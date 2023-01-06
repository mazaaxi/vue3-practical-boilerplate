import type { CartItem, Product, User } from '@/services'
import { CartStore, ProductStore, UserStore } from '@/services/stores'
import type { DeepReadonly } from 'js-common-lib'
import { expect } from 'vitest'
import { reactive } from 'vue'

//==========================================================================
//
//  Definition
//
//==========================================================================

type TestStores = ReturnType<typeof TestStores['newInstance']>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestStores {
  export function newInstance() {
    return reactive({
      user: UserStore.setup(),
      product: ProductStore.setup(),
      cart: CartStore.setup(),
    })
  }
}

//--------------------------------------------------
//  User
//--------------------------------------------------

/**
 * Verifies that the specified item is a copy of the store.
 * @param stores
 * @param actual
 */
function toBeCopyUser<T extends DeepReadonly<User>>(stores: TestStores, actual: T): void {
  const items = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  for (const item of items) {
    const stateItem = stores.user.all.find(stateItem => stateItem.id === item.id)
    expect(item).not.toBe(stateItem)
  }
}

//--------------------------------------------------
//  Product
//--------------------------------------------------

/**
 * Verifies that the specified item is a copy of the store.
 * @param stores
 * @param actual
 */
function toBeCopyProduct<T extends DeepReadonly<Product>>(
  stores: TestStores,
  actual: T | T[]
): void {
  const items = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  for (const item of items) {
    const stateItem = stores.cart.all.find(stateItem => stateItem.id === item.id)
    expect(item).not.toBe(stateItem)
  }
}

//--------------------------------------------------
//  CartItem
//--------------------------------------------------

/**
 * Verifies that the specified item is a copy of the store.
 * @param stores
 * @param actual
 */
function toBeCopyCartItem<T extends DeepReadonly<CartItem>>(
  stores: TestStores,
  actual: T | T[]
): void {
  const items = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  for (const item of items) {
    const stateItem = stores.cart.all.find(stateItem => stateItem.id === item.id)
    expect(item).not.toBe(stateItem)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestStores, toBeCopyUser, toBeCopyCartItem, toBeCopyProduct }
