import { formatCurrency } from '@/constants/payrollColumns'
import type { MonthlySalaryDetailsData } from '@/types/payroll'
import type { SalaryDetailColumn } from '@/types/table'
import { translateColumnField } from '@/utils/columnLabels'

const preferredColumnOrder = ['employeeNo', 'name', 'period', 'employmentType']

/** 不在 Preview 表格中展示的内部字段 */
const hiddenPreviewFields = new Set(['id', 'teacherId'])

const currencyFields = new Set([
  'baseSalary',
  'bonus',
  'tax',
  'hourlyWage',
  'nonTaxableCommutingAllowance',
  'otherAllowance',
  'grossPay',
  'employmentInsurancePremium',
  'withholdingIncomeTax',
  'residentTax',
  'totalDeductions',
  'netPay',
  'positionAllowance',
  'housingAllowance',
  'commutingAllowance',
  'overtimePay',
  'healthInsurancePremium',
  'nursingCareInsurancePremium',
  'welfarePensionPremium',
  'childCareSupportPremium',
  'unionFee',
  'dormitoryFee',
  'standardMonthlyRemuneration',
])

export function getDefaultSalaryDetailColumns(): SalaryDetailColumn[] {
  return ['baseSalary', 'bonus', 'tax'].map((field) => ({
    field,
    title: translateColumnField(field),
    formatter: formatCurrency,
    editable: true,
  }))
}

export function buildQueryPreviewColumnsFromRows(
  rows: Record<string, string | number | null>[],
): SalaryDetailColumn[] {
  if (rows.length === 0) {
    return getDefaultSalaryDetailColumns()
  }

  const fieldSet = new Set<string>()
  rows.forEach((row) => {
    Object.keys(row).forEach((field) => {
      if (!hiddenPreviewFields.has(field)) {
        fieldSet.add(field)
      }
    })
  })

  return [...fieldSet]
    .sort((left, right) => {
      const leftIndex = preferredColumnOrder.indexOf(left)
      const rightIndex = preferredColumnOrder.indexOf(right)
      if (leftIndex === -1 && rightIndex === -1) {
        return left.localeCompare(right)
      }
      if (leftIndex === -1) {
        return 1
      }
      if (rightIndex === -1) {
        return -1
      }
      return leftIndex - rightIndex
    })
    .map<SalaryDetailColumn>((field) => ({
      field,
      title: translateColumnField(field),
      formatter: currencyFields.has(field) ? formatCurrency : undefined,
      editable: currencyFields.has(field),
    }))
}

export function normalizeQueryPreviewRows(
  rows: MonthlySalaryDetailsData[],
): Record<string, string | number | null>[] {
  return rows.map((row) => {
    const { customFields, ...rest } = row
    return {
      ...rest,
      ...(customFields ?? {}),
    }
  })
}

export function appendCustomColumnField(
  rows: Record<string, string | number | null>[],
  field: string,
  initialValue: string | number | null = '',
): Record<string, string | number | null>[] {
  return rows.map((row) => ({
    ...row,
    [field]: row[field] ?? initialValue,
  }))
}
