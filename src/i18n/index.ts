import { I18n, Locale, useI18n as _useI18n, createI18n } from 'vue-i18n'
import { WritableComputedRef, nextTick } from 'vue'
import axios from 'axios'
import { datetimeFormats } from '@/i18n/date-time-formats'
import en from '@/i18n/locales/en'
import { numberFormats } from '@/i18n/number-formats'

//----------------------------------------------------------------------
//
//  Interfaces
//
//----------------------------------------------------------------------

const SupportI18nLocales = ['ja', 'ja-JP', 'en', 'en-US']

const DefaultI18nLocale = 'en'

interface I18nContainer {
  i18n: I18n
  loadI18nLocaleMessages(locale?: string): Promise<void>
}

//----------------------------------------------------------------------
//
//  Implementation
//
//----------------------------------------------------------------------

namespace I18nContainer {
  let instance: I18nContainer

  export function setupI18n(): I18n {
    instance = instance ?? newInstance()
    return instance.i18n
  }

  export function useI18n() {
    return _useI18n({ useScope: 'global' })
  }

  export function useI18nUtils(): Omit<I18nContainer, 'i18n'> {
    const { i18n, ...others } = instance
    return others
  }

  function newInstance(): I18nContainer {
    const i18n: I18n = createI18n({
      legacy: false,
      globalInjection: true,
      fallbackLocale: DefaultI18nLocale,
      locale: DefaultI18nLocale,
      messages: { en },
      datetimeFormats,
      numberFormats,
    })

    const loadI18nLocaleMessages: I18nContainer['loadI18nLocaleMessages'] = async locale => {
      locale = locale || getLocaleFromBrowser()

      if (!SupportI18nLocales.includes(locale)) {
        locale = DefaultI18nLocale
      }

      if (!i18n.global.availableLocales.includes(locale)) {
        // load locale messages with dynamic import
        const messages = await import(/* webpackChunkName: "locale-[request]" */ `@/i18n/locales/${locale}.js`)
        // set locale and locale message
        i18n.global.setLocaleMessage(locale, messages.default)
      }

      // set locale for i18n
      ;(i18n.global.locale as WritableComputedRef<string>).value = locale
      // set locale for HTTP request headers
      axios.defaults.headers.common['Accept-Language'] = locale

      return nextTick()
    }

    function getLocaleFromBrowser(): Locale {
      // get language + country from browser (ex. 'en', 'en-US', etc)
      return (
        (window.navigator.languages && window.navigator.languages[0]) ||
        window.navigator.language ||
        (window.navigator as any).userLanguage ||
        (window.navigator as any).browserLanguage
      )
    }

    return {
      i18n,
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
