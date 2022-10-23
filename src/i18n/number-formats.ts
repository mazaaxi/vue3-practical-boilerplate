import type { IntlNumberFormat, IntlNumberFormats } from 'vue-i18n'
import merge from 'lodash/merge'

const en: IntlNumberFormat = {
  currency: {
    style: 'currency',
    currency: 'USD',
    notation: 'standard',
  },
  decimal: {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  percent: {
    style: 'percent',
    useGrouping: false,
  },
}

const ja: IntlNumberFormat = {
  currency: {
    style: 'currency',
    currency: 'JPY',
    useGrouping: true,
    currencyDisplay: 'symbol',
  },
  decimal: {
    style: 'decimal',
    minimumSignificantDigits: 3,
    maximumSignificantDigits: 5,
  },
  percent: {
    style: 'percent',
    useGrouping: false,
  },
}

export const numberFormats: IntlNumberFormats = {
  en,
  'en-US': merge({}, en, {}),
  ja,
  'ja-JP': merge({}, ja, {}),
}
