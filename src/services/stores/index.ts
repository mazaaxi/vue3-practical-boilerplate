import { CartStore } from '@/services/stores/cart'
import { ProductStore } from '@/services/stores/product'
import { UserStore } from '@/services/stores/user'
import { reactive } from 'vue'

//==========================================================================
//
//  Definition
//
//==========================================================================

interface AppStores {
  readonly user: UserStore
  readonly product: ProductStore
  readonly cart: CartStore
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AppStores {
  let instance: AppStores

  export function setup(stores?: AppStores): AppStores {
    instance =
      stores ??
      reactive({
        user: UserStore.setup(),
        product: ProductStore.setup(),
        cart: CartStore.setup(),
      })
    return instance
  }

  export function use(): AppStores {
    return instance
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AppStores }
export * from '@/services/stores/cart'
export * from '@/services/stores/product'
export * from '@/services/stores/user'
