import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

export function useRbac() {
  const authStore = useAuthStore()
  const { canReadAllPayroll, canEditPayrollLayout, isTeacher } = storeToRefs(authStore)

  return {
    can: authStore.can,
    canReadAllPayroll,
    canEditPayrollLayout,
    isTeacher,
  }
}
