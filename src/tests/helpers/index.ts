import { TestAPIs, TestHelpers, TestServices, TestStores } from '@/tests/helpers/services'
import { AppAPIs } from '@/services/apis'
import { AppHelpers } from '@/services/helpers'
import { AppServices } from '@/services'
import { AppStores } from '@/services/stores'
import type { DefineComponent } from 'vue'
import { shallowMount } from '@vue/test-utils'

//==========================================================================
//
//  Definition
//
//==========================================================================

interface ServiceDependencies {
  apis: TestAPIs
  stores: TestStores
  helpers: TestHelpers
  services: TestServices
}

type SetupFunc = (dependencies: ServiceDependencies) => void | Promise<void>

//==========================================================================
//
//  Implementation
//
//==========================================================================

let currentDependencies: ServiceDependencies | undefined

/**
 * Get the test service's dependency objects. If the `setup` argument is not specified,
 * the default test dependency objects are registered and used.
 * @param setup
 *   Specify this function when you want to perform mock settings for dependency objects.
 *   Dependency objects will be passed as the argument of this function. Set mock settings
 *   for these objects if necessary.
 * @param dependencies
 *   Specifies dependency objects to be used in a test. The objects specified here are also
 *   passed as argument to the `setup()` function, so you can set mock settings on these
 *   objects if necessary.
 */
function useServiceDependencies(
  setup?: SetupFunc,
  dependencies?: Partial<ServiceDependencies>
): ServiceDependencies {
  const wrapper = shallowMount<ServiceDependencies & DefineComponent>({
    template: '<div></div>',
    setup() {
      return { ...useServiceDependenciesImpl(setup, dependencies) }
    },
  })

  const { apis, stores, helpers, services } = wrapper.vm
  return { apis, stores, helpers, services }
}

function useServiceDependenciesImpl(
  setup?: SetupFunc,
  dependencies?: Partial<ServiceDependencies>
): ServiceDependencies {
  if (!currentDependencies) {
    const apis = dependencies?.apis ?? TestAPIs.newInstance()
    AppAPIs.setup(apis)

    const stores = dependencies?.stores ?? TestStores.newInstance()
    AppStores.setup(stores)

    const helpers = dependencies?.helpers ?? TestHelpers.newInstance()
    AppHelpers.setup(helpers)

    const services = dependencies?.services ?? TestServices.newInstance()
    AppServices.setup(services)

    currentDependencies = { apis, stores, helpers, services }
  }

  // if the `setup` function is not specified, return `currentDependencies`
  if (!setup) return currentDependencies

  // NOTE: when the `setup` function is executed, the `currentDependencies` will be mocked
  // as needed.
  setup(currentDependencies)

  return currentDependencies
}

function clearServiceDependencies(): void {
  currentDependencies = undefined
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { useServiceDependencies, clearServiceDependencies }
export type { ServiceDependencies }
export * from '@/tests/helpers/services'
