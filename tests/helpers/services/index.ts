import { ServiceContainer } from '@/services'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestServiceContainer extends UnwrapNestedRefs<ReturnType<typeof ServiceContainer['newRawInstance']>> {}

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
