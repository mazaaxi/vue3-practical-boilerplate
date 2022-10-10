import { AppRoutes } from '@/router'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $routes: AppRoutes
  }
}
