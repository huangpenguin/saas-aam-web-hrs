<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from 'i18next-vue'
import { useLocale } from '@/composables/useLocale'
import type { PayrollMode } from '@/types/payroll'
import type { SalaryDetailColumn } from '@/types/table'
import {
  formatPreviewCell,
  isLayoutEditableColumn,
} from '@/utils/previewCellValue'
import { resolvePreviewColumnTitle } from '@/utils/columnLabels'

const props = defineProps<{
  rows: Record<string, string | number | null>[]
  columns: SalaryDetailColumn[]
  tableHeight: number
  mode: PayrollMode
  editable: boolean
}>()

const emit = defineEmits<{
  cellChange: [rowIndex: number, field: string, value: string | number | null]
  editFormulaColumn: [column: SalaryDetailColumn]
}>()

const { t } = useTranslation()
const { localeVersion } = useLocale()

const isLayoutMode = computed(() => props.mode === 'layout' && props.editable)

const localizedColumns = computed(() => {
  localeVersion.value

  return props.columns.map((column) => ({
    ...column,
    title: resolvePreviewColumnTitle(column),
  }))
})

const tableKey = computed(
  () =>
    `${props.mode}-${localeVersion.value}-${localizedColumns.value.map((column) => `${column.field}:${column.title}`).join(',')}`,
)

function columnEditable(column: SalaryDetailColumn): boolean {
  return isLayoutMode.value && isLayoutEditableColumn(column)
}

function handleEditClosed(params: {
  row: Record<string, string | number | null>
  rowIndex: number
  column: { field?: string }
}): void {
  const field = params.column.field
  if (!field) {
    return
  }

  emit('cellChange', params.rowIndex, field, params.row[field] ?? null)
}

function handleHeaderClick(column: SalaryDetailColumn): void {
  if (!isLayoutMode.value || !column.formula) {
    return
  }

  emit('editFormulaColumn', column)
}
</script>

<template>
  <div class="query-preview-table">
    <vxe-table
      :key="tableKey"
      border
      show-overflow
      show-header-overflow
      :height="props.tableHeight"
      :data="props.rows"
      :scroll-x="{ enabled: true, gt: 6 }"
      :edit-config="
        isLayoutMode
          ? { trigger: 'click', mode: 'cell', showStatus: true, autoClear: false }
          : undefined
      "
      @edit-closed="handleEditClosed"
    >
      <vxe-column
        v-for="column in localizedColumns"
        :key="column.field"
        :field="column.field"
        :title="column.title"
        :min-width="120"
        :class-name="columnEditable(column) ? 'cell--editable' : undefined"
        :edit-render="columnEditable(column) ? { autofocus: '.cell-editor' } : undefined"
      >
        <template #header>
          <button
            type="button"
            class="column-header"
            :class="{ 'column-header--formula': column.formula && isLayoutMode }"
            :disabled="!column.formula || !isLayoutMode"
            @click="handleHeaderClick(column)"
          >
            <span>{{ column.title }}</span>
            <small v-if="column.formula && isLayoutMode">{{ t('payroll:clickEditFormula') }}</small>
          </button>
        </template>

        <template #default="{ row }">
          <span
            :class="{
              'formula-cell': column.formula,
              'editable-cell': columnEditable(column),
            }"
          >
            {{ formatPreviewCell(column, row) }}
          </span>
        </template>

        <template v-if="columnEditable(column)" #edit="{ row }">
          <input
            v-model="row[column.field]"
            type="text"
            class="cell-editor"
            @click.stop
          />
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<style scoped>
.query-preview-table {
  height: 100%;
  min-height: 0;
}

:deep(.cell--editable) {
  cursor: cell;
  background: #fffbeb;
}

.column-header {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: default;
}

.column-header--formula {
  cursor: pointer;
  color: var(--accent);
}

.column-header--formula:hover {
  text-decoration: underline;
}

.column-header small {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.8;
}

.editable-cell {
  display: block;
  min-height: 20px;
}

.formula-cell {
  color: #0f766e;
  font-weight: 600;
}

.cell-editor {
  width: 100%;
  min-height: 28px;
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 0 8px;
  font: inherit;
  color: var(--text-h);
  background: #fff;
  box-sizing: border-box;
}
</style>
