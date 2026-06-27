import { evaluatePayrollFormula } from '@/utils/formulaEvaluator'
import { translateEnumValue } from '@/utils/columnLabels'
import type { SalaryDetailColumn } from '@/types/table'

const layoutEditableFields = new Set(['baseSalary', 'bonus', 'tax'])

export function isLayoutEditableColumn(column: SalaryDetailColumn): boolean {
  if (column.formula) {
    return false
  }

  if (column.editable) {
    return true
  }

  return layoutEditableFields.has(column.field)
}

export function buildFormulaScope(
  row: Record<string, string | number | null>,
): Record<string, number> {
  const scope: Record<string, number> = {}

  Object.entries(row).forEach(([field, value]) => {
    if (field.startsWith('custom_formula_')) {
      return
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      scope[field] = value
      return
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        scope[field] = parsed
      }
    }
  })

  return scope
}

export function getPreviewCellValue(
  row: Record<string, string | number | null>,
  column: SalaryDetailColumn,
): string | number | null {
  if (column.formula) {
    try {
      return evaluatePayrollFormula(column.formula, buildFormulaScope(row))
    } catch {
      return null
    }
  }

  const value = row[column.field]
  if (value === undefined) {
    return null
  }

  return value
}

export function formatPreviewCell(
  column: SalaryDetailColumn,
  row: Record<string, string | number | null>,
): string {
  const value = getPreviewCellValue(row, column)

  if (column.formatter) {
    return column.formatter(value)
  }

  if (typeof value === 'string') {
    const enumLabel = translateEnumValue(column.field, value)
    if (enumLabel) {
      return enumLabel
    }
  }

  return value === null || value === undefined ? '-' : String(value)
}
