import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { hasPermission } from '@/constants/permissions'
import type { AuthUser, PermissionKey, UserRole } from '@/types/auth'

const defaultUser: AuthUser = {
  id: 'dev-admin',
  employeeNo: 'X001',
  displayName: '開発管理者',
  role: 'super_admin',
  teacherId: 'teacher-x001',
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<AuthUser>(defaultUser)

  const role = computed(() => currentUser.value.role)
  const isTeacher = computed(() => role.value === 'teacher')
  const canReadAllPayroll = computed(() => hasPermission(role.value, 'payroll:read:all'))
  const canEditPayrollLayout = computed(() => hasPermission(role.value, 'payroll:edit:layout'))

  function can(permission: PermissionKey): boolean {
    return hasPermission(role.value, permission)
  }

  function setRole(nextRole: UserRole): void {
    currentUser.value = {
      ...currentUser.value,
      role: nextRole,
    }
  }

  return {
    currentUser,
    role,
    isTeacher,
    canReadAllPayroll,
    canEditPayrollLayout,
    can,
    setRole,
  }
})
