<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import LocaleSwitcher from '@/components/LocaleSwitcher.vue'
import { useAuthStore } from '@/stores/authStore'
import type { PermissionKey } from '@/types/auth'

const { t } = useTranslation('hrs')
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
const mobileNavOpen = ref(false)

interface NavItem {
  to: string
  icon: string
  labelKey: string
  permission?: PermissionKey
}

interface NavGroup {
  labelKey: string
  items: NavItem[]
}

const navCatalog: NavGroup[] = [
    {
      labelKey: 'navigation.work',
      items: [
        { to: '/', icon: '⌂', labelKey: 'navigation.home' },
        {
          to: '/attendance',
          icon: '◷',
          labelKey: 'navigation.attendance',
          permission: 'HRS:ATTENDANCE:SELF_VIEW',
        },
        {
          to: '/leave',
          icon: '☂',
          labelKey: 'navigation.leave',
          permission: 'HRS:LEAVE:APPLY',
        },
        {
          to: '/salary/self',
          icon: '¥',
          labelKey: 'navigation.salaryDetail',
          permission: 'HRS:SALARY:SELF_VIEW',
        },
      ],
    },
    {
      labelKey: 'navigation.management',
      items: [
        {
          to: '/personnel',
          icon: '◎',
          labelKey: 'navigation.personnel',
          permission: 'HRS:PERSONNEL:DATA',
        },
        {
          to: '/attendance/admin',
          icon: '▦',
          labelKey: 'navigation.attendanceAdmin',
          permission: 'HRS:ATTENDANCE:ADMIN',
        },
        {
          to: '/salary/admin',
          icon: '▤',
          labelKey: 'navigation.salaryAdmin',
          permission: 'HRS:SALARY:ADMIN',
        },
        {
          to: '/nencho',
          icon: '◇',
          labelKey: 'navigation.nencho',
          permission: 'HRS:NENCHO',
        },
        {
          to: '/access',
          icon: '⚿',
          labelKey: 'navigation.access',
          permission: 'HRS:ACCESS:ADMIN',
        },
      ],
    },
  ]

const navGroups = computed<NavGroup[]>(() =>
  navCatalog.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || authStore.can(item.permission)),
  })),
)

const pageTitle = computed(() => String(route.meta.titleKey ? t(String(route.meta.titleKey)) : t('app.name')))

function selectRole(event: Event): void {
  authStore.setRole((event.target as HTMLSelectElement).value as typeof currentUser.value.role)
}

watch(
  () => currentUser.value.role,
  () => {
    const permission = route.meta.permission
    if (permission && !authStore.can(permission)) void router.replace({ name: 'forbidden' })
  },
)
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <button class="icon-button mobile-menu" :aria-label="t('actions.menu')" @click="mobileNavOpen = !mobileNavOpen">☰</button>
      <RouterLink class="brand" to="/">
        <span class="brand-mark">H</span>
        <span><strong>HRS</strong><small>{{ t('app.subtitle') }}</small></span>
      </RouterLink>
      <div class="system-switcher">
        <span>{{ t('app.system') }}</span>
        <strong>{{ t('app.name') }}</strong>
        <span class="chevron">⌄</span>
      </div>
      <div class="topbar-spacer" />
      <button class="icon-button notification-button" :aria-label="t('actions.notifications')">♢<span>3</span></button>
      <LocaleSwitcher />
      <label class="role-preview">
        <span>{{ t('app.previewRole') }}</span>
        <select :value="currentUser.role" @change="selectRole">
          <option value="super_admin">Admin</option>
          <option value="teacher">Employee</option>
          <option value="finance">Payroll</option>
          <option value="academic">Attendance</option>
        </select>
      </label>
      <button class="user-menu">
        <span class="avatar">{{ currentUser.displayName.slice(0, 1) }}</span>
        <span><strong>{{ currentUser.displayName }}</strong><small>{{ currentUser.employeeNo }}</small></span>
        <span>⌄</span>
      </button>
    </header>

    <div class="shell-body">
      <aside class="sidebar" :class="{ 'sidebar--open': mobileNavOpen }">
        <nav>
          <section v-for="group in navGroups" :key="group.labelKey" class="nav-group">
            <p>{{ t(group.labelKey) }}</p>
            <RouterLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="nav-link"
              @click="mobileNavOpen = false"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span>{{ t(item.labelKey) }}</span>
            </RouterLink>
          </section>
        </nav>
        <div class="sidebar-footer">
          <span class="api-dot" />
          <div><strong>API Contract v1</strong><small>Mock environment</small></div>
        </div>
      </aside>

      <button v-if="mobileNavOpen" class="sidebar-backdrop" aria-label="Close" @click="mobileNavOpen = false" />

      <main class="content-area">
        <div class="breadcrumb"><RouterLink to="/">HRS</RouterLink><span>/</span><strong>{{ pageTitle }}</strong></div>
        <RouterView />
      </main>
    </div>
  </div>
</template>
