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

    expect(partTimeRows.length).toBeGreaterThan(1)
    expect(partTimeRows.every((row) => row.employmentType === 'partTime')).toBe(true)
  })

  it('filters mock rows by tax category for part-time staff', () => {
    const rows = queryMockMonthlySalaryDetails({
      year: '2026',
      month: '4',
      employmentType: 'partTime',
      taxCategory: 'kou',
    })

    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0]?.employeeNo).toBe('X001')
  })

  it('returns mixed employment types for default mock month', () => {
    const rows = queryMockMonthlySalaryDetails({
      year: '2026',
      month: '4',
    })

    expect(rows.length).toBeGreaterThan(5)
    expect(rows.some((row) => row.employmentType === 'partTime')).toBe(true)
    expect(rows.some((row) => row.employmentType === 'fullTime')).toBe(true)
  })

  it('covers multiple mock periods', () => {
    expect(queryMockMonthlySalaryDetails({ year: '2025', month: '12' }).length).toBeGreaterThan(1)
    expect(queryMockMonthlySalaryDetails({ year: '2026', month: '1' }).length).toBeGreaterThan(1)
    expect(queryMockMonthlySalaryDetails({ year: '2027', month: '1' }).length).toBeGreaterThan(1)
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
