// This file has been implemented with reference to the following:
// https://github.com/yyx990803/register-service-worker/blob/master/src/index.js

import { UAParser } from 'ua-parser-js'

//========================================================================
//
//  Interfaces
//
//========================================================================

type ServiceWorkerChangeState = 'ready' | 'installing' | 'updating' | 'installed' | 'updated' | 'offline' | 'error'

type HookFunc = (state: ServiceWorkerChangeState) => void
type HookRegistrationFunc = (state: ServiceWorkerChangeState, registration: ServiceWorkerRegistration) => void
type HookErrorFunc = (state: 'error', error: Error) => void

interface Hooks {
  ready?: HookRegistrationFunc
  installing?: HookRegistrationFunc
  updating?: HookRegistrationFunc
  installed?: HookRegistrationFunc
  updated?: HookRegistrationFunc
  offline?: HookFunc
  error?: HookErrorFunc
  registrationOptions?: RegistrationOptions
}

//========================================================================
//
//  Implementation
//
//========================================================================

// `window`がロード済みかを表すフラグ
let windowLoaded = false

/**
 * ServiceWorkerを登録します。
 * @param serviceWorkerURL ServiceWorkerの処理が記述されたjsファイルを指定します。
 * @param hooks ServiceWorkerのイベントフックを指定します。
 */
function register(serviceWorkerURL: string, hooks: Hooks = {}): void {
  const { registrationOptions = {} } = hooks
  delete hooks.registrationOptions

  //----------------------------------------------------------------------
  //
  //  Initialization
  //
  //----------------------------------------------------------------------

  const waitWindowLoad = new Promise<void>(resolve => {
    if (windowLoaded) {
      resolve()
    } else {
      window.addEventListener('load', () => {
        windowLoaded = true
        resolve()
      })
    }
  })

  if ('serviceWorker' in navigator) {
    waitWindowLoad.then(async () => {
      try {
        // ServiceWorkerの登録実行
        await registerServiceWorker(serviceWorkerURL, registrationOptions)
      } catch (err: any) {
        handleError(err)
      }
    })
  }

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  function emit(state: ServiceWorkerChangeState, registration_or_error?: ServiceWorkerRegistration | Error): void {
    switch (state) {
      case 'ready':
      case 'installing':
      case 'updating':
      case 'installed':
      case 'updated': {
        const hookFunc = hooks[state]
        hookFunc && hookFunc(state, registration_or_error as ServiceWorkerRegistration)
        break
      }
      case 'offline': {
        const hookFunc = hooks[state]
        hookFunc && hookFunc(state!)
        break
      }
      case 'error': {
        const hookFunc = hooks[state]
        hookFunc && hookFunc(state, registration_or_error as Error)
        break
      }
    }
  }

  async function registerServiceWorker(serviceWorkerURL: string, registrationOptions: RegistrationOptions) {
    let registration!: ServiceWorkerRegistration
    try {
      registration = await navigator.serviceWorker.register(serviceWorkerURL, registrationOptions)
    } catch (err: any) {
      handleError(err)
      return
    }

    //
    // installing
    //
    if (registration.installing) {
      const serviceWorker = registration.installing

      // ServiceWorkerにアップデートがあるかを取得
      registration.onupdatefound = () => {
        emit('installing', registration)
      }

      // インストール状態の変化を監視
      registration.installing.onstatechange = async () => {
        // ここでは次の順で状態(serviceWorker.state)が変化する
        // 'installed' -> 'activating' -> 'activated'
        if (serviceWorker.state === 'activated') {
          // インストール完了イベントを発火
          emit('installed', registration)
          // インストールされたServiceWorkerが使用可能になるまで待機
          await navigator.serviceWorker.ready.then()
          emit('ready', registration)
        }
      }
    }
    //
    // active
    //
    else if (registration.active) {
      // インストール済みServiceWorkerにアップデートがあるかを取得
      registration.onupdatefound = () => {
        emit('updating', registration)
      }

      // インストール済みServiceWorkerのアップデート状態の変化を監視
      registration.active.onstatechange = async e => {
        const state = registration.active!.state
        if (state === 'activated' || state === 'redundant') {
          // アップデート完了イベントを発火
          emit('updated', registration)

          // アップデートされたServiceWorkerが使用可能になるまで待機
          await navigator.serviceWorker.ready.then()

          // TODO
          // Safariだとアップデートまでは完了するが、リロードするとメモリキャッシュが効いて
          // しまい、ServiceWorker経由でリソースが取得されず、アプリケーションが更新されない。
          // このため、ServiceWorkerを登録解除し、リロード時にインストールされるようにしている。
          if (isSafari()) await unregister()

          emit('ready', registration)
        }
      }

      // インストール済みServiceWorkerにアップデートがあるか確認
      await registration.update()
    }
    //
    // waiting
    //
    else if (registration.waiting) {
      // TODO ここはどのような状況で入ってくるのか確認できていない
      console.warn(`ServiceWorker: This block is not supposed to be executed.`)

      const serviceWorker = registration.waiting

      registration.waiting.onstatechange = () => {
        console.log('ServiceWorker waiting:', serviceWorker.state)
      }
    }
    //
    // others
    //
    else {
      // TODO ここはどのような状況で入ってくるのか確認できていない
      console.warn(`ServiceWorker: This block is not supposed to be executed.`)
    }
  }

  function handleError(error: Error) {
    if (!navigator.onLine) {
      emit('offline')
    }
    console.error('ServiceWorker', error)
    emit('error', error)
  }

  function isSafari(): boolean {
    const parser = new UAParser()
    return parser.getBrowser().name === 'Safari' || parser.getBrowser().name === 'Mobile Safari'
  }
}

/**
 * ServiceWorkerの登録を解除します。
 */
async function unregister() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready.then()
    await registration.unregister()
  }
}

//========================================================================
//
//  Exports
//
//========================================================================

export { register, unregister, ServiceWorkerChangeState }
