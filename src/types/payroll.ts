export type EmploymentType = 'partTime' | 'fullTime'
export type TaxCategory = 'kou' | 'otsu'
export type PayrollMode = 'overview' | 'layout'

export interface PayrollBaseRow {
  id: string
  period: string
  teacherId: string
  employeeNo: string
  name: string
  employmentType: EmploymentType
  customFields?: Record<string, string | number | null>
}

export interface PartTimePayrollRow extends PayrollBaseRow {
  employmentType: 'partTime'
  taxCategory: TaxCategory
  attendanceDays: number
  totalWorkingHours: number
  weeklyWorkingHours: number
  hourlyWage: number
  baseSalary: number
  otherAllowance?: number
  nonTaxableCommutingAllowance: number
  grossPay?: number
  employmentInsurancePremium: number
  withholdingIncomeTax: number
  residentTax?: number
  totalDeductions?: number
  netPay: number
}

export interface FullTimePayrollRow extends PayrollBaseRow {
  employmentType: 'fullTime'
  age: number
  standardMonthlyRemuneration?: number
  baseSalary: number
  positionAllowance: number
  housingAllowance: number
  commutingAllowance: number
  overtimePay?: number
  healthInsurancePremium: number
  welfarePensionPremium: number
  employmentInsurancePremium: number
  nursingCareInsurancePremium: number
  childCareSupportPremium?: number
  withholdingIncomeTax: number
  residentTax: number
  unionFee?: number
  dormitoryFee?: number
  scheduledWorkingDays: number
  attendanceDays: number
  paidLeaveDaysUsed: number
  overtimeHours: number
  grossPay: number
  totalDeductions: number
  netPay: number
}

export type PayrollRow = PartTimePayrollRow | FullTimePayrollRow

export interface MonthlySalaryDetailsRequest {
  uid?: string
  year: string
  month: string
  employmentType?: EmploymentType
  taxCategory?: TaxCategory
}

export type MonthlySalaryDetailsData = PayrollRow

export interface ApiResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
}
