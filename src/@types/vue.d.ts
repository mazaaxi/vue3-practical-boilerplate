import { Constants, Screen } from '@/base'
import { AppRoutes } from '@/router'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $constants: Constants
    $routes: AppRoutes
    $screen: Screen
  }
}
