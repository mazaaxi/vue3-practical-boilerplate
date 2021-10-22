import { BaseDialog, DialogNames } from '@/dialogs/base'
import { DialogContainer, MessageDialog } from '@/dialogs/modules'
import { Ref } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface Dialogs {
  readonly message: DialogContainer['message']
  readonly anchor: DialogContainer['anchor']

  /**
   * ダイアログを開くためのクエリを生成します。
   *
   * ダイアログクエリの例:
   *   dialogName=signIn&dialogParams=%257B%2522account%2522%253A%2522taro%2522%257D
   *
   * @param dialogName ダイアログの名前
   * @param dialogParams ダイアログに渡すパラメータ
   */
  buildQuery(dialogName: DialogNames, dialogParams?: any): string

  /**
   * 現在URLにURLに付与されているダイアログクエリを取得します。
   */
  getQuery: DialogContainer['getQuery']

  /**
   * 現在URLに付与されているダイアログクエリを削除します。
   */
  clearQuery: DialogContainer['clearQuery']
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace Dialogs {
  let instance: Dialogs

  /**
   * 様々なダイアログを扱うためのオブジェクトをセットアップします。
   * @param dialogContainer
   *   アプリケーションのメインページでインスタンス化されたダイアログコンテナを指定します。
   */
  export function setupDialogs(dialogContainer: Ref<DialogContainer | undefined>): Dialogs {
    instance = newInstance(dialogContainer)
    return instance
  }

  /**
   * 様々なダイアログを扱うためのオブジェクトを提供します。
   */
  export function useDialogs(): Dialogs {
    return instance
  }

  function newInstance(dialogContainer: Ref<DialogContainer | undefined>): Dialogs {
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const message: Dialogs['message'] = { open: params => getDialogs().message.open(params) }
    const anchor: Dialogs['anchor'] = { open: params => getDialogs().anchor.open(params) }

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const buildQuery: Dialogs['buildQuery'] = (dialogName, dialogParams) => {
      let result = `dialogName=${dialogName}`
      if (dialogParams) {
        result += `&dialogParams=${encodeURIComponent(JSON.stringify(dialogParams))}`
      }
      return result
    }

    const getQuery: Dialogs['getQuery'] = () => getDialogs().getQuery()

    const clearQuery: Dialogs['clearQuery'] = () => getDialogs().clearQuery()

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function getDialogs(): DialogContainer {
      if (!dialogContainer) {
        throw new Error(`'DialogContainer' is not provided.`)
      }
      if (!dialogContainer.value) {
        throw new Error(`'DialogContainer' has not yet been instantiated.`)
      }
      return dialogContainer.value
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      message,
      anchor,
      buildQuery,
      getQuery,
      clearQuery,
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

const { setupDialogs, useDialogs } = Dialogs
export { Dialogs, setupDialogs, useDialogs }

export { BaseDialog, DialogContainer, MessageDialog }
