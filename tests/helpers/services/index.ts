import { ServiceContainer } from '@/services'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestServiceContainer extends UnwrapNestedRefs<ReturnType<typeof ServiceContainer['newWrapInstance']>> {}

type TestShopLogic = TestServiceContainer['shop']

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestServiceContainer {
  export function newInstance(): TestServiceContainer {
    return reactive(ServiceContainer.newWrapInstance())
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestServiceContainer, TestShopLogic }
export * from './apis'
export * from './stores'
export * from './helpers'
