import { CartStore } from '@/services/stores/cart'
import { ProductStore } from '@/services/stores/product'
import { UserStore } from '@/services/stores/user'
import { reactive } from 'vue'

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
    instance = stores ? stores : reactive(newRawInstance())
    return instance
  }

  export function useStore(): StoreContainer {
    return instance
  }

  export function newRawInstance() {
    return {
      user: UserStore.newRawInstance(),
      product: ProductStore.newRawInstance(),
      cart: CartStore.newRawInstance(),
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupStore, useStore } = StoreContainer
export { StoreContainer, setupStore, useStore }
