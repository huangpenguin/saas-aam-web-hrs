import { describe, expect, it } from 'vitest'
import { queryMockMonthlySalaryDetails } from '@/mocks/payrollMock'
import { normalizeMonthlySalaryQuery } from '@/utils/payrollQuery'

describe('payroll query filters', () => {
  it('filters mock rows by employment type', () => {
    const partTimeRows = queryMockMonthlySalaryDetails({
      year: '2026',
      month: '4',
      employmentType: 'partTime',
    })

    expect(partTimeRows).toHaveLength(2)
    expect(partTimeRows.every((row) => row.employmentType === 'partTime')).toBe(true)
  })

  it('filters mock rows by tax category for part-time staff', () => {
    const rows = queryMockMonthlySalaryDetails({
      year: '2026',
      month: '4',
      employmentType: 'partTime',
      taxCategory: 'kou',
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.employeeNo).toBe('X001')
  })

  it('drops tax category when employment type is full-time', () => {
    const normalized = normalizeMonthlySalaryQuery({
      year: '2026',
      month: '4',
      employmentType: 'fullTime',
      taxCategory: 'kou',
    })

    expect(normalized.taxCategory).toBeUndefined()
  })
})
