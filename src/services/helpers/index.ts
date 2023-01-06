import { reactive } from 'vue'

//==========================================================================
//
//  Definition
//
//==========================================================================

interface AppHelpers {}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AppHelpers {
  let instance: AppHelpers

  export function setup(helpers?: AppHelpers): AppHelpers {
    instance = helpers ?? reactive({})
    return instance
  }

  export function use(): AppHelpers {
    return instance
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AppHelpers }
