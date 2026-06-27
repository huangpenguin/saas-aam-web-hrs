import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'payroll-dashboard',
      component: () => import('@/views/payroll/PayrollDashboard.vue'),
    },
  ],
})

export default router
