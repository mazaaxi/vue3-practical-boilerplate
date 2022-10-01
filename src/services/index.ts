import { AccountLogic } from '@/services/logics/account'
import { ShopLogic } from '@/services/logics/shop'
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
  readonly account: AccountLogic
  readonly shop: ShopLogic
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

    instance = services ? services : reactive(newWrapInstance())
    return instance
  }

  export function useService(): ServiceContainer {
    return instance
  }

  export function newWrapInstance() {
    return {
      account: AccountLogic.newWrapInstance(),
      shop: ShopLogic.newWrapInstance(),
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
