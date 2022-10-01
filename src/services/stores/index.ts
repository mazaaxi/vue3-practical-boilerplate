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
    instance = stores ? stores : reactive(newWrapInstance())
    return instance
  }

  export function useStore(): StoreContainer {
    return instance
  }

  export function newWrapInstance() {
    return {
      user: UserStore.newWrapInstance(),
      product: ProductStore.newWrapInstance(),
      cart: CartStore.newWrapInstance(),
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
