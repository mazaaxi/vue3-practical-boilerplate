import { CartItem, Product } from '@/services'
import { UnwrapRef, reactive } from 'vue'
import { DeepReadonly } from 'js-common-lib'
import { StoreContainer } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestStoreContainer extends UnwrapRef<ReturnType<typeof StoreContainer['newRawInstance']>> {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestStoreContainer {
  export function newInstance(): TestStoreContainer {
    return reactive(StoreContainer.newRawInstance())
  }
}

//--------------------------------------------------
//  Product
//--------------------------------------------------

/**
 * 指定されたアイテムがストアのコピーであることを検証します。
 * @param store
 * @param actual
 */
function toBeCopyProduct<T extends DeepReadonly<Product>>(store: TestStoreContainer, actual: T | T[]): void {
  const items = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  for (const item of items) {
    const stateItem = store.cart.all.find(stateItem => stateItem.id === item.id)
    expect(item).not.toBe(stateItem)
  }
}

//--------------------------------------------------
//  CartItem
//--------------------------------------------------

/**
 * 指定されたアイテムがストアのコピーであることを検証します。
 * @param store
 * @param actual
 */
function toBeCopyCartItem<T extends DeepReadonly<CartItem>>(store: TestStoreContainer, actual: T | T[]): void {
  const items = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  for (const item of items) {
    const stateItem = store.cart.all.find(stateItem => stateItem.id === item.id)
    expect(item).not.toBe(stateItem)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestStoreContainer, toBeCopyCartItem, toBeCopyProduct }
