import { payrollRules2026 } from '@/constants/payrollRules'
import type { TaxCategory } from '@/types/payroll'

export function shouldApplyEmploymentInsurance(weeklyWorkingHours: number): boolean {
  return weeklyWorkingHours >= payrollRules2026.employmentInsuranceWeeklyHoursThreshold
}

export function shouldApplyNursingCareInsurance(age: number): boolean {
  return (
    age >= payrollRules2026.nursingCareInsuranceMinAge &&
    age <= payrollRules2026.nursingCareInsuranceMaxAge
  )
}

export function calculateEmploymentInsurancePremium(
  grossWage: number,
  weeklyWorkingHours: number,
): number {
  if (!shouldApplyEmploymentInsurance(weeklyWorkingHours)) {
    return 0
  }

  return roundYen(grossWage * payrollRules2026.employmentInsuranceEmployeeRate)
}

export function calculateNursingCareInsurancePremium(
  standardMonthlyRemuneration: number,
  age: number,
): number {
  if (!shouldApplyNursingCareInsurance(age)) {
    return 0
  }

  return roundYen(standardMonthlyRemuneration * payrollRules2026.nursingCareInsuranceEmployeeRate)
}

export function estimateWithholdingIncomeTax(
  taxableSalaryAfterSocialInsurance: number,
  taxCategory: TaxCategory,
): number {
  const rate = taxCategory === 'otsu' ? 0.1021 : 0.03063
  return roundYen(taxableSalaryAfterSocialInsurance * rate)
}

export function roundYen(value: number): number {
  return Math.round(value)
}
