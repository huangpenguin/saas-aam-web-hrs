import { describe, expect, it } from 'vitest'
import {
  resolvePayrollTableView,
  resolvePayrollTableViews,
} from '@/utils/resolvePayrollColumns'

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

  it('splits mixed employment rows into schema-driven table views', () => {
    const views = resolvePayrollTableViews([
      { employmentType: 'partTime', employeeNo: 'X001', custom_101: 200 },
      { employmentType: 'fullTime', employeeNo: 'F001', custom_101: 3000 },
    ])

    expect(views).toHaveLength(2)
    expect(views.map((view) => view.employmentType)).toEqual(['partTime', 'fullTime'])
    expect(views.every((view) => view.columns.length > 0)).toBe(true)
  })

  it('adds custom columns under schema views', () => {
    const views = resolvePayrollTableViews(
      [{ employmentType: 'partTime', employeeNo: 'X001', custom_101: 200 }],
      [{ field: 'custom_101', title: '高温补贴', editable: true }],
    )

    expect(views[0]?.flatColumns.some((column) => column.field === 'custom_101')).toBe(true)
  })
})
