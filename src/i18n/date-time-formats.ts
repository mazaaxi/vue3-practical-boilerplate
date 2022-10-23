import type { IntlDateTimeFormat, IntlDateTimeFormats } from 'vue-i18n'
import merge from 'lodash/merge'

const en: IntlDateTimeFormat = {
  date: {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  },
  dateTime: {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
  dateSec: {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
  weekday: {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  },
}

const ja: IntlDateTimeFormat = {
  date: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  dateTime: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
  dateSec: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
  weekday: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  },
}

export const datetimeFormats: IntlDateTimeFormats = {
  en,
  'en-US': merge({}, en, {}),
  ja,
  'ja-JP': merge({}, ja, {}),
}
