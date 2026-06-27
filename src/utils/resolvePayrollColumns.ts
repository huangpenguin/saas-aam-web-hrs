import {
  flattenPayslipColumns,
  getPayslipColumnsForEmploymentType,
  inferPrimaryEmploymentType,
} from '@/constants/payrollPayslipSchemas'
import { formatCurrency } from '@/constants/payrollColumns'
import type { EmploymentType } from '@/types/payroll'
import type { PayrollColumnConfig, SalaryDetailColumn } from '@/types/table'
import { translateColumnField } from '@/utils/columnLabels'

export interface ResolvedPayrollTableView {
  employmentType: EmploymentType | 'mixed' | null
  groupedColumns: PayrollColumnConfig[]
  flatColumns: SalaryDetailColumn[]
}

const currencyFields = new Set([
  'baseSalary',
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

export function resolvePayrollTableView(
  rows: Record<string, string | number | null>[],
): ResolvedPayrollTableView {
  const employmentType = inferPrimaryEmploymentType(rows)

  if (employmentType === 'mixed' || employmentType === null) {
    return {
      employmentType,
      groupedColumns: [],
      flatColumns: buildMixedFallbackColumns(rows),
    }
  }

  const groupedColumns = getPayslipColumnsForEmploymentType(employmentType)
  const flatColumns = flattenPayslipColumns(groupedColumns).map<SalaryDetailColumn>((column) => ({
    field: column.field,
    title: `${column.group} / ${column.title}`,
    editable: column.editable,
    formatter: currencyFields.has(column.field) ? formatCurrency : undefined,
  }))

  return {
    employmentType,
    groupedColumns,
    flatColumns,
  }
}

function buildMixedFallbackColumns(
  rows: Record<string, string | number | null>[],
): SalaryDetailColumn[] {
  const fieldSet = new Set<string>()
  rows.forEach((row) => {
    Object.keys(row).forEach((field) => fieldSet.add(field))
  })

  return [...fieldSet].map((field) => ({
    field,
    title: translateColumnField(field),
    formatter: currencyFields.has(field) ? formatCurrency : undefined,
  }))
}
