<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { useTranslation } from 'i18next-vue'

const { locale, setLocale } = useLocale()
const { t } = useTranslation()

async function handleChange(event: Event): Promise<void> {
  const nextLocale = (event.target as HTMLSelectElement).value
  await setLocale(nextLocale)
}
</script>

<template>
  <label class="locale-switcher">
    <span>{{ t('common:language') }}</span>
    <select :value="locale" @change="handleChange">
      <option value="zh-CN">{{ t('common:localeZhCN') }}</option>
      <option value="ja-JP">{{ t('common:localeJaJP') }}</option>
    </select>
  </label>
</template>

<style scoped>
.locale-switcher {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text);
}

select {
  min-height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-h);
  padding: 0 8px;
  font: inherit;
}
</style>
