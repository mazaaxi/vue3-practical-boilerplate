import * as _path from 'path'
import { ServiceWorkerChangeState, register as registerServiceWorker } from '@/service-worker/register'
import { Unsubscribe, createNanoEvents } from 'nanoevents'
import { useConfig } from '@/config'
import { useI18n } from '@/i18n'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface ServiceWorkerManager {
  /**
   * Update a ServiceWorker.
   */
  update(): void

  /**
   * Monitors changes in a state of a ServiceWorker.
   */
  onStateChange(cb: StateChangeCallback): Unsubscribe
}

type StateChangeCallback = (info: ServiceWorkerStateChangeInfo) => void

interface ServiceWorkerStateChangeInfo {
  state: ServiceWorkerChangeState
  message: string
}

//========================================================================
//
//  Implementation
//
//========================================================================

namespace ServiceWorkerManager {
  let instance: ServiceWorkerManager

  export function setupServiceWorker(): ServiceWorkerManager {
    instance = newInstance()
    return instance
  }

  export function useServiceWorker(): ServiceWorkerManager {
    return instance
  }

  function newInstance(): ServiceWorkerManager {
    const StateChangeEvent = 'StateChange'

    const EmptyInstance: ServiceWorkerManager = (() => {
      const emitter = createNanoEvents()
      const update = () => {}
      const onStateChange: ServiceWorkerManager['onStateChange'] = cb => {
        return emitter.on(StateChangeEvent, cb)
      }
      return { update, onStateChange }
    })()

    if (!('serviceWorker' in navigator)) return EmptyInstance

    const config = useConfig()

    // if a execution mode is not `remote`, return an empty instance and exit
    // NOTE: Return an empty instance of `ServiceWorkerManager`, since ServiceWorker
    // gets in the way during development (local environment).
    if (config.env.executeMode !== 'remote') return EmptyInstance

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const emitter = createNanoEvents()

    const i18n = useI18n()

    //----------------------------------------------------------------------
    //
    //  Initialization
    //
    //----------------------------------------------------------------------

    register()

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const update: ServiceWorkerManager['update'] = () => {
      register()
    }

    const onStateChange: ServiceWorkerManager['onStateChange'] = cb => {
      return emitter.on(StateChangeEvent, cb)
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    /**
     * ServiceWorkerの登録を行います。
     */
    function register(): void {
      registerServiceWorker(_path.join(process.env.BASE_URL ?? '', 'service-worker.js'), {
        ready: () => {
          emitStateChange('ready', i18n.t('serviceWorker.ready'))
        },
        installing: () => {
          emitStateChange('installing', i18n.t('serviceWorker.installing'))
        },
        updating: () => {
          emitStateChange('updating', i18n.t('serviceWorker.updating'))
        },
        installed: () => {
          emitStateChange('installed', i18n.t('serviceWorker.installed'))
        },
        updated: () => {
          emitStateChange('updated', i18n.t('serviceWorker.updated'))
        },
        offline: () => {
          emitStateChange('offline', i18n.t('serviceWorker.offline'))
        },
        error: (state, err) => {
          emitStateChange('error', i18n.t('serviceWorker.error'))
        },
      })
    }

    /**
     * Fires the ServiceWorker state change event.
     */
    function emitStateChange(state: ServiceWorkerChangeState, message: string): void {
      const info: ServiceWorkerStateChangeInfo = { state, message }
      emitter.emit(StateChangeEvent, info)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      update,
      onStateChange,
    }
  }
}

//========================================================================
//
//  Export
//
//========================================================================

const { setupServiceWorker, useServiceWorker } = ServiceWorkerManager
export { ServiceWorkerChangeState, setupServiceWorker, useServiceWorker }
