import { describe, expect, it } from 'vitest'
import { buildPayrollExportMatrix, buildPayrollExportPayload } from '@/utils/payrollExport'
import type { SalaryDetailColumn } from '@/types/table'

const columns: SalaryDetailColumn[] = [
  { field: 'uid', title: '社員番号' },
  { field: 'baseSalary', title: '基本給' },
]

const rows = [
  { uid: 'X001', baseSalary: 120000 },
  { uid: 'X002', baseSalary: 246400 },
]

describe('payrollExport', () => {
  it('builds export matrix from preview rows', () => {
    const matrix = buildPayrollExportMatrix(columns, rows)

    expect(matrix.headers).toEqual(['社員番号', '基本給'])
    expect(matrix.body).toEqual([
      ['X001', '120000'],
      ['X002', '246400'],
    ])
  })

  it('builds export payload with query-based filename', () => {
    const payload = buildPayrollExportPayload(columns, rows, {
      year: '2026',
      month: '4',
      uid: 'X001',
    })

    expect(payload.filenameBase).toBe('payroll-2026-4-X001')
    expect(payload.title).toContain('2026年4月')
  })
})
