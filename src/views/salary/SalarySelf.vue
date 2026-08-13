<script setup lang="ts">
import { ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
const { t } = useTranslation('hrs')
const confirmed = ref(false)
const credits = [['基本給','320,000'],['役職手当','35,000'],['通勤手当','15,000'],['時間外手当','12,500']]
const debits = [['健康保険','17,800'],['厚生年金','32,940'],['雇用保険','1,925'],['所得税','13,340'],['住民税','30,070']]
</script>
<template><div class="page-stack"><PageHeader :title="t('salary.selfTitle')" :subtitle="t('salary.selfSubtitle')"><select class="month-select"><option>2026年7月</option><option>2026年6月</option></select></PageHeader>
<section class="salary-summary"><div><span>{{ t('salary.gross') }}</span><strong>¥382,500</strong></div><span>−</span><div><span>{{ t('salary.deductions') }}</span><strong>¥96,080</strong></div><span>=</span><div class="net-pay"><span>{{ t('salary.net') }}</span><strong>¥286,420</strong></div></section>
<div class="salary-columns"><section class="card"><div class="card-heading"><div><p>{{ t('salary.credits') }}</p><h2>¥382,500</h2></div></div><dl class="money-list"><div v-for="item in credits" :key="item[0]"><dt>{{ item[0] }}</dt><dd>¥{{ item[1] }}</dd></div></dl></section><section class="card"><div class="card-heading"><div><p>{{ t('salary.debits') }}</p><h2>¥96,080</h2></div></div><dl class="money-list money-list--debit"><div v-for="item in debits" :key="item[0]"><dt>{{ item[0] }}</dt><dd>−¥{{ item[1] }}</dd></div></dl></section></div>
<section class="card action-card"><div><StatusBadge :tone="confirmed ? 'success' : 'info'">{{ confirmed ? '確認済' : t('status.calculated') }}</StatusBadge><p>確認期限：2026年8月20日</p></div><div><button class="button button--secondary">⇩ {{ t('actions.download') }} PDF</button><button v-if="!confirmed" class="button button--primary" @click="confirmed = true">{{ t('actions.confirm') }}</button></div></section></div></template>
