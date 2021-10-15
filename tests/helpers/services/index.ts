import { Entity, ServiceContainer } from '@/services'
import { UnwrapRef, reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestServiceContainer extends UnwrapRef<ReturnType<typeof ServiceContainer['newRawInstance']>> {}

type TestShopService = TestServiceContainer['shop']

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestServiceContainer {
  export function newInstance(): TestServiceContainer {
    return reactive(ServiceContainer.newRawInstance())
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestServiceContainer, TestShopService }
export * from './apis'
export * from './stores'
export * from './helpers'
