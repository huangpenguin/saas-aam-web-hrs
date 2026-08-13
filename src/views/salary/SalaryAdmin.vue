<script setup lang="ts">
import { ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { salarySummaries } from '@/mocks/hrsMock'
const { t } = useTranslation('hrs')
const finalized = ref(false)
const step = ref(3)
function confirmationLabel(value: string): string { return value === 'UNCONFIRMED' ? '未確認' : value === 'AUTO_CONFIRMED' ? '自動確認' : '本人確認済' }
function finalize(): void { finalized.value = true; step.value = 4 }
</script>
<template><div class="page-stack"><PageHeader :title="t('salary.adminTitle')" :subtitle="t('salary.adminSubtitle')"><button class="button button--secondary">設定</button><button class="button button--primary" :disabled="finalized" @click="finalize">{{ finalized ? t('status.finalized') : t('actions.finalize') }}</button></PageHeader>
<section class="card process-card"><div class="card-heading"><div><p>{{ t('salary.progress') }}</p><h2>支給日 2026/08/25</h2></div><StatusBadge :tone="finalized ? 'success' : 'info'">{{ finalized ? t('status.finalized') : '確認中' }}</StatusBadge></div><ol class="stepper"><li class="done"><span>✓</span><div><strong>{{ t('salary.attendanceDone') }}</strong><small>8/10 完了</small></div></li><li class="done"><span>✓</span><div><strong>{{ t('salary.calculationDone') }}</strong><small>8/12 完了</small></div></li><li :class="{ done: step > 3, active: step === 3 }"><span>3</span><div><strong>{{ t('salary.employeeConfirmation') }}</strong><small>2 / 3名</small></div></li><li :class="{ done: finalized, active: step === 4 && !finalized }"><span>{{ finalized ? '✓' : '4' }}</span><div><strong>{{ t('salary.finalization') }}</strong><small>{{ finalized ? '完了' : '未実施' }}</small></div></li></ol></section>
<section class="card table-card"><div class="filter-toolbar"><input placeholder="氏名で検索" /><select><option>すべての確認状況</option></select><div class="toolbar-spacer"/><RouterLink class="button button--secondary" to="/payroll/legacy">旧プレビュー</RouterLink></div><div class="data-table-scroll"><table class="data-table"><thead><tr><th>{{ t('salary.employee') }}</th><th>{{ t('personnel.department') }}</th><th>{{ t('salary.type') }}</th><th>{{ t('salary.net') }}</th><th>{{ t('salary.confirmation') }}</th><th>Status</th><th></th></tr></thead><tbody><tr v-for="row in salarySummaries" :key="row.employeeId"><td><strong>{{ row.employeeName }}</strong></td><td>{{ row.department }}</td><td>{{ row.salaryType }}</td><td><strong>¥{{ Number(row.netPay).toLocaleString('ja-JP') }}</strong></td><td><StatusBadge :tone="row.confirmationStatus === 'UNCONFIRMED' ? 'warning' : 'success'">{{ confirmationLabel(row.confirmationStatus) }}</StatusBadge></td><td><StatusBadge :tone="finalized ? 'success' : 'info'">{{ finalized ? t('status.finalized') : t('status.calculated') }}</StatusBadge></td><td><button class="text-button">{{ t('actions.details') }} ›</button></td></tr></tbody></table></div></section></div></template>
