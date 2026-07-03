import type { MonthlySalaryDetailsData } from '@/types/payroll'

export type PreviewRowValue = string | number | null
export type PreviewRow = Record<string, PreviewRowValue>

const fixedPayrollFields = new Set([
  'id',
  'period',
  'teacherId',
  'employeeNo',
  'name',
  'employmentType',
  'taxCategory',
  'attendanceDays',
  'totalWorkingHours',
  'weeklyWorkingHours',
  'hourlyWage',
  'baseSalary',
  'otherAllowance',
  'nonTaxableCommutingAllowance',
  'grossPay',
  'employmentInsurancePremium',
  'withholdingIncomeTax',
  'residentTax',
  'totalDeductions',
  'netPay',
  'age',
  'standardMonthlyRemuneration',
  'positionAllowance',
  'housingAllowance',
  'commutingAllowance',
  'overtimePay',
  'healthInsurancePremium',
  'welfarePensionPremium',
  'nursingCareInsurancePremium',
  'childCareSupportPremium',
  'scheduledWorkingDays',
  'paidLeaveDaysUsed',
  'overtimeHours',
  'unionFee',
  'dormitoryFee',
])

const internalPayloadFields = new Set(['customFields', 'dynamicData'])

export interface PayrollSubmitRowPayload {
  fixedPayload: PreviewRow
  dynamicData: PreviewRow
}

export function isFixedPayrollField(field: string): boolean {
  return fixedPayrollFields.has(field)
}

export function isDynamicPayrollField(field: string): boolean {
  return field.startsWith('custom_')
}

export function unflattenPayrollRowsFromApi(
  rows: MonthlySalaryDetailsData[],
): PreviewRow[] {
  return rows.map((row) => {
    const { customFields, dynamicData, ...fixedFields } = row

    return {
      ...fixedFields,
      ...(customFields ?? {}),
      ...(dynamicData ?? {}),
    }
  })
}

export function flattenPayrollRowsForSubmit(rows: PreviewRow[]): PayrollSubmitRowPayload[] {
  return rows.map((row) => {
    const fixedPayload: PreviewRow = {}
    const dynamicData: PreviewRow = {}

    Object.entries(row).forEach(([field, value]) => {
      if (internalPayloadFields.has(field)) {
        return
      }

      if (isFixedPayrollField(field)) {
        fixedPayload[field] = value
        return
      }

      if (isDynamicPayrollField(field)) {
        dynamicData[field] = value
      }
    })

    return {
      fixedPayload,
      dynamicData,
    }
  })
}

export function appendCustomColumnField(
  rows: PreviewRow[],
  field: string,
  initialValue: PreviewRowValue = '',
): PreviewRow[] {
  return rows.map((row) => ({
    ...row,
    [field]: row[field] ?? initialValue,
  }))
}
