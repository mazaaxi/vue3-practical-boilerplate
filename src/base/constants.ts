import type { App } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type AppConstants = ReturnType<typeof AppConstants.use>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace AppConstants {
  const instance = {
    Styles: {
      AppHeaderHeight: 50,
    },

    /**
     * @see Plugin.install of @vue/runtime-core
     */
    install(app: App, ...options: any[]) {
      app.config.globalProperties.$constants = instance
    },
  }

  export function use() {
    return instance
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { AppConstants }
