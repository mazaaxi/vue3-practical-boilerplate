import { CartStore } from '@/services/stores/cart'
import { ProductStore } from '@/services/stores/product'
import { UserStore } from '@/services/stores/user'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface Stores {
  readonly user: UserStore
  readonly product: ProductStore
  readonly cart: CartStore
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace Stores {
  let instance: Stores

  export function setupStores(stores?: Stores): Stores {
    instance = stores ?? {
      user: UserStore.setupInstance(),
      product: ProductStore.setupInstance(),
      cart: CartStore.setupInstance(),
    }
    return instance
  }

  export function useStores(): Stores {
    return instance
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupStores, useStores } = Stores
export { Stores, setupStores, useStores }
