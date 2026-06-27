import type { PermissionKey, UserRole } from '@/types/auth'

export const rolePermissions: Record<UserRole, PermissionKey[]> = {
  super_admin: [
    'payroll:read:all',
    'payroll:read:self',
    'payroll:edit:layout',
    'payroll:add:column',
    'payroll:add:formula',
    'payroll:adjust:all',
  ],
  teacher: ['payroll:read:self'],
  finance: ['payroll:read:all'],
  academic: ['payroll:read:self'],
}

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return rolePermissions[role].includes(permission)
}
