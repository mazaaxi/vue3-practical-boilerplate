import { HelperContainer } from '@/services/helpers'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestHelperContainer extends UnwrapNestedRefs<ReturnType<typeof HelperContainer['newRawInstance']>> {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestHelperContainer {
  export function newInstance(): TestHelperContainer {
    return reactive(HelperContainer.newRawInstance())
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestHelperContainer }
