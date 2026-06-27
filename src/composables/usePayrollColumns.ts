import { computed, ref } from 'vue'
import { fullTimeColumns } from '@/constants/payrollColumns'
import { translatePayrollMessage } from '@/utils/columnLabels'
import type { PayrollColumnConfig } from '@/types/table'

export function usePayrollColumns() {
  const columns = ref<PayrollColumnConfig[]>(cloneColumns(fullTimeColumns))

  const visibleColumns = computed(() => filterVisibleColumns(columns.value))

  function addRemarkColumn(): void {
    const suffix = Date.now().toString(36)
    const remarkTitle = translatePayrollMessage('remarkColumn')
    columns.value.push({
      id: `remark-${suffix}`,
      title: remarkTitle,
      children: [
        {
          id: `remark-value-${suffix}`,
          field: `customFields.remark_${suffix}`,
          title: remarkTitle,
          width: 180,
          editable: true,
        },
      ],
    })
  }

  function addFormulaColumn(title: string, formula: string): `customFields.${string}` {
    const suffix = Date.now().toString(36)
    const field = `customFields.formula_${suffix}` as const
    columns.value.push({
      id: `formula-${suffix}`,
      title,
      children: [
        {
          id: `formula-value-${suffix}`,
          field,
          title,
          width: 160,
          formula,
        },
      ],
    })
    return field
  }

  return {
    columns,
    visibleColumns,
    addRemarkColumn,
    addFormulaColumn,
  }
}

function cloneColumns(columns: PayrollColumnConfig[]): PayrollColumnConfig[] {
  return columns.map((column) => ({
    ...column,
    children: column.children ? cloneColumns(column.children) : undefined,
  }))
}

function filterVisibleColumns(columns: PayrollColumnConfig[]): PayrollColumnConfig[] {
  return columns
    .filter((column) => column.visible !== false)
    .map((column) => ({
      ...column,
      children: column.children ? filterVisibleColumns(column.children) : undefined,
    }))
}
