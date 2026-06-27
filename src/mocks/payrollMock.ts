import type {
  FullTimePayrollRow,
  MonthlySalaryDetailsRequest,
  PartTimePayrollRow,
  PayrollRow,
} from '@/types/payroll'
import { translatePayrollMessage } from '@/utils/columnLabels'

export const mockPartTimePayrollRows: PartTimePayrollRow[] = [
  {
    id: 'pt-001',
    period: '2026-04',
    teacherId: 'teacher-x001',
    employeeNo: 'X001',
    name: '山田 太郎',
    employmentType: 'partTime',
    taxCategory: 'kou',
    attendanceDays: 12,
    totalWorkingHours: 48,
    weeklyWorkingHours: 12,
    hourlyWage: 2500,
    baseSalary: 120000,
    nonTaxableCommutingAllowance: 8000,
    employmentInsurancePremium: 0,
    withholdingIncomeTax: 3200,
    netPay: 124800,
  },
  {
    id: 'pt-002',
    period: '2026-04',
    teacherId: 'teacher-x002',
    employeeNo: 'X002',
    name: '佐藤 花子',
    employmentType: 'partTime',
    taxCategory: 'otsu',
    attendanceDays: 18,
    totalWorkingHours: 88,
    weeklyWorkingHours: 22,
    hourlyWage: 2800,
    baseSalary: 246400,
    nonTaxableCommutingAllowance: 12000,
    employmentInsurancePremium: 1232,
    withholdingIncomeTax: 12500,
    netPay: 244668,
  },
]

export const mockFullTimePayrollRows: FullTimePayrollRow[] = [
  {
    id: 'ft-001',
    period: '2026-04',
    teacherId: 'teacher-f001',
    employeeNo: 'F001',
    name: '鈴木 一郎',
    employmentType: 'fullTime',
    age: 42,
    baseSalary: 320000,
    positionAllowance: 30000,
    housingAllowance: 20000,
    commutingAllowance: 15000,
    healthInsurancePremium: 17800,
    welfarePensionPremium: 32940,
    employmentInsurancePremium: 1925,
    nursingCareInsurancePremium: 3119,
    withholdingIncomeTax: 10400,
    residentTax: 18000,
    scheduledWorkingDays: 20,
    attendanceDays: 20,
    paidLeaveDaysUsed: 1,
    overtimeHours: 8,
    grossPay: 385000,
    totalDeductions: 84184,
    netPay: 300816,
  },
]

const allMockPayrollRows: PayrollRow[] = [...mockPartTimePayrollRows, ...mockFullTimePayrollRows]

function periodMatchesRow(period: string, year: string, month: string): boolean {
  const [rowYear, rowMonth] = period.split('-')
  return rowYear === year && String(Number(rowMonth)) === String(Number(month))
}

/** Mock 样例数据：可按 year / month / uid（社員番号）筛选 */
export function queryMockMonthlySalaryDetails(
  params: MonthlySalaryDetailsRequest,
): PayrollRow[] {
  let records = allMockPayrollRows.filter((row) =>
    periodMatchesRow(row.period, params.year, params.month),
  )

  if (params.uid) {
    records = records.filter((row) => row.employeeNo === params.uid)
  }

  if (params.employmentType) {
    records = records.filter((row) => row.employmentType === params.employmentType)
  }

  if (params.taxCategory) {
    records = records.filter(
      (row) => row.employmentType === 'partTime' && row.taxCategory === params.taxCategory,
    )
  }

  return records
}

export function getMockMonthlySalaryDetailsHint(): string {
  return translatePayrollMessage('mockHint')
}
