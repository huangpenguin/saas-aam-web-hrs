<script setup lang="ts">
import { ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
const { t } = useTranslation('hrs')
const roles = ref([
  { name: 'システム管理者', code: 'HRS_ADMIN', members: 2, permissions: 31, overrides: 0, scope: 'all' },
  { name: '給与管理者', code: 'PAYROLL_ADMIN', members: 4, permissions: 9, overrides: 2, scope: 'departmentTree' },
  { name: '勤怠管理者', code: 'ATTENDANCE_ADMIN', members: 7, permissions: 8, overrides: 1, scope: 'departmentTree' },
  { name: '一般従業員', code: 'EMPLOYEE', members: 46, permissions: 7, overrides: 3, scope: 'self' },
])
</script>
<template><div class="page-stack"><PageHeader :title="t('access.title')" :subtitle="t('access.subtitle')"><button class="button button--primary">＋ {{ t('actions.add') }}</button></PageHeader>
<section class="info-banner"><span>i</span><p>有効権限 = 役割テンプレート + 個別追加 − 個別除外。変更は直ちに反映され、監査ログに記録されます。</p></section>
<section class="role-grid"><article v-for="role in roles" :key="role.code" class="card role-card"><div class="role-card-head"><span class="role-icon">⚿</span><div><h2>{{ role.name }}</h2><code>{{ role.code }}</code></div><button class="icon-button">⋯</button></div><dl><div><dt>{{ t('access.members') }}</dt><dd>{{ role.members }} {{ t('commonUi.people') }}</dd></div><div><dt>{{ t('access.permissions') }}</dt><dd>{{ role.permissions }}</dd></div><div><dt>{{ t('access.overrides') }}</dt><dd><StatusBadge :tone="role.overrides ? 'warning' : 'neutral'">{{ role.overrides }}</StatusBadge></dd></div><div><dt>{{ t('access.dataScope') }}</dt><dd>{{ t(`access.${role.scope}`) }}</dd></div></dl><button class="button button--secondary button--block">{{ t('actions.details') }}</button></article></section>
<section class="card"><div class="card-heading"><div><p>権限変更履歴</p><h2>最近の監査ログ</h2></div><button class="text-button">すべて表示 →</button></div><div class="record-list"><article><div><strong>佐藤 花子に給与管理者を付与</strong><span>開発管理者 · 2026/08/12 14:22</span></div><StatusBadge tone="success">成功</StatusBadge></article><article><div><strong>田中 美咲の個別権限を変更</strong><span>開発管理者 · 2026/08/11 09:10</span></div><StatusBadge tone="success">成功</StatusBadge></article></div></section></div></template>
