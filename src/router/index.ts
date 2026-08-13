import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { PermissionKey } from '@/types/auth'

declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string
    permission?: PermissionKey
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HrsDashboard.vue'), meta: { titleKey: 'hrs:navigation.home' } },
    { path: '/personnel', name: 'personnel', component: () => import('@/views/personnel/PersonnelList.vue'), meta: { titleKey: 'hrs:navigation.personnel', permission: 'HRS:PERSONNEL:DATA' } },
    { path: '/attendance', name: 'attendance', component: () => import('@/views/attendance/AttendancePage.vue'), meta: { titleKey: 'hrs:navigation.attendance', permission: 'HRS:ATTENDANCE:SELF_VIEW' } },
    { path: '/attendance/admin', name: 'attendance-admin', component: () => import('@/views/attendance/AttendanceAdmin.vue'), meta: { titleKey: 'hrs:navigation.attendanceAdmin', permission: 'HRS:ATTENDANCE:ADMIN' } },
    { path: '/leave', name: 'leave', component: () => import('@/views/leave/LeavePage.vue'), meta: { titleKey: 'hrs:navigation.leave', permission: 'HRS:LEAVE:APPLY' } },
    { path: '/salary/self', name: 'salary-self', component: () => import('@/views/salary/SalarySelf.vue'), meta: { titleKey: 'hrs:navigation.salaryDetail', permission: 'HRS:SALARY:SELF_VIEW' } },
    { path: '/salary/admin', name: 'salary-admin', component: () => import('@/views/salary/SalaryAdmin.vue'), meta: { titleKey: 'hrs:navigation.salaryAdmin', permission: 'HRS:SALARY:ADMIN' } },
    { path: '/payroll/legacy', name: 'payroll-legacy', component: () => import('@/views/payroll/PayrollDashboard.vue'), meta: { titleKey: 'hrs:salary.legacy', permission: 'HRS:SALARY:ADMIN' } },
    { path: '/nencho', name: 'nencho', component: () => import('@/views/nencho/NenchoDashboard.vue'), meta: { titleKey: 'hrs:navigation.nencho', permission: 'HRS:NENCHO' } },
    { path: '/access', name: 'access', component: () => import('@/views/access/AccessPage.vue'), meta: { titleKey: 'hrs:navigation.access', permission: 'HRS:ACCESS:ADMIN' } },
    { path: '/forbidden', name: 'forbidden', component: () => import('@/views/ForbiddenPage.vue'), meta: { titleKey: 'Forbidden' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const permission = to.meta.permission
  if (permission && !useAuthStore().can(permission)) return { name: 'forbidden' }
  return true
})

export default router
