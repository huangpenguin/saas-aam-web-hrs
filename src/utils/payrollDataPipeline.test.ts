import { describe, expect, it } from 'vitest'
import {
  flattenPayrollRowsForSubmit,
  unflattenPayrollRowsFromApi,
} from '@/utils/payrollDataPipeline'
import type { PartTimePayrollRow } from '@/types/payroll'

describe('payrollDataPipeline', () => {
  it('unflattens customFields and dynamicData into preview rows', () => {
    const row: PartTimePayrollRow = {
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
      customFields: {
        custom_101: 200,
      },
      dynamicData: {
        custom_102: '备注',
      },
    }

    expect(unflattenPayrollRowsFromApi([row])[0]).toMatchObject({
      employeeNo: 'X001',
      baseSalary: 120000,
      custom_101: 200,
      custom_102: '备注',
    })
  })

  it('splits fixed fields and custom fields for submit', () => {
    const [payload] = flattenPayrollRowsForSubmit([
      {
        id: 'pt-001',
        employeeNo: 'X001',
        baseSalary: 120000,
        custom_101: 200,
        scratch: 'ignored',
      },
    ])

    expect(payload?.fixedPayload).toEqual({
      id: 'pt-001',
      employeeNo: 'X001',
      baseSalary: 120000,
    })
    expect(payload?.dynamicData).toEqual({
      custom_101: 200,
    })
  })
})
