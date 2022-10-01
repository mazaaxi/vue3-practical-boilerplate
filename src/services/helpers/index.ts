import { AccountHelper } from '@/services/helpers/account'
import { reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface HelperContainer {
  readonly account: AccountHelper
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace HelperContainer {
  let instance: HelperContainer

  export function setupHelper(helpers?: HelperContainer): HelperContainer {
    instance = helpers ? helpers : reactive(newWrapInstance())
    return instance
  }

  export function useHelper(): HelperContainer {
    return instance
  }

  export function newWrapInstance() {
    return {
      account: AccountHelper.newWrapInstance(),
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupHelper, useHelper } = HelperContainer
export { AccountHelper, HelperContainer, setupHelper, useHelper }
