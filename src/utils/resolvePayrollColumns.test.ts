import { describe, expect, it } from 'vitest'
import { resolvePayrollTableView } from '@/utils/resolvePayrollColumns'

describe('resolvePayrollTableView', () => {
  it('resolves part-time grouped columns', () => {
    const view = resolvePayrollTableView([
      { employmentType: 'partTime', employeeNo: 'X001', baseSalary: 120000 },
    ])

    expect(view.employmentType).toBe('partTime')
    expect(view.groupedColumns.length).toBeGreaterThan(0)
    expect(view.flatColumns.some((column) => column.field === 'withholdingIncomeTax')).toBe(true)
  })

  it('resolves full-time grouped columns', () => {
    const view = resolvePayrollTableView([
      { employmentType: 'fullTime', employeeNo: 'F001', healthInsurancePremium: 17800 },
    ])

    expect(view.employmentType).toBe('fullTime')
    expect(view.flatColumns.some((column) => column.field === 'welfarePensionPremium')).toBe(true)
  })

  it('marks mixed employment types', () => {
    const view = resolvePayrollTableView([
      { employmentType: 'partTime', employeeNo: 'X001' },
      { employmentType: 'fullTime', employeeNo: 'F001' },
    ])

    expect(view.employmentType).toBe('mixed')
  })
})
