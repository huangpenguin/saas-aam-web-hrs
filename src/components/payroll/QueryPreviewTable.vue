<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  resolvePayrollColumnTitle,
  resolvePayrollGroupTitle,
} from '@/constants/payrollPayslipSchemas'
import type { FormulaContext, PayrollMode } from '@/types/payroll'
import type { PayrollColumnConfig } from '@/types/table'
import { formatPreviewCell } from '@/utils/previewCellValue'

const props = defineProps<{
  rows: Record<string, string | number | null>[]
  columns: PayrollColumnConfig[]
  tableHeight: number | string
  mode: PayrollMode
  editable: boolean
  formulaContext: FormulaContext
  emptyText: string
}>()

const emit = defineEmits<{
  cellChange: [
    row: Record<string, string | number | null>,
    field: string,
    value: string | number | null,
  ]
  formulaContextChange: [key: keyof FormulaContext, value: number]
}>()

interface EditingCell {
  rowKey: string
  field: string
}

const editingCell = ref<EditingCell | null>(null)
const editingValue = ref('')

const topHeaders = computed(() =>
  props.columns.map((column) => ({
    id: column.id,
    title: resolvePayrollGroupTitle(column),
    colspan: countLeafColumns(column),
    rowspan: column.children?.length ? 1 : 2,
  })),
)

const leafColumns = computed(() => flattenLeafColumns(props.columns))
const isLayoutEditable = computed(() => props.mode === 'layout' && props.editable)

function countLeafColumns(column: PayrollColumnConfig): number {
  if (!column.children?.length) {
    return 1
  }

  return column.children.reduce((count, child) => count + countLeafColumns(child), 0)
}

function flattenLeafColumns(columns: PayrollColumnConfig[]): PayrollColumnConfig[] {
  const result: PayrollColumnConfig[] = []

  columns.forEach((column) => {
    if (column.children?.length) {
      result.push(...flattenLeafColumns(column.children))
      return
    }

    result.push(column)
  })

  return result
}

function resolveRowKey(row: Record<string, string | number | null>, rowIndex: number): string {
  const id = row.id
  return id === null || id === undefined ? `row-${rowIndex}` : String(id)
}

function canEditColumn(column: PayrollColumnConfig): boolean {
  return Boolean(isLayoutEditable.value && column.field && column.editable && !column.formula)
}

function startEdit(
  row: Record<string, string | number | null>,
  rowIndex: number,
  column: PayrollColumnConfig,
): void {
  if (!column.field || !canEditColumn(column)) {
    return
  }

  const field = String(column.field)
  editingCell.value = {
    rowKey: resolveRowKey(row, rowIndex),
    field,
  }
  editingValue.value = row[field] === null || row[field] === undefined ? '' : String(row[field])
}

function isEditingCell(
  row: Record<string, string | number | null>,
  rowIndex: number,
  column: PayrollColumnConfig,
): boolean {
  if (!editingCell.value || !column.field) {
    return false
  }

  return (
    editingCell.value.rowKey === resolveRowKey(row, rowIndex) &&
    editingCell.value.field === String(column.field)
  )
}

function commitEdit(
  row: Record<string, string | number | null>,
  column: PayrollColumnConfig,
): void {
  if (!column.field) {
    editingCell.value = null
    editingValue.value = ''
    return
  }

  const nextValue = editingValue.value.trim() === '' ? '' : editingValue.value
  emit('cellChange', row, String(column.field), nextValue)
  editingCell.value = null
  editingValue.value = ''
}

function cancelEdit(): void {
  editingCell.value = null
  editingValue.value = ''
}

function handleHeaderParamInput(key: keyof FormulaContext, event: Event): void {
  const nextValue = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(nextValue)) {
    return
  }

  emit('formulaContextChange', key, nextValue)
}

function resolveWidthStyle(column: PayrollColumnConfig): string | undefined {
  return column.width ? `${column.width}px` : undefined
}

function formatCell(row: Record<string, string | number | null>, column: PayrollColumnConfig): string {
  return formatPreviewCell(column, row, props.formulaContext)
}

function resolveColumnTitle(column: PayrollColumnConfig): string {
  return resolvePayrollColumnTitle(column)
}
</script>

<template>
  <div class="query-preview-table" :style="{ height: typeof props.tableHeight === 'number' ? `${props.tableHeight}px` : props.tableHeight }">
    <div v-if="props.rows.length === 0" class="query-preview-table__empty">
      {{ props.emptyText }}
    </div>

    <div v-else class="query-preview-table__scroll">
      <table class="query-preview-table__table">
        <colgroup>
          <col
            v-for="column in leafColumns"
            :key="column.id"
            :style="{ width: resolveWidthStyle(column), minWidth: resolveWidthStyle(column) ?? '120px' }"
          />
        </colgroup>

        <thead>
          <tr>
            <th
              v-for="header in topHeaders"
              :key="header.id"
              :colspan="header.colspan"
              :rowspan="header.rowspan"
              class="group-header"
            >
              {{ header.title }}
            </th>
          </tr>
          <tr>
            <th
              v-for="column in leafColumns.filter((item) => item.field)"
              :key="column.id"
              class="leaf-header"
            >
              <div class="column-header" :class="{ 'column-header--formula': column.formula }">
                <span>{{ resolveColumnTitle(column) }}</span>
                <label v-if="column.headerParam" class="header-param">
                  <span>Tax</span>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.001"
                    :value="props.formulaContext[column.headerParam]"
                    @input="handleHeaderParamInput(column.headerParam, $event)"
                  />
                </label>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, rowIndex) in props.rows" :key="resolveRowKey(row, rowIndex)">
            <td
              v-for="column in leafColumns"
              :key="column.id"
              :class="{
                'cell--editable': canEditColumn(column),
                'cell--formula': column.formula,
              }"
              @dblclick="startEdit(row, rowIndex, column)"
            >
              <input
                v-if="isEditingCell(row, rowIndex, column)"
                v-model="editingValue"
                class="cell-editor"
                type="text"
                @blur="commitEdit(row, column)"
                @keydown.enter.prevent="commitEdit(row, column)"
                @keydown.esc.prevent="cancelEdit"
              />
              <span v-else>{{ formatCell(row, column) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.query-preview-table {
  min-height: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  overflow: hidden;
}

.query-preview-table__scroll {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.query-preview-table__empty {
  display: grid;
  place-items: center;
  height: 100%;
  min-height: 160px;
  color: var(--text);
  font-size: 13px;
}

.query-preview-table__table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  border: 1px solid var(--border);
  padding: 8px 10px;
  font-size: 12px;
  color: var(--text-h);
  background: var(--surface);
  text-align: left;
  white-space: nowrap;
}

thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.group-header {
  background: #f8fafc;
  font-weight: 700;
}

.leaf-header {
  background: #fcfcfd;
  vertical-align: top;
}

.column-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.column-header--formula {
  color: #0f766e;
}

.header-param {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 400;
}

.header-param input,
.cell-editor {
  width: 72px;
  min-height: 26px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 6px;
  font: inherit;
  color: var(--text-h);
  background: #fff;
}

.cell-editor {
  width: 100%;
  min-width: 96px;
}

.cell--editable {
  cursor: cell;
  background: #fffbeb;
}

.cell--formula {
  color: #0f766e;
  font-weight: 600;
}
</style>
