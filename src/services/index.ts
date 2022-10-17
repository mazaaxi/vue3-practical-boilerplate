import { AccountLogic } from '@/services/logics/account'
import { ShopLogic } from '@/services/logics/shop'
import { setupAPIs } from '@/services/apis'
import { setupHelper } from '@/services/helpers'
import { setupStores } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface Services {
  readonly account: AccountLogic
  readonly shop: ShopLogic
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace Services {
  let instance: Services

  export function setupServices(services?: Services): Services {
    setupAPIs()
    setupStores()
    setupHelper()

    instance = services ?? {
      account: AccountLogic.setupInstance(),
      shop: ShopLogic.setupInstance(),
    }
    return instance
  }

  export function useServices(): Services {
    return instance
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupServices, useServices } = Services
export { Services, setupServices, useServices }
export * from '@/services/base'
