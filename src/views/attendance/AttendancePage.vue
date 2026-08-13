<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
const { t } = useTranslation('hrs')
const rows = [
  ['2026/08/12', '08:54', '18:06', '8:12', 'normal'],
  ['2026/08/11', '09:02', '18:13', '8:11', 'normal'],
  ['2026/08/08', '08:58', '17:42', '7:44', 'normal'],
  ['2026/08/07', '09:00', '—', '—', 'pending'],
]
</script>
<template><div class="page-stack"><PageHeader :title="t('attendance.title')" :subtitle="t('attendance.subtitle')"><button class="button button--primary">◷ {{ t('dashboard.clockIn') }}</button></PageHeader>
<div class="overview-grid"><section class="card"><div class="card-heading"><div><p>{{ t('dashboard.monthlyTitle') }}</p><h2>2026年8月</h2></div><StatusBadge tone="info">集計中</StatusBadge></div><div class="metric-row"><div><span>{{ t('dashboard.workDays') }}</span><strong>9<small> 日</small></strong></div><div><span>{{ t('dashboard.overtime') }}</span><strong>4:30</strong></div><div><span>{{ t('dashboard.paidLeave') }}</span><strong>1<small> 日</small></strong></div></div></section><section class="card warning-panel"><span>!</span><div><strong>打刻内容の確認が必要です</strong><p>8月7日の退勤時刻が記録されていません。</p></div><button class="button button--secondary">修正を申請</button></section></div>
<section class="card table-card"><div class="card-heading"><div><p>{{ t('attendance.recent') }}</p><h2>2026年8月</h2></div><button class="button button--secondary">月を選択 ⌄</button></div><div class="data-table-scroll"><table class="data-table"><thead><tr><th>{{ t('attendance.date') }}</th><th>{{ t('attendance.start') }}</th><th>{{ t('attendance.end') }}</th><th>{{ t('attendance.work') }}</th><th>{{ t('attendance.state') }}</th><th></th></tr></thead><tbody><tr v-for="row in rows" :key="row[0]"><td><strong>{{ row[0] }}</strong></td><td>{{ row[1] }}</td><td>{{ row[2] }}</td><td>{{ row[3] }}</td><td><StatusBadge :tone="row[4] === 'pending' ? 'warning' : 'success'">{{ row[4] === 'pending' ? '要確認' : '正常' }}</StatusBadge></td><td><button class="text-button">{{ t('actions.details') }} ›</button></td></tr></tbody></table></div></section></div></template>
