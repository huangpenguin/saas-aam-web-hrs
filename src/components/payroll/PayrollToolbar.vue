<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import type { PayrollMode } from '@/types/payroll'
import type { PayrollExportFormat } from '@/utils/payrollExport'

const props = defineProps<{
  mode: PayrollMode
  canEditLayout: boolean
  canAddColumn: boolean
  canExport: boolean
  exporting: boolean
}>()

const emit = defineEmits<{
  modeChange: [mode: PayrollMode]
  addRemarkColumn: []
  openFormulaDialog: []
  export: [format: PayrollExportFormat]
}>()

const { t } = useTranslation()

const exportMenuOpen = ref(false)
const exportMenuRef = ref<HTMLElement | null>(null)

function toggleExportMenu(): void {
  if (!props.canExport || props.exporting) {
    return
  }

  exportMenuOpen.value = !exportMenuOpen.value
}

function handleExport(format: PayrollExportFormat): void {
  exportMenuOpen.value = false
  emit('export', format)
}

function handleDocumentClick(event: MouseEvent): void {
  if (!exportMenuRef.value?.contains(event.target as Node)) {
    exportMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div class="payroll-toolbar">
    <div class="mode-group" :aria-label="t('payroll:displayModeAria')">
      <button
        type="button"
        :class="{ active: props.mode === 'overview' }"
        @click="emit('modeChange', 'overview')"
      >
        {{ t('payroll:modeOverview') }}
      </button>
      <button
        v-if="props.canEditLayout"
        type="button"
        :class="{ active: props.mode === 'layout' }"
        @click="emit('modeChange', 'layout')"
      >
        {{ t('payroll:modeLayout') }}
      </button>
    </div>

    <div class="action-group">
      <button v-if="props.canAddColumn" type="button" @click="emit('addRemarkColumn')">
        {{ t('payroll:addRemarkColumn') }}
      </button>
      <button v-if="props.canAddColumn" type="button" @click="emit('openFormulaDialog')">
        {{ t('payroll:addFormulaColumn') }}
      </button>

      <div v-if="props.canExport" ref="exportMenuRef" class="export-menu">
        <button
          type="button"
          class="export-trigger"
          :disabled="props.exporting"
          @click.stop="toggleExportMenu"
        >
          {{ props.exporting ? t('common:exporting') : t('common:export') }}
          <span aria-hidden="true">▾</span>
        </button>

        <div v-if="exportMenuOpen" class="export-menu__panel" role="menu">
          <button type="button" role="menuitem" @click="handleExport('excel')">
            {{ t('common:exportExcel') }}
          </button>
          <button type="button" role="menuitem" @click="handleExport('pdf')">
            {{ t('common:exportPdf') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payroll-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.mode-group,
.action-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

button {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-h);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font: inherit;
}

button:hover,
button.active {
  border-color: var(--accent);
  color: var(--accent);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.export-menu {
  position: relative;
}

.export-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 92px;
  justify-content: center;
}

.export-menu__panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 148px;
  display: grid;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow);
  z-index: 10;
}

.export-menu__panel button {
  width: 100%;
  text-align: left;
}
</style>
