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

  export function useHelper(helpers?: HelperContainer): HelperContainer {
    instance = helpers ? helpers : instance ? instance : reactive(newRawInstance())
    return instance
  }

  export function newRawInstance() {
    return {
      account: AccountHelper.newRawInstance(),
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { useHelper } = HelperContainer
export { AccountHelper, HelperContainer, useHelper }
