import { App } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type Constants = typeof constants

//==========================================================================
//
//  Implementation
//
//==========================================================================

const constants = {
  styles: {
    AppHeaderHeight: 50,
  },

  /**
   * @see Plugin.install of @vue/runtime-core
   */
  install(app: App, ...options: any[]) {
    app.config.globalProperties.$constants = constants
  },
}

function useConstants(): Constants {
  return constants
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { Constants, useConstants }
