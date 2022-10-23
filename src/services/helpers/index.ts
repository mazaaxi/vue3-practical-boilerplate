import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface Helpers {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace Helpers {
  let instance: Helpers

  export function setupHelper(helpers?: Helpers): Helpers {
    instance = helpers ?? reactive({})
    return instance
  }

  export function useHelper(): Helpers {
    return instance
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupHelper, useHelper } = Helpers
export { Helpers, setupHelper, useHelper }
