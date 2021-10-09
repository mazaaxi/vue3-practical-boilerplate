import { computed, reactive } from 'vue'
import { Screen as _Screen } from 'quasar'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface Screen {
  readonly name: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  readonly sizes: { sm: number; md: number; lg: number; xl: number }

  readonly xs: boolean
  readonly sm: boolean
  readonly md: boolean
  readonly lg: boolean
  readonly xl: boolean

  readonly lt: { sm: boolean; md: boolean; lg: boolean; xl: boolean }
  readonly gt: { xs: boolean; sm: boolean; md: boolean; lg: boolean }
}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace Screen {
  let instance: Screen

  export function getInstance(): Screen {
    instance = instance ?? newInstance()
    return instance
  }

  export function newInstance(): Screen {
    const name = computed<Screen['name']>(() => _Screen.name)

    const sizes = computed<Screen['sizes']>(() => {
      return {
        sm: _Screen.sizes.sm,
        md: _Screen.sizes.md,
        lg: _Screen.sizes.lg,
        xl: _Screen.sizes.xl,
      }
    })

    const xs = computed<Screen['xs']>(() => _Screen.xs)
    const sm = computed<Screen['sm']>(() => _Screen.sm)
    const md = computed<Screen['md']>(() => _Screen.md)
    const lg = computed<Screen['lg']>(() => _Screen.lg)
    const xl = computed<Screen['xl']>(() => _Screen.xl)

    const lt = computed<Screen['lt']>(() => {
      return {
        sm: _Screen.lt.sm,
        md: _Screen.lt.md,
        lg: _Screen.lt.lg,
        xl: _Screen.lt.xl,
      }
    })

    const gt = computed<Screen['gt']>(() => {
      return {
        xs: _Screen.gt.xs,
        sm: _Screen.gt.sm,
        md: _Screen.gt.md,
        lg: _Screen.gt.lg,
      }
    })

    return reactive({ name, sizes, xs, sm, md, lg, xl, lt, gt })
  }
}

function useScreen(): Screen {
  return Screen.getInstance()
}

//========================================================================
//
//  Export
//
//========================================================================

export { useScreen }
