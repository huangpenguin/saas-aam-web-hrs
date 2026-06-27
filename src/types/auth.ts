export type UserRole = 'super_admin' | 'teacher' | 'finance' | 'academic'

export interface AuthUser {
  id: string
  employeeNo: string
  displayName: string
  role: UserRole
  teacherId?: string
}

export type PermissionKey =
  | 'payroll:read:all'
  | 'payroll:read:self'
  | 'payroll:edit:layout'
  | 'payroll:add:column'
  | 'payroll:add:formula'
  | 'payroll:adjust:all'
