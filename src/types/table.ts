import type { PermissionKey } from './auth'
import type { FullTimePayrollRow, PayrollBaseRow, PartTimePayrollRow } from './payroll'

export type PayrollField =
  | keyof PayrollBaseRow
  | keyof PartTimePayrollRow
  | keyof FullTimePayrollRow
  | `customFields.${string}`

export interface PayrollColumnConfig {
  id: string
  field?: PayrollField
  /** @deprecated Prefer field + i18n; kept for user-defined columns */
  title?: string
  groupKey?: string
  width?: number
  fixed?: 'left' | 'right'
  editable?: boolean
  visible?: boolean
  children?: PayrollColumnConfig[]
  requiredPermission?: PermissionKey
  formula?: string
}

export interface SalaryDetailColumn {
  field: string
  title: string
  formatter?: (value: string | number | null) => string
  editable?: boolean
  formula?: string
}
