import { CartStore } from '@/services/stores/cart'
import { ProductStore } from '@/services/stores/product'
import { UserStore } from '@/services/stores/user'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface StoreContainer {
  readonly user: UserStore
  readonly product: ProductStore
  readonly cart: CartStore
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace StoreContainer {
  let instance: StoreContainer

  export function setupStore(stores?: StoreContainer): StoreContainer {
    instance = stores ?? {
      user: UserStore.setupInstance(),
      product: ProductStore.setupInstance(),
      cart: CartStore.setupInstance(),
    }
    return instance
  }

  export function useStore(): StoreContainer {
    return instance
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupStore, useStore } = StoreContainer
export { StoreContainer, setupStore, useStore }
