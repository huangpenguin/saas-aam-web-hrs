import { onMounted, onUnmounted, ref } from 'vue'
import i18next, { changeAppLocale } from '@/i18n'

export function useLocale() {
  const locale = ref(i18next.language)
  const localeVersion = ref(0)

  function handleLanguageChanged(nextLocale: string): void {
    locale.value = nextLocale
    localeVersion.value += 1
  }

  onMounted(() => {
    i18next.on('languageChanged', handleLanguageChanged)
  })

  onUnmounted(() => {
    i18next.off('languageChanged', handleLanguageChanged)
  })

  async function setLocale(nextLocale: string): Promise<void> {
    if (nextLocale === locale.value) {
      return
    }

    await changeAppLocale(nextLocale)
  }

  return {
    locale,
    localeVersion,
    setLocale,
  }
}
