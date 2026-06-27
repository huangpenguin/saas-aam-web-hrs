/**
 * 給与明細（Payslip）多级表头 Schema
 *
 * 表头文案通过 i18n（columns 命名空间）渲染，此处只保留结构与 field 映射。
 */
import type { EmploymentType } from '@/types/payroll'
import type { PayrollColumnConfig } from '@/types/table'
import { translateColumnField, translateColumnGroup } from '@/utils/columnLabels'

/** 非常勤（パート・アルバイト）給与明細表头 */
export const partTimePayslipColumns: PayrollColumnConfig[] = [
  {
    id: 'pt-meta',
    groupKey: 'basicInfo',
    children: [
      { id: 'pt-employeeNo', field: 'employeeNo', width: 110, fixed: 'left' },
      { id: 'pt-name', field: 'name', width: 130, fixed: 'left' },
      { id: 'pt-period', field: 'period', width: 100 },
      { id: 'pt-taxCategory', field: 'taxCategory', width: 110 },
    ],
  },
  {
    id: 'pt-attendance',
    groupKey: 'attendance',
    children: [
      { id: 'pt-attendanceDays', field: 'attendanceDays', width: 100 },
      { id: 'pt-totalWorkingHours', field: 'totalWorkingHours', width: 110 },
      { id: 'pt-weeklyWorkingHours', field: 'weeklyWorkingHours', width: 130 },
      { id: 'pt-hourlyWage', field: 'hourlyWage', width: 90 },
    ],
  },
  {
    id: 'pt-payments',
    groupKey: 'payments',
    children: [
      { id: 'pt-baseSalary', field: 'baseSalary', width: 130, editable: true },
      {
        id: 'pt-nonTaxableCommuting',
        field: 'nonTaxableCommutingAllowance',
        width: 130,
        editable: true,
      },
      { id: 'pt-otherAllowance', field: 'otherAllowance', width: 110, editable: true },
      { id: 'pt-grossPay', field: 'grossPay', width: 110 },
    ],
  },
  {
    id: 'pt-deductions',
    groupKey: 'deductions',
    children: [
      { id: 'pt-employmentInsurance', field: 'employmentInsurancePremium', width: 120, editable: true },
      { id: 'pt-withholdingTax', field: 'withholdingIncomeTax', width: 120, editable: true },
      { id: 'pt-residentTax', field: 'residentTax', width: 100, editable: true },
      { id: 'pt-totalDeductions', field: 'totalDeductions', width: 110 },
    ],
  },
  {
    id: 'pt-summary',
    groupKey: 'summary',
    children: [
      { id: 'pt-netPay', field: 'netPay', width: 150, fixed: 'right' },
    ],
  },
]

/** 常勤（正社員・常勤講師）給与明細表头 */
export const fullTimePayslipColumns: PayrollColumnConfig[] = [
  {
    id: 'ft-meta',
    groupKey: 'basicInfo',
    children: [
      { id: 'ft-employeeNo', field: 'employeeNo', width: 110, fixed: 'left' },
      { id: 'ft-name', field: 'name', width: 130, fixed: 'left' },
      { id: 'ft-period', field: 'period', width: 100 },
      { id: 'ft-age', field: 'age', width: 70 },
      { id: 'ft-standardRemuneration', field: 'standardMonthlyRemuneration', width: 130 },
    ],
  },
  {
    id: 'ft-attendance',
    groupKey: 'attendance',
    children: [
      { id: 'ft-scheduledDays', field: 'scheduledWorkingDays', width: 110 },
      { id: 'ft-attendanceDays', field: 'attendanceDays', width: 100 },
      { id: 'ft-paidLeave', field: 'paidLeaveDaysUsed', width: 110 },
      { id: 'ft-overtimeHours', field: 'overtimeHours', width: 120 },
    ],
  },
  {
    id: 'ft-payments',
    groupKey: 'payments',
    children: [
      { id: 'ft-baseSalary', field: 'baseSalary', width: 110, editable: true },
      { id: 'ft-positionAllowance', field: 'positionAllowance', width: 110, editable: true },
      { id: 'ft-housingAllowance', field: 'housingAllowance', width: 110, editable: true },
      { id: 'ft-commutingAllowance', field: 'commutingAllowance', width: 110, editable: true },
      { id: 'ft-overtimePay', field: 'overtimePay', width: 110, editable: true },
      { id: 'ft-grossPay', field: 'grossPay', width: 110 },
    ],
  },
  {
    id: 'ft-socialInsurance',
    groupKey: 'socialInsurance',
    children: [
      { id: 'ft-healthInsurance', field: 'healthInsurancePremium', width: 120, editable: true },
      { id: 'ft-nursingCare', field: 'nursingCareInsurancePremium', width: 110, editable: true },
      { id: 'ft-welfarePension', field: 'welfarePensionPremium', width: 140, editable: true },
      { id: 'ft-employmentInsurance', field: 'employmentInsurancePremium', width: 120, editable: true },
      { id: 'ft-childCareSupport', field: 'childCareSupportPremium', width: 150, editable: true },
    ],
  },
  {
    id: 'ft-taxes',
    groupKey: 'taxes',
    children: [
      { id: 'ft-withholdingTax', field: 'withholdingIncomeTax', width: 120, editable: true },
      { id: 'ft-residentTax', field: 'residentTax', width: 100, editable: true },
    ],
  },
  {
    id: 'ft-agreedDeductions',
    groupKey: 'agreedDeductions',
    children: [
      { id: 'ft-unionFee', field: 'unionFee', width: 90, editable: true },
      { id: 'ft-dormitoryFee', field: 'dormitoryFee', width: 90, editable: true },
    ],
  },
  {
    id: 'ft-summary',
    groupKey: 'summary',
    children: [
      { id: 'ft-totalDeductions', field: 'totalDeductions', width: 110 },
      { id: 'ft-netPay', field: 'netPay', width: 150, fixed: 'right' },
    ],
  },
]

export const payrollPayslipColumnRegistry: Record<EmploymentType, PayrollColumnConfig[]> = {
  partTime: partTimePayslipColumns,
  fullTime: fullTimePayslipColumns,
}

export function getPayslipColumnsForEmploymentType(
  employmentType: EmploymentType,
): PayrollColumnConfig[] {
  return payrollPayslipColumnRegistry[employmentType]
}

export function resolvePayrollColumnTitle(column: PayrollColumnConfig): string {
  if (column.title) {
    return column.title
  }

  if (column.field) {
    return translateColumnField(String(column.field))
  }

  if (column.groupKey) {
    return translateColumnGroup(column.groupKey)
  }

  return column.id
}

export function resolvePayrollGroupTitle(column: PayrollColumnConfig): string {
  if (column.groupKey) {
    return translateColumnGroup(column.groupKey)
  }

  return column.title ?? column.id
}

/** 将多级表头 flatten 为 Preview 用扁平行（保留 group 信息供导出） */
export function flattenPayslipColumns(
  columns: PayrollColumnConfig[],
): { field: string; title: string; group: string; editable?: boolean }[] {
  const result: { field: string; title: string; group: string; editable?: boolean }[] = []

  columns.forEach((group) => {
    const groupTitle = resolvePayrollGroupTitle(group)

    group.children?.forEach((column) => {
      if (!column.field) {
        return
      }

      result.push({
        field: String(column.field),
        title: resolvePayrollColumnTitle(column),
        group: groupTitle,
        editable: column.editable,
      })
    })
  })

  return result
}

export function inferPrimaryEmploymentType(
  rows: { employmentType?: EmploymentType | string | null }[],
): EmploymentType | 'mixed' | null {
  const types = new Set(
    rows
      .map((row) => row.employmentType)
      .filter((value): value is EmploymentType => value === 'partTime' || value === 'fullTime'),
  )

  if (types.size === 0) {
    return null
  }

  if (types.size === 1) {
    return [...types][0]
  }

  return 'mixed'
}
