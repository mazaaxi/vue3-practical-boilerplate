import { I18n, I18nOptions, Locale, createI18n } from 'vue-i18n'
import { WritableComputedRef, nextTick } from 'vue'
import axios from 'axios'
import { datetimeFormats } from '@/i18n/date-time-formats'

//----------------------------------------------------------------------
//
//  Interfaces
//
//----------------------------------------------------------------------

const SupportLocales = ['en', 'en-US', 'ja', 'ja-JP']

//----------------------------------------------------------------------
//
//  Implementation
//
//----------------------------------------------------------------------

function setupI18n(options: I18nOptions & { locale: Locale }) {
  const { locale, ..._options } = options
  const i18n = createI18n({ ..._options, datetimeFormats })
  setI18nLanguage(i18n, locale || 'en')
  return i18n
}

function setI18nLanguage(i18n: I18n, locale: string) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    ;(i18n.global.locale as WritableComputedRef<string>).value = locale
  }
  axios.defaults.headers.common['Accept-Language'] = locale
}

async function loadLocaleMessages(i18n: I18n, locale: string) {
  // load locale messages with dynamic import
  const messages = await import(/* webpackChunkName: "locale-[request]" */ `@/i18n/locales/${locale}.js`)

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default)

  return nextTick()
}

//----------------------------------------------------------------------
//
//  Export
//
//----------------------------------------------------------------------

export { SupportLocales, setupI18n, setI18nLanguage, loadLocaleMessages }
