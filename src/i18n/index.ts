import type { I18n, Locale } from 'vue-i18n'
import { createI18n, useI18n } from 'vue-i18n'
import type { WritableComputedRef } from 'vue'
import axios from 'axios'
import { datetimeFormats } from '@/i18n/date-time-formats'
import en from '@/i18n/locales/en'
import { nextTick } from 'vue'
import { numberFormats } from '@/i18n/number-formats'

//----------------------------------------------------------------------
//
//  Definition
//
//----------------------------------------------------------------------

interface AppI18n {
  i18n: I18n
  loadI18nLocaleMessages(locale?: string): Promise<void>
}

const SupportI18nLocales = ['ja', 'ja-JP', 'en', 'en-US']

type I18nComposer = ReturnType<typeof useI18n>

const DefaultI18nLocale = 'en'

//----------------------------------------------------------------------
//
//  Implementation
//
//----------------------------------------------------------------------

namespace AppI18n {
  let instance: AppI18n

  export function setup(): I18n {
    instance = newInstance()
    return instance.i18n
  }

  export function use(): I18nComposer {
    return instance.i18n.global as any
  }

  export function useUtils(): Omit<AppI18n, 'i18n'> {
    const { i18n, ...others } = instance
    return others
  }

  function newInstance(): AppI18n {
    const i18n: I18n = createI18n({
      legacy: false,
      globalInjection: true,
      fallbackLocale: DefaultI18nLocale,
      locale: DefaultI18nLocale,
      messages: { en },
      datetimeFormats,
      numberFormats,
    })

    const loadI18nLocaleMessages: AppI18n['loadI18nLocaleMessages'] = async locale => {
      locale = locale || getLocaleFromBrowser()

      if (!SupportI18nLocales.includes(locale)) {
        locale = DefaultI18nLocale
      }

      if (!i18n.global.availableLocales.includes(locale)) {
        // load locale messages with dynamic import
        const messages = await import(`@/i18n/locales/${locale}.ts`)
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

export { AppI18n, SupportI18nLocales }
