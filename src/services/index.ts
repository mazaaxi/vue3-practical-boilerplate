import { AccountService } from '@/services/modules/account'
import { ShopService } from '@/services/modules/shop'
import { reactive } from 'vue'
import { useAPI } from '@/services/apis'
import { useHelper } from '@/services/helpers'
import { useStore } from '@/services/stores'

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

  export function useService(services?: ServiceContainer): ServiceContainer {
    useAPI()
    useStore()
    useHelper()

    instance = services ? services : instance ? instance : reactive(newRawInstance())
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

const { useService } = ServiceContainer
export { ServiceContainer, useService }
export * from '@/services/base'
