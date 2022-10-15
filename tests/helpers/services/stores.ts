import { CartItem, Product, User } from '@/services'
import { CartStore } from '@/services/stores/cart'
import { DeepReadonly } from 'js-common-lib'
import { ProductStore } from '@/services/stores/product'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { UserStore } from '@/services/stores/user'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestStoreContainer
  extends UnwrapNestedRefs<ReturnType<typeof TestStoreContainer['newInstance']>> {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestStoreContainer {
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
function toBeCopyUser<T extends DeepReadonly<User>>(stores: TestStoreContainer, actual: T): void {
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
  stores: TestStoreContainer,
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
  stores: TestStoreContainer,
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

export { TestStoreContainer, toBeCopyUser, toBeCopyCartItem, toBeCopyProduct }
