import { HelperContainer } from '@/services/helpers'
import { UnwrapNestedRefs } from '@vue/reactivity'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestHelperContainer extends UnwrapNestedRefs<ReturnType<typeof HelperContainer['newWrapInstance']>> {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestHelperContainer {
  export function newInstance(): TestHelperContainer {
    return reactive(HelperContainer.newWrapInstance())
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestHelperContainer }
