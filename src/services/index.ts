import { AccountLogic } from '@/services/logics/account'
import { AppAPIs } from '@/services/apis'
import { AppHelpers } from '@/services/helpers'
import { AppStores } from '@/services/stores'
import { ShopLogic } from '@/services/logics/shop'
import { reactive } from 'vue'

//==========================================================================
//
//  Definition
//
//==========================================================================

interface AppServices {
  readonly account: AccountLogic
  readonly shop: ShopLogic
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AppServices {
  let instance: AppServices

  export function setup(services?: AppServices): AppServices {
    AppAPIs.setup()
    AppStores.setup()
    AppHelpers.setup()

    instance =
      services ??
      reactive({
        account: AccountLogic.setup(),
        shop: ShopLogic.setup(),
      })
    return instance
  }

  export function use(): AppServices {
    return instance
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AppServices }
export * from '@/services/base'
export * from '@/services/entities'
