import { TestAPIContainer, TestHelperContainer, TestServiceContainer, TestStoreContainer } from './services'
import { DefineComponent } from 'vue'
// import { setupDialogs } from '@/dialogs'
import { shallowMount } from '@vue/test-utils'
import { useAPI } from '@/services/apis'
import { useHelper } from '@/services/helpers'
import { useService } from '@/services'
import { useStore } from '@/services/stores'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface ProvidedDependency {
  apis: TestAPIContainer
  helpers: TestHelperContainer
  stores: TestStoreContainer
  services: TestServiceContainer
}

type SetupFunc = (provided: ProvidedDependency) => void

//==========================================================================
//
//  Implementation
//
//==========================================================================

let provided: ProvidedDependency | undefined

/**
 * アプリケーションに必要な依存オブジェクトをVueコンポーネントに登録します。
 * 引数の`setup`を指定しない場合、デフォルトの依存オブジェクトが登録されます。
 * @param setup
 *   サービスとその依存オブジェクトに対してモック設定を行いたい場合この関数を指定します。
 *   この関数の引数にはサービスとその依存オブジェクトが渡ってきます。必要に応じてこの
 *   オブジェクトにモック設定を行って下さい。
 * @param dependency
 *   テストで使用するサービスとその依存オブジェクトを指定します。
 *   ここで指定されたオブジェクトは`setup()`関数の引数にも渡されるので、必要に応じてこの
 *   オブジェクトにモック設定を行うことができます。
 */
function provideDependency(setup?: SetupFunc, dependency?: Partial<ProvidedDependency>): ProvidedDependency {
  const wrapper = shallowMount<ProvidedDependency & DefineComponent>({
    template: '<div></div>',
    setup() {
      return { ...provideDependencyToVue(setup, dependency) }
    },
  })

  const { apis, helpers, stores, services } = wrapper.vm
  return { apis, helpers, stores, services }
}

/**
 * アプリケーションに必要な依存オブジェクトをVueコンポーネントに登録します。
 * 引数の`setup`を指定しない場合、デフォルトの依存オブジェクトが登録されます。
 * @param setup
 *   サービスとその依存オブジェクトに対してモック設定を行いたい場合この関数を指定します。
 *   この関数の引数にはサービスとその依存オブジェクトが渡ってきます。必要に応じてこの
 *   オブジェクトにモック設定を行って下さい。
 * @param dependency
 *   テストで使用するサービスとその依存オブジェクトを指定します。
 *   ここで指定されたオブジェクトは`setup()`関数の引数にも渡されるので、必要に応じてこの
 *   オブジェクトにモック設定を行うことができます。
 */
function provideDependencyToVue(setup?: SetupFunc, dependency?: Partial<ProvidedDependency>): ProvidedDependency {
  // テスト時にダイアログを動かすとエラーになるのでモック化
  // setupDialogs(td.object())

  // まだprovidedが設定されていない場合
  if (!provided) {
    const apis = dependency?.apis ?? TestAPIContainer.newInstance()

    useAPI(apis)

    const stores = dependency?.stores ?? TestStoreContainer.newInstance()
    useStore(stores)

    const helpers = dependency?.helpers ?? TestHelperContainer.newInstance()
    useHelper(helpers)

    const services = dependency?.services ?? TestServiceContainer.newInstance()
    useService(services)

    provided = { apis, helpers, stores, services }
  }

  // setup関数が指定されていなかった場合、providedを返す
  if (!setup) return provided

  // setup関数を実行
  // ※setup関数を実行するとprovidedの依存オブジェクトがモック化される
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

export { provideDependency, provideDependencyToVue, clearProvidedDependency, ProvidedDependency }
export * from './services'
