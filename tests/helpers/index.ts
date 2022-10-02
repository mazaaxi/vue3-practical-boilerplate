import { TestAPIContainer, TestHelperContainer, TestServiceContainer, TestStoreContainer } from './services'
import { DefineComponent } from 'vue'
import { setupAPI } from '@/services/apis'
import { setupHelper } from '@/services/helpers'
import { setupService } from '@/services'
import { setupStore } from '@/services/stores'
import { shallowMount } from '@vue/test-utils'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface ProvidedDependency {
  apis: TestAPIContainer
  stores: TestStoreContainer
  helpers: TestHelperContainer
  services: TestServiceContainer
}

type SetupFunc = (provided: ProvidedDependency) => void | Promise<void>

//==========================================================================
//
//  Implementation
//
//==========================================================================

let provided: ProvidedDependency | undefined

/**
 * Register dependent objects required for the application.
 * If the `setup` argument is not specified, default dependent objects will be registered.
 * @param setup
 *   Specify this function when you want to perform mock settings for dependent objects.
 *   Dependent objects will be passed as the argument of this function.
 *   Set mock settings for these objects if necessary.
 * @param dependency
 *   Specifies dependency objects to be used in a test.
 *   The object specified here is also passed as an argument to the `setup()` function,
 *   so you can set mock settings on this object if necessary.
 */
function provideDependency(setup?: SetupFunc, dependency?: Partial<ProvidedDependency>): ProvidedDependency {
  const wrapper = shallowMount<ProvidedDependency & DefineComponent>({
    template: '<div></div>',
    setup() {
      return { ...provideDependencyImpl(setup, dependency) }
    },
  })

  const { apis, stores, helpers, services } = wrapper.vm
  return { apis, stores, helpers, services }
}

function provideDependencyImpl(setup?: SetupFunc, dependency?: Partial<ProvidedDependency>): ProvidedDependency {
  // launching a dialog during testing will cause an error, so mock it.
  // setupDialogs(td.object())

  if (!provided) {
    const apis = dependency?.apis ?? TestAPIContainer.newInstance()
    setupAPI(apis)

    const stores = dependency?.stores ?? TestStoreContainer.newInstance()
    setupStore(stores)

    const helpers = dependency?.helpers ?? TestHelperContainer.newInstance()
    setupHelper(helpers)

    const services = dependency?.services ?? TestServiceContainer.newInstance()
    setupService(services)

    provided = { apis, stores, helpers, services }
  }

  // if the `setup` function is not specified, return `provided`
  if (!setup) return provided

  // NOTE: when the `setup` function is executed, the `provided` dependent objects will be mocked as needed.
  setup(provided)

  return provided
}

function clearProvidedDependency(): void {
  provided = undefined
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { provideDependency, clearProvidedDependency, ProvidedDependency }
export * from './services'
