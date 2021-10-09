import { Composer, I18n, I18nOptions, Locale, useI18n as _useI18n, createI18n } from 'vue-i18n'
import { WritableComputedRef, nextTick } from 'vue'
import axios from 'axios'
import { datetimeFormats } from '@/i18n/date-time-formats'

//----------------------------------------------------------------------
//
//  Interfaces
//
//----------------------------------------------------------------------

const SupportI18nLocales = ['en', 'en-US', 'ja', 'ja-JP']

interface I18nContainer {
  i18n: Composer<unknown, unknown, unknown, unknown, never, unknown>
}

//----------------------------------------------------------------------
//
//  Implementation
//
//----------------------------------------------------------------------

namespace I18nContainer {
  let instance: I18n

  export function setupI18n(options: Omit<I18nOptions, 'legacy'> & { locale: Locale }) {
    const { locale, ..._options } = options
    instance = createI18n({
      ..._options,
      legacy: false,
      datetimeFormats,
    })
    setI18nLanguage(locale || 'en')
    return instance
  }

  export function useI18n(): I18nContainer {
    return {
      i18n: _useI18n({ useScope: 'global' }),
    }
  }

  export function setI18nLanguage(locale: string) {
    ;(instance.global.locale as WritableComputedRef<string>).value = locale
    axios.defaults.headers.common['Accept-Language'] = locale
  }

  export async function loadI18nLocaleMessages(locale: string) {
    // load locale messages with dynamic import
    const messages = await import(/* webpackChunkName: "locale-[request]" */ `@/i18n/locales/${locale}.js`)

    // set locale and locale message
    instance.global.setLocaleMessage(locale, messages.default)

    return nextTick()
  }
}

//----------------------------------------------------------------------
//
//  Export
//
//----------------------------------------------------------------------

const { setupI18n, useI18n, setI18nLanguage, loadI18nLocaleMessages } = I18nContainer
export { SupportI18nLocales, setupI18n, useI18n, setI18nLanguage, loadI18nLocaleMessages }
