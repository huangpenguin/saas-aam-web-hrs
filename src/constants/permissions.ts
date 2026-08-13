import type { PermissionKey, UserRole } from '@/types/auth'

export const rolePermissions: Record<UserRole, PermissionKey[]> = {
  super_admin: [
    'payroll:read:all',
    'payroll:read:self',
    'payroll:edit:layout',
    'payroll:add:column',
    'payroll:add:formula',
    'payroll:adjust:all',
    'HRS:ATTENDANCE',
    'HRS:LEAVE:APPROVE',
    'HRS:SALARY',
    'HRS:PERSONNEL:DATA',
    'HRS:PERSONNEL:BANK',
    'HRS:PERSONNEL:EVAL',
    'HRS:NENCHO',
    'HRS:ACCESS:ADMIN',
  ],
  teacher: [
    'payroll:read:self',
    'HRS:ATTENDANCE:PUNCH',
    'HRS:ATTENDANCE:SELF_VIEW',
    'HRS:ATTENDANCE:SELF_MODIFY',
    'HRS:LEAVE:APPLY',
    'HRS:SALARY:SELF_VIEW',
    'HRS:NENCHO:SELF_DECLARE',
    'HRS:NENCHO:SELF_VIEW',
  ],
  finance: [
    'payroll:read:all',
    'HRS:SALARY',
    'HRS:PERSONNEL:DATA',
    'HRS:PERSONNEL:BANK',
  ],
  academic: [
    'payroll:read:self',
    'HRS:ATTENDANCE',
    'HRS:LEAVE:APPROVE',
    'HRS:PERSONNEL:DATA',
  ],
}

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  const assigned = rolePermissions[role]
  if (assigned.includes(permission)) return true
  const segments = permission.split(':')
  while (segments.length > 2) {
    segments.pop()
    if (assigned.includes(segments.join(':') as PermissionKey)) return true
  }
  return false
}
