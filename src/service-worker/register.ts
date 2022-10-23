// This file has been implemented with reference to the following:
// https://github.com/yyx990803/register-service-worker/blob/master/src/index.js

import { UAParser } from 'ua-parser-js'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type ServiceWorkerChangeState =
  | 'ready'
  | 'installing'
  | 'updating'
  | 'installed'
  | 'updated'
  | 'offline'
  | 'error'

type HookFunc = (state: ServiceWorkerChangeState) => void
type HookRegistrationFunc = (
  state: ServiceWorkerChangeState,
  registration: ServiceWorkerRegistration
) => void
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

//==========================================================================
//
//  Implementation
//
//==========================================================================

// flag indicating whether a `window` has been loaded
let windowLoaded = false

/**
 * Register a ServiceWorker.
 * @param serviceWorkerURL Specify a js file in which a ServiceWorker process is described.
 * @param hooks Specifies a event hook for a ServiceWorker.
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

  function emit(
    state: ServiceWorkerChangeState,
    registration_or_error?: ServiceWorkerRegistration | Error
  ): void {
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

  async function registerServiceWorker(
    serviceWorkerURL: string,
    registrationOptions: RegistrationOptions
  ) {
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

      // get if there are updates to the ServiceWorker
      registration.onupdatefound = () => {
        emit('installing', registration)
      }

      // monitor changes in installation status
      registration.installing.onstatechange = async e => {
        const serviceWorker = e.target as ServiceWorker
        // in this block, `serviceWorker.state` changes in a following order
        // 'installed' -> 'activating' -> 'activated'
        if (serviceWorker.state === 'activated') {
          // fire the installation completion event
          emit('installed', registration)
          // wait until the installed ServiceWorker is ready to use
          await navigator.serviceWorker.ready.then()
          emit('ready', registration)
        }
      }
    }
    //
    // active
    //
    else if (registration.active) {
      // get if there are any updates to a installed ServiceWorker
      registration.onupdatefound = () => {
        emit('updating', registration)
      }

      // monitor changes in a update status of a installed ServiceWorker
      registration.active.onstatechange = async e => {
        const serviceWorker = e.target as ServiceWorker
        if (serviceWorker.state === 'activated' || serviceWorker.state === 'redundant') {
          // fire a update completion event
          emit('updated', registration)

          // wait until the updated ServiceWorker is ready to use
          await navigator.serviceWorker.ready.then()

          // TODO
          //  In Safari, it will complete the update process, but when it reloads,
          //  due to the memory cache, resources will not be retrieved via ServiceWorker
          //  and the application will not be updated. For this reason, I have
          //  unregistered ServiceWorker so that it will be installed on reload.
          if (isSafari()) await unregister()

          emit('ready', registration)
        }
      }

      // check if there are any updates to a installed ServiceWorker
      await registration.update()
    }
    //
    // waiting
    //
    else if (registration.waiting) {
      // TODO I haven't been able to confirm under what circumstances it is coming in here.
      console.warn(`ServiceWorker: This block is not supposed to be executed.`)

      registration.waiting.onstatechange = e => {
        const serviceWorker = e.target as ServiceWorker
        console.log('ServiceWorker waiting:', serviceWorker.state)
      }
    }
    //
    // others
    //
    else {
      // TODO I haven't been able to confirm under what circumstances it is coming in here.
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
 * Unregister a ServiceWorker.
 */
async function unregister() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready.then()
    await registration.unregister()
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { register, unregister }
export type { ServiceWorkerChangeState }
