import { UnwrapNestedRefs } from '@vue/reactivity'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestHelperContainer extends UnwrapNestedRefs<ReturnType<typeof TestHelperContainer['newInstance']>> {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestHelperContainer {
  export function newInstance() {
    return {}
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestHelperContainer }
