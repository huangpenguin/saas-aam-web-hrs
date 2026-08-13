export interface RolePermissionSource {
  permissions: string[]
}

export function resolveEffectivePermissions(
  roles: RolePermissionSource[],
  grantedPermissions: string[],
  revokedPermissions: string[],
): string[] {
  const permissions = new Set(roles.flatMap((role) => role.permissions))
  grantedPermissions.forEach((permission) => permissions.add(permission))
  revokedPermissions.forEach((permission) => permissions.delete(permission))
  return [...permissions].sort()
}

export function permissionMatches(effective: string[], required?: string): boolean {
  if (!required) return true
  if (effective.includes(required)) return true
  const segments = required.split(':')
  while (segments.length > 2) {
    segments.pop()
    if (effective.includes(segments.join(':'))) return true
  }
  return false
}
