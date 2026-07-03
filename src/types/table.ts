import type { PermissionKey } from './auth'
import type {
  EmploymentType,
  FullTimePayrollRow,
  PayrollBaseRow,
  PartTimePayrollRow,
} from './payroll'

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
  formatter?: (value: string | number | null) => string
  headerParam?: 'taxRate'
  custom?: boolean
}

export interface SalaryDetailColumn {
  field: string
  title: string
  formatter?: (value: string | number | null) => string
  editable?: boolean
  formula?: string
}

export interface PayrollTableView {
  id: EmploymentType | 'mixed' | 'empty'
  title: string
  employmentType: EmploymentType | 'mixed' | null
  rows: Record<string, string | number | null>[]
  columns: PayrollColumnConfig[]
  flatColumns: SalaryDetailColumn[]
}
