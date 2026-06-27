import { describe, expect, it } from 'vitest'
import type { FullTimePayrollRow } from '@/types/payroll'
import { calculateFullTimeSummary, calculatePartTimePayroll } from '@/utils/payrollCalculator'

describe('payrollCalculator', () => {
  it('calculates part-time payroll from hours and hourly wage', () => {
    const result = calculatePartTimePayroll({
      id: 'pt-test',
      period: '2026-04',
      teacherId: 'teacher-test',
      employeeNo: 'X999',
      name: 'Test Teacher',
      employmentType: 'partTime',
      taxCategory: 'kou',
      attendanceDays: 10,
      totalWorkingHours: 40,
      weeklyWorkingHours: 10,
      hourlyWage: 2500,
      nonTaxableCommutingAllowance: 5000,
    })

    expect(result.baseSalary).toBe(100000)
    expect(result.employmentInsurancePremium).toBe(0)
    expect(result.netPay).toBeLessThan(105000)
  })

  it('calculates full-time payroll summary', () => {
    const row: FullTimePayrollRow = {
      id: 'ft-test',
      period: '2026-04',
      teacherId: 'teacher-ft',
      employeeNo: 'F999',
      name: 'Full Timer',
      employmentType: 'fullTime',
      age: 42,
      baseSalary: 300000,
      positionAllowance: 20000,
      housingAllowance: 10000,
      commutingAllowance: 10000,
      healthInsurancePremium: 15000,
      welfarePensionPremium: 30000,
      employmentInsurancePremium: 1700,
      nursingCareInsurancePremium: 0,
      withholdingIncomeTax: 9000,
      residentTax: 12000,
      scheduledWorkingDays: 20,
      attendanceDays: 20,
      paidLeaveDaysUsed: 0,
      overtimeHours: 4,
      grossPay: 0,
      totalDeductions: 0,
      netPay: 0,
    }

    const result = calculateFullTimeSummary(row)

    expect(result.grossPay).toBe(340000)
    expect(result.nursingCareInsurancePremium).toBe(2754)
    expect(result.totalDeductions).toBe(70454)
    expect(result.netPay).toBe(269546)
  })
})
