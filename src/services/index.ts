import { AccountService } from '@/services/modules/account'
import { ShopService } from '@/services/modules/shop'
import { reactive } from 'vue'
import { setupAPI } from '@/services/apis'
import { setupHelper } from '@/services/helpers'
import { setupStore } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface ServiceContainer {
  readonly account: AccountService
  readonly shop: ShopService
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace ServiceContainer {
  let instance: ServiceContainer

  export function setupService(services?: ServiceContainer): ServiceContainer {
    setupAPI()
    setupStore()
    setupHelper()

    instance = services ? services : reactive(newRawInstance())
    return instance
  }

  export function useService(): ServiceContainer {
    return instance
  }

  export function newRawInstance() {
    return {
      account: AccountService.newRawInstance(),
      shop: ShopService.newRawInstance(),
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupService, useService } = ServiceContainer
export { ServiceContainer, setupService, useService }
export * from '@/services/base'
