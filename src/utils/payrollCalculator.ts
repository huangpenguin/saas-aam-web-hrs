import type { FullTimePayrollRow, PartTimePayrollRow } from '@/types/payroll'
import {
  calculateEmploymentInsurancePremium,
  calculateNursingCareInsurancePremium,
  estimateWithholdingIncomeTax,
  roundYen,
} from './taxCalculator'

export function calculatePartTimePayroll(
  row: Omit<
    PartTimePayrollRow,
    'baseSalary' | 'employmentInsurancePremium' | 'withholdingIncomeTax' | 'netPay'
  >,
): PartTimePayrollRow {
  const baseSalary = roundYen(row.hourlyWage * row.totalWorkingHours)
  const employmentInsurancePremium = calculateEmploymentInsurancePremium(
    baseSalary,
    row.weeklyWorkingHours,
  )
  const taxableSalary = baseSalary - employmentInsurancePremium
  const withholdingIncomeTax = estimateWithholdingIncomeTax(taxableSalary, row.taxCategory)
  const netPay =
    baseSalary + row.nonTaxableCommutingAllowance - employmentInsurancePremium - withholdingIncomeTax

  return {
    ...row,
    baseSalary,
    employmentInsurancePremium,
    withholdingIncomeTax,
    netPay: roundYen(netPay),
  }
}

export function calculateFullTimeSummary(row: FullTimePayrollRow): FullTimePayrollRow {
  const grossPay =
    row.baseSalary + row.positionAllowance + row.housingAllowance + row.commutingAllowance
  const nursingCareInsurancePremium = calculateNursingCareInsurancePremium(grossPay, row.age)
  const totalDeductions =
    row.healthInsurancePremium +
    row.welfarePensionPremium +
    row.employmentInsurancePremium +
    nursingCareInsurancePremium +
    row.withholdingIncomeTax +
    row.residentTax

  return {
    ...row,
    nursingCareInsurancePremium,
    grossPay: roundYen(grossPay),
    totalDeductions: roundYen(totalDeductions),
    netPay: roundYen(grossPay - totalDeductions),
  }
}
