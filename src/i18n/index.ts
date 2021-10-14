import { I18n, Locale, useI18n as _useI18n, createI18n } from 'vue-i18n'
import { WritableComputedRef, nextTick } from 'vue'
import axios from 'axios'
import { datetimeFormats } from '@/i18n/date-time-formats'
import en from '@/i18n/locales/en'

//----------------------------------------------------------------------
//
//  Interfaces
//
//----------------------------------------------------------------------

const SupportI18nLocales = ['ja', 'ja-JP', 'en', 'en-US']

interface I18nContainer {
  i18n: I18n
  setI18nLanguage(locale: string): void
  loadI18nLocaleMessages(locale: string): Promise<void>
}

//----------------------------------------------------------------------
//
//  Implementation
//
//----------------------------------------------------------------------

namespace I18nContainer {
  let instance: I18nContainer

  export function setupI18n(options?: { locale?: Locale }): I18n {
    instance ??= newInstance(options)
    return instance.i18n
  }

  export function useI18n() {
    return _useI18n({ useScope: 'global' })
  }

  export function useI18nUtils(): Omit<I18nContainer, 'i18n'> {
    const { i18n, ...others } = instance
    return others
  }

  function newInstance(options?: { locale?: Locale }): I18nContainer {
    options ??= {}
    options.locale ??= 'en'

    const i18n: I18n = createI18n({
      legacy: false,
      globalInjection: true,
      fallbackLocale: 'en',
      messages: { en },
      datetimeFormats,
      ...options,
    })

    const setI18nLanguage: I18nContainer['setI18nLanguage'] = locale => {
      ;(i18n.global.locale as WritableComputedRef<string>).value = locale
      axios.defaults.headers.common['Accept-Language'] = locale
    }

    const loadI18nLocaleMessages: I18nContainer['loadI18nLocaleMessages'] = async locale => {
      // load locale messages with dynamic import
      const messages = await import(/* webpackChunkName: "locale-[request]" */ `@/i18n/locales/${locale}.js`)
      // set locale and locale message
      i18n.global.setLocaleMessage(locale, messages.default)
      return nextTick()
    }

    setI18nLanguage(options.locale)

    return {
      i18n,
      setI18nLanguage,
      loadI18nLocaleMessages,
    }
  }
}

//----------------------------------------------------------------------
//
//  Export
//
//----------------------------------------------------------------------

const { setupI18n, useI18n, useI18nUtils } = I18nContainer
export { SupportI18nLocales, setupI18n, useI18n, useI18nUtils }
