import { UnwrapNestedRefs } from '@vue/reactivity'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestHelpers extends UnwrapNestedRefs<ReturnType<typeof TestHelpers['newInstance']>> {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestHelpers {
  export function newInstance() {
    return {}
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestHelpers }
