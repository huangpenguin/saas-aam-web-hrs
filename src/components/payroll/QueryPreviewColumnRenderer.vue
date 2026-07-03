<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from 'i18next-vue'
import {
  resolvePayrollColumnTitle,
  resolvePayrollGroupTitle,
} from '@/constants/payrollPayslipSchemas'
import type { FormulaContext } from '@/types/payroll'
import type { PayrollColumnConfig } from '@/types/table'
import { formatPreviewCell } from '@/utils/previewCellValue'

defineOptions({
  name: 'QueryPreviewColumnRenderer',
})

const props = defineProps<{
  column: PayrollColumnConfig
  editable: boolean
  formulaContext: FormulaContext
}>()

const emit = defineEmits<{
  formulaContextChange: [key: keyof FormulaContext, value: number]
}>()

const { t } = useTranslation()

const groupTitle = computed(() => resolvePayrollGroupTitle(props.column))
const columnTitle = computed(() => resolvePayrollColumnTitle(props.column))
const fieldName = computed(() => (props.column.field ? String(props.column.field) : ''))
const cellEditable = computed(
  () =>
    props.editable &&
    Boolean(props.column.field) &&
    Boolean(props.column.editable) &&
    !props.column.formula,
)

function handleHeaderParamInput(event: Event): void {
  if (!props.column.headerParam) {
    return
  }

  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) {
    emit('formulaContextChange', props.column.headerParam, value)
  }
}

function handleFormulaContextChange(key: keyof FormulaContext, value: number): void {
  emit('formulaContextChange', key, value)
}
</script>

<template>
  <vxe-column
    v-if="props.column.children?.length"
    :title="groupTitle"
    :fixed="props.column.fixed"
  >
    <QueryPreviewColumnRenderer
      v-for="child in props.column.children"
      :key="child.id"
      :column="child"
      :editable="props.editable"
      :formula-context="props.formulaContext"
      @formula-context-change="handleFormulaContextChange"
    />
  </vxe-column>

  <vxe-column
    v-else
    :field="fieldName"
    :title="columnTitle"
    :width="props.column.width"
    :min-width="props.column.width ? undefined : 120"
    :fixed="props.column.fixed"
    :class-name="cellEditable ? 'cell--editable' : undefined"
    :edit-render="cellEditable ? { autofocus: '.cell-editor' } : undefined"
  >
    <template #header>
      <div class="column-header" :class="{ 'column-header--formula': props.column.formula }">
        <span>{{ columnTitle }}</span>
        <label v-if="props.column.headerParam" class="header-param">
          <span>{{ t('payroll:taxRate') }}</span>
          <input
            type="number"
            min="0"
            max="1"
            step="0.001"
            :value="props.formulaContext[props.column.headerParam]"
            @input.stop="handleHeaderParamInput"
            @click.stop
          />
        </label>
      </div>
    </template>

    <template #default="{ row }">
      <span
        :class="{
          'formula-cell': props.column.formula,
          'editable-cell': cellEditable,
        }"
      >
        {{ formatPreviewCell(props.column, row, props.formulaContext) }}
      </span>
    </template>

    <template v-if="cellEditable" #edit="{ row }">
      <input
        v-model="row[fieldName]"
        type="text"
        class="cell-editor"
        @click.stop
      />
    </template>
  </vxe-column>
</template>
