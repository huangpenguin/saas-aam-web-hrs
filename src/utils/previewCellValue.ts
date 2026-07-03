import { evaluatePayrollFormula } from '@/utils/formulaEvaluator'
import { translateEnumValue } from '@/utils/columnLabels'
import type { FormulaContext } from '@/types/payroll'
import type { PayrollColumnConfig, SalaryDetailColumn } from '@/types/table'

const layoutEditableFields = new Set(['baseSalary', 'bonus', 'tax'])
const formulaFallbackFields = [
  'baseSalary',
  'bonus',
  'tax',
  'grossPay',
  'otherAllowance',
  'nonTaxableCommutingAllowance',
  'positionAllowance',
  'housingAllowance',
  'commutingAllowance',
  'overtimePay',
  'employmentInsurancePremium',
  'withholdingIncomeTax',
  'residentTax',
  'totalDeductions',
  'netPay',
  'healthInsurancePremium',
  'nursingCareInsurancePremium',
  'welfarePensionPremium',
  'childCareSupportPremium',
  'unionFee',
  'dormitoryFee',
]

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
  formulaContext?: FormulaContext,
): Record<string, number> {
  const scope: Record<string, number> = {}

  formulaFallbackFields.forEach((field) => {
    scope[field] = 0
  })

  Object.entries(row).forEach(([field, value]) => {
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

  if (formulaContext) {
    scope.taxRate = formulaContext.taxRate
  }

  return scope
}

export function getPreviewCellValue(
  row: Record<string, string | number | null>,
  column: SalaryDetailColumn | PayrollColumnConfig,
  formulaContext?: FormulaContext,
): string | number | null {
  if (column.formula) {
    try {
      return evaluatePayrollFormula(column.formula, buildFormulaScope(row, formulaContext))
    } catch {
      return null
    }
  }

  if (!column.field) {
    return null
  }

  const value = row[String(column.field)]
  if (value === undefined) {
    return null
  }

  return value
}

export function formatPreviewCell(
  column: SalaryDetailColumn | PayrollColumnConfig,
  row: Record<string, string | number | null>,
  formulaContext?: FormulaContext,
): string {
  const value = getPreviewCellValue(row, column, formulaContext)

  if (column.formatter) {
    return column.formatter(value)
  }

  if (typeof value === 'string') {
    const enumLabel = translateEnumValue(String(column.field), value)
    if (enumLabel) {
      return enumLabel
    }
  }

  return value === null || value === undefined ? '-' : String(value)
}
