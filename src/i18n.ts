import i18next from 'i18next'
import I18NextVue from 'i18next-vue'
import zhCommon from '@/locales/zh-CN/common.json'
import zhPayroll from '@/locales/zh-CN/payroll.json'
import zhColumns from '@/locales/zh-CN/columns.json'
import jaCommon from '@/locales/ja-JP/common.json'
import jaPayroll from '@/locales/ja-JP/payroll.json'
import jaColumns from '@/locales/ja-JP/columns.json'

const LOCALE_STORAGE_KEY = 'locale'

function readSavedLocale(): string {
  if (typeof window === 'undefined') {
    return 'zh-CN'
  }

  return localStorage.getItem(LOCALE_STORAGE_KEY) ?? 'zh-CN'
}

i18next.init({
  lng: readSavedLocale(),
  fallbackLng: 'zh-CN',
  debug: false,
  ns: ['common', 'payroll', 'columns'],
  defaultNS: 'common',
  resources: {
    'zh-CN': {
      common: zhCommon,
      payroll: zhPayroll,
      columns: zhColumns,
    },
    'ja-JP': {
      common: jaCommon,
      payroll: jaPayroll,
      columns: jaColumns,
    },
  },
})

export async function changeAppLocale(locale: string): Promise<void> {
  await i18next.changeLanguage(locale)
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }
}

export default i18next
export { I18NextVue, LOCALE_STORAGE_KEY }
