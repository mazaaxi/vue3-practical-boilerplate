import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface HelperContainer {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace HelperContainer {
  let instance: HelperContainer

  export function setupHelper(helpers?: HelperContainer): HelperContainer {
    instance = helpers ?? reactive({})
    return instance
  }

  export function useHelper(): HelperContainer {
    return instance
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupHelper, useHelper } = HelperContainer
export { HelperContainer, setupHelper, useHelper }
