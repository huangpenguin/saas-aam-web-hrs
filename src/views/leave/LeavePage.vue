<script setup lang="ts">
import { ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
const { t } = useTranslation('hrs')
const submitted = ref(false)
</script>
<template><div class="page-stack"><PageHeader :title="t('leave.title')" :subtitle="t('leave.subtitle')" />
<div class="two-column-form"><section class="card form-card"><div class="card-heading"><div><p>{{ t('leave.title') }}</p><h2>{{ t('leave.submit') }}</h2></div></div><label><span>{{ t('leave.type') }}</span><select><option>年次有給休暇</option><option>病気休暇</option><option>特別休暇</option></select></label><div class="form-grid"><label><span>開始日</span><input type="date" value="2026-08-20" /></label><label><span>終了日</span><input type="date" value="2026-08-20" /></label></div><label><span>{{ t('leave.reason') }}</span><textarea rows="4" placeholder="申請理由を入力してください"></textarea></label><button class="button button--primary" @click="submitted = true">{{ t('leave.submit') }}</button><p v-if="submitted" class="success-message">✓ 申請を受け付けました（Mock）</p></section>
<section class="card"><div class="card-heading"><div><p>{{ t('leave.history') }}</p><h2>2026年</h2></div></div><div class="record-list"><article><div><strong>年次有給休暇</strong><span>2026/07/18 · 1日</span></div><StatusBadge tone="success">承認済</StatusBadge></article><article><div><strong>病気休暇</strong><span>2026/05/12 · 0.5日</span></div><StatusBadge tone="success">承認済</StatusBadge></article><article><div><strong>夏季休暇</strong><span>2026/08/28 · 1日</span></div><StatusBadge tone="warning">承認待ち</StatusBadge></article></div></section></div></div></template>
