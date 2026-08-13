export type UserRole = 'super_admin' | 'teacher' | 'finance' | 'academic'

export interface AuthUser {
  id: string
  employeeNo: string
  displayName: string
  role: UserRole
  teacherId?: string
  roles?: Array<{ id: string; code: string; name: string; permissions: PermissionKey[] }>
  grantedPermissions?: PermissionKey[]
  revokedPermissions?: PermissionKey[]
}

export type LegacyPermissionKey =
  | 'payroll:read:all'
  | 'payroll:read:self'
  | 'payroll:edit:layout'
  | 'payroll:add:column'
  | 'payroll:add:formula'
  | 'payroll:adjust:all'

export type PermissionKey =
  | LegacyPermissionKey
  | 'HRS:ATTENDANCE'
  | 'HRS:ATTENDANCE:PUNCH'
  | 'HRS:ATTENDANCE:SELF_VIEW'
  | 'HRS:ATTENDANCE:SELF_MODIFY'
  | 'HRS:ATTENDANCE:CONFIG'
  | 'HRS:ATTENDANCE:TYPE'
  | 'HRS:ATTENDANCE:ADMIN'
  | 'HRS:ATTENDANCE:CALC'
  | 'HRS:ATTENDANCE:MODIFY_APPROVE'
  | 'HRS:LEAVE:APPLY'
  | 'HRS:LEAVE:APPROVE'
  | 'HRS:SALARY'
  | 'HRS:SALARY:SELF_VIEW'
  | 'HRS:SALARY:CONFIG'
  | 'HRS:SALARY:ITEM'
  | 'HRS:SALARY:TYPE'
  | 'HRS:SALARY:TEMPLATE'
  | 'HRS:SALARY:CALC'
  | 'HRS:SALARY:ADMIN'
  | 'HRS:SALARY:LEDGER_EXPORT'
  | 'HRS:PERSONNEL:DATA'
  | 'HRS:PERSONNEL:BANK'
  | 'HRS:PERSONNEL:EVAL'
  | 'HRS:NENCHO'
  | 'HRS:NENCHO:SELF_DECLARE'
  | 'HRS:NENCHO:SELF_VIEW'
  | 'HRS:NENCHO:CONFIG'
  | 'HRS:NENCHO:TARGET'
  | 'HRS:NENCHO:REVIEW'
  | 'HRS:NENCHO:CALC'
  | 'HRS:NENCHO:ADJUST'
  | 'HRS:NENCHO:TAX_SLIP'
  | 'HRS:NENCHO:STAT_REPORT'
  | 'HRS:NENCHO:DATA_MIGRATE'
  | 'HRS:NENCHO:TAX_PARAM'
  | 'HRS:ACCESS:ADMIN'
