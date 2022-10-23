import { TestAPIs, TestHelpers, TestServices, TestStores } from './services'
import { DefineComponent } from 'vue'
import { setupAPIs } from '@/services/apis'
import { setupHelper } from '@/services/helpers'
import { setupServices } from '@/services'
import { setupStores } from '@/services/stores'
import { shallowMount } from '@vue/test-utils'

//==========================================================================
//
//  Interfaces
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
  // launching a dialog during testing will cause an error, so mock it.
  // setupDialogs(td.object())

  if (!currentDependencies) {
    const apis = dependencies?.apis ?? TestAPIs.newInstance()
    setupAPIs(apis)

    const stores = dependencies?.stores ?? TestStores.newInstance()
    setupStores(stores)

    const helpers = dependencies?.helpers ?? TestHelpers.newInstance()
    setupHelper(helpers)

    const services = dependencies?.services ?? TestServices.newInstance()
    setupServices(services)

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
export * from './services'
