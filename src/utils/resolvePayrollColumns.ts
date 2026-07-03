import {
  flattenPayslipColumns,
  getPayslipColumnsForEmploymentType,
  inferPrimaryEmploymentType,
} from '@/constants/payrollPayslipSchemas'
import { formatCurrency } from '@/constants/payrollColumns'
import type { EmploymentType } from '@/types/payroll'
import type { PayrollColumnConfig, PayrollTableView, SalaryDetailColumn } from '@/types/table'
import {
  translateColumnField,
  translateColumnGroup,
  translateEnumValue,
} from '@/utils/columnLabels'

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

const formulaByField: Record<string, string> = {
  grossPay:
    'baseSalary + nonTaxableCommutingAllowance + otherAllowance + positionAllowance + housingAllowance + commutingAllowance + overtimePay',
  withholdingIncomeTax:
    '(baseSalary + nonTaxableCommutingAllowance + otherAllowance + positionAllowance + housingAllowance + commutingAllowance + overtimePay) * taxRate',
  totalDeductions:
    'employmentInsurancePremium + ((baseSalary + nonTaxableCommutingAllowance + otherAllowance + positionAllowance + housingAllowance + commutingAllowance + overtimePay) * taxRate) + residentTax + healthInsurancePremium + nursingCareInsurancePremium + welfarePensionPremium + childCareSupportPremium + unionFee + dormitoryFee',
  netPay:
    '(baseSalary + nonTaxableCommutingAllowance + otherAllowance + positionAllowance + housingAllowance + commutingAllowance + overtimePay) - (employmentInsurancePremium + ((baseSalary + nonTaxableCommutingAllowance + otherAllowance + positionAllowance + housingAllowance + commutingAllowance + overtimePay) * taxRate) + residentTax + healthInsurancePremium + nursingCareInsurancePremium + welfarePensionPremium + childCareSupportPremium + unionFee + dormitoryFee)',
}

const hiddenTableFields = new Set(['id', 'teacherId'])

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

export function resolvePayrollTableViews(
  rows: Record<string, string | number | null>[],
  customColumns: SalaryDetailColumn[] = [],
): PayrollTableView[] {
  if (rows.length === 0) {
    return [
      {
        id: 'empty',
        title: translateColumnGroup('basic'),
        employmentType: null,
        rows: [],
        columns: withCustomColumns([], customColumns),
        flatColumns: customColumns,
      },
    ]
  }

  const primaryType = inferPrimaryEmploymentType(rows)
  if (primaryType === 'partTime' || primaryType === 'fullTime') {
    return [buildEmploymentTableView(primaryType, rows, customColumns)]
  }

  if (primaryType === 'mixed') {
    return (['partTime', 'fullTime'] as const)
      .map((employmentType) =>
        buildEmploymentTableView(
          employmentType,
          rows.filter((row) => row.employmentType === employmentType),
          customColumns,
        ),
      )
      .filter((view) => view.rows.length > 0)
  }

  return [
    {
      id: 'mixed',
      title: translateColumnGroup('basic'),
      employmentType: null,
      rows,
      columns: withCustomColumns(buildMixedFallbackGroupedColumns(rows), customColumns),
      flatColumns: [
        ...buildMixedFallbackColumns(rows),
        ...customColumns,
      ],
    },
  ]
}

function buildEmploymentTableView(
  employmentType: EmploymentType,
  rows: Record<string, string | number | null>[],
  customColumns: SalaryDetailColumn[],
): PayrollTableView {
  const columns = withCustomColumns(
    clonePayrollColumns(getPayslipColumnsForEmploymentType(employmentType)),
    customColumns,
  )
  const flatColumns = flattenColumns(columns)

  return {
    id: employmentType,
    title: `${translateColumnField('employmentType')}: ${
      translateEnumValue('employmentType', employmentType) ?? employmentType
    }`,
    employmentType,
    rows,
    columns,
    flatColumns,
  }
}

function clonePayrollColumns(columns: PayrollColumnConfig[]): PayrollColumnConfig[] {
  return columns.map((column) => {
    const cloned: PayrollColumnConfig = {
      ...column,
      children: column.children ? clonePayrollColumns(column.children) : undefined,
    }

    if (cloned.field) {
      const field = String(cloned.field)
      cloned.formatter = currencyFields.has(field) ? formatCurrency : undefined
      cloned.formula = formulaByField[field]
      cloned.headerParam = field === 'withholdingIncomeTax' ? 'taxRate' : undefined
      if (cloned.formula) {
        cloned.editable = false
      }
    }

    return cloned
  })
}

function withCustomColumns(
  columns: PayrollColumnConfig[],
  customColumns: SalaryDetailColumn[],
): PayrollColumnConfig[] {
  if (customColumns.length === 0) {
    return columns
  }

  return [
    ...columns,
    {
      id: 'custom-fields',
      groupKey: 'customFields',
      children: customColumns.map((column) => ({
        id: column.field,
        field: column.field as PayrollColumnConfig['field'],
        title: column.title,
        width: 130,
        editable: !column.formula,
        formula: column.formula,
        formatter: column.formatter,
        custom: true,
      })),
    },
  ]
}

function flattenColumns(columns: PayrollColumnConfig[]): SalaryDetailColumn[] {
  const result: SalaryDetailColumn[] = []

  columns.forEach((column) => {
    if (column.children?.length) {
      result.push(...flattenColumns(column.children))
      return
    }

    if (!column.field || hiddenTableFields.has(String(column.field))) {
      return
    }

    result.push({
      field: String(column.field),
      title: column.title ?? translateColumnField(String(column.field)),
      editable: column.editable,
      formatter: column.formatter,
      formula: column.formula,
    })
  })

  return result
}

function buildMixedFallbackGroupedColumns(
  rows: Record<string, string | number | null>[],
): PayrollColumnConfig[] {
  return [
    {
      id: 'mixed-basic',
      groupKey: 'basic',
      children: buildMixedFallbackColumns(rows).map((column) => ({
        id: column.field,
        field: column.field as PayrollColumnConfig['field'],
        title: column.title,
        editable: column.editable,
        formatter: column.formatter,
      })),
    },
  ]
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
