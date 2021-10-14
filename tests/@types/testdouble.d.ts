import 'testdouble'
import { DeepPartial } from 'js-common-lib'
import _td from 'testdouble'

declare global {
  const td: typeof _td

  interface Window {
    td: typeof _td
  }
}

declare module 'testdouble' {
  export function replace<T = any, K extends keyof T = keyof T, F = DeepPartial<T[K]>>(path: T, property: K, f?: F): T[K]
}
