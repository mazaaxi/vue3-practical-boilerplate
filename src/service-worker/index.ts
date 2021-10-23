import * as _path from 'path'
import { Unsubscribe, createNanoEvents } from 'nanoevents'
import { ServiceWorkerChangeState } from '@/service-worker/register'
import { register as registerServiceWorker } from '@/service-worker/register'
import { useConfig } from '@/config'
import { useI18n } from '@/i18n'

//========================================================================
//
//  Interfaces
//
//========================================================================

interface ServiceWorkerManager {
  /**
   * ServiceWorkerの更新を実行します。
   */
  update(): void
  /**
   * ServiceWorkerの状態変化を監視します。
   * @param cb
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

    // 実行モードが`remote`以外の場合、空インスタンスを返して終了
    // ※開発時(ローカル環境)においてはServiceWorkerが邪魔になるため、
    //   `ServiceWorkerManager`の空インスタンスを返す。
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
          emitStateChange('ready', String(i18n.t('serviceWorker.ready')))
        },
        installing: () => {
          emitStateChange('installing', String(i18n.t('serviceWorker.installing')))
        },
        updating: () => {
          emitStateChange('updating', String(i18n.t('serviceWorker.updating')))
        },
        installed: () => {
          emitStateChange('installed', String(i18n.t('serviceWorker.installed')))
        },
        updated: () => {
          emitStateChange('updated', String(i18n.t('serviceWorker.updated')))
        },
        offline: () => {
          emitStateChange('offline', String(i18n.t('serviceWorker.offline')))
        },
        error: (state, err) => {
          emitStateChange('error', String(i18n.t('serviceWorker.error')))
        },
      })
    }

    /**
     * ServiceWorkerの状態変更イベントを発火します。
     * @param state
     * @param message
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
