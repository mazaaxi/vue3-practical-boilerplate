import { UnwrapRef, reactive } from 'vue'
import { HelperContainer } from '@/services/helpers'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestHelperContainer extends UnwrapRef<ReturnType<typeof HelperContainer['newRawInstance']>> {}

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
