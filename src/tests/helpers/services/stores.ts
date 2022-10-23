import type { CartItem, Product, User } from '@/services'
import { CartStore } from '@/services/stores/cart'
import type { DeepReadonly } from 'js-common-lib'
import { ProductStore } from '@/services/stores/product'
import type { UnwrapNestedRefs } from 'vue'
import { UserStore } from '@/services/stores/user'
import { expect } from 'vitest'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestStores extends UnwrapNestedRefs<ReturnType<typeof TestStores['newInstance']>> {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestStores {
  export function newInstance() {
    return {
      user: UserStore.setupInstance(reactive(UserStore.newWrapInstance())),
      product: ProductStore.setupInstance(reactive(ProductStore.newWrapInstance())),
      cart: CartStore.setupInstance(reactive(CartStore.newWrapInstance())),
    }
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
