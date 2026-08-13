<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { hrsEmployees } from '@/mocks/hrsMock'
import type { EmployeeStatus } from '@/types/hrs'

const { t } = useTranslation('hrs')
const keyword = ref('')
const status = ref('')
const employees = ref([...hrsEmployees])
const filtered = computed(() => employees.value.filter((employee) => (!keyword.value || `${employee.name}${employee.employeeNo}`.toLowerCase().includes(keyword.value.toLowerCase())) && (!status.value || employee.status === status.value)))
function statusLabel(value: EmployeeStatus): string { return ({ ACTIVE: t('status.active'), SUSPENDED: t('status.suspended'), RESIGNED: t('status.resigned') })[value] }
function statusTone(value: EmployeeStatus) { return value === 'ACTIVE' ? 'success' as const : value === 'SUSPENDED' ? 'warning' as const : 'neutral' as const }
</script>

<template><div class="page-stack"><PageHeader :title="t('personnel.title')" :subtitle="t('personnel.subtitle')"><button class="button button--primary">＋ {{ t('actions.add') }}</button></PageHeader>
  <section class="card filter-card"><label class="search-field"><span>⌕</span><input v-model="keyword" :placeholder="t('personnel.keyword')" /></label><label><span>{{ t('personnel.department') }}</span><select><option>{{ t('personnel.all') }}</option><option>教務部</option><option>総務部</option></select></label><label><span>Status</span><select v-model="status"><option value="">{{ t('personnel.all') }}</option><option value="ACTIVE">{{ t('status.active') }}</option><option value="SUSPENDED">{{ t('status.suspended') }}</option><option value="RESIGNED">{{ t('status.resigned') }}</option></select></label></section>
  <section class="card table-card"><div class="table-summary"><strong>{{ filtered.length }} {{ t('commonUi.people') }}</strong><span>{{ t('commonUi.mock') }}</span></div><div class="data-table-scroll"><table class="data-table"><thead><tr><th>{{ t('personnel.name') }}</th><th>{{ t('personnel.employeeNo') }}</th><th>{{ t('personnel.department') }}</th><th>{{ t('personnel.position') }}</th><th>{{ t('personnel.employment') }}</th><th>Status</th><th>{{ t('personnel.bank') }}</th><th></th></tr></thead><tbody><tr v-for="employee in filtered" :key="employee.id"><td><div class="employee-cell"><span class="employee-avatar">{{ employee.name.slice(0, 1) }}</span><div><strong>{{ employee.name }}</strong><small>{{ employee.nameKana }}</small></div></div></td><td>{{ employee.employeeNo }}</td><td>{{ employee.department }}</td><td>{{ employee.position }}</td><td>{{ employee.employmentType }}</td><td><StatusBadge :tone="statusTone(employee.status)">{{ statusLabel(employee.status) }}</StatusBadge></td><td>{{ employee.maskedBankAccountNumber }}</td><td><button class="text-button">{{ t('actions.details') }} ›</button></td></tr></tbody></table></div><p v-if="filtered.length === 0" class="empty-state">{{ t('personnel.empty') }}</p></section>
</div></template>
