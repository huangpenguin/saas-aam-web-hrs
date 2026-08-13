<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
const { t } = useTranslation('hrs')
const modules = [
  { icon: '◫', key: 'nencho.configuration', text: '受付期間・計算日・反映給与月', tone: 'blue' },
  { icon: '✓', key: 'nencho.declarations', text: '提出状況と証明書の確認', tone: 'green' },
  { icon: '∑', key: 'nencho.calculation', text: '過不足税額を計算・反映', tone: 'orange' },
  { icon: '▤', key: 'nencho.documents', text: 'PDF・法定書類を一括生成', tone: 'purple' },
]
</script>
<template><div class="page-stack"><PageHeader :title="t('nencho.title')" :subtitle="t('nencho.subtitle')"><button class="button button--secondary">2026年 ⌄</button></PageHeader>
<section class="card nencho-progress"><div class="card-heading"><div><p>{{ t('nencho.period') }}</p><h2>申告受付期間 10/20 — 11/15</h2></div><StatusBadge tone="info">準備中</StatusBadge></div><div class="progress-bar"><span style="width: 62%" /></div><div class="progress-stats"><div><strong>46</strong><span>{{ t('nencho.target') }}</span></div><div><strong>28</strong><span>{{ t('nencho.submitted') }}</span></div><div><strong>3</strong><span>{{ t('nencho.returned') }}</span></div><div><strong>61%</strong><span>提出率</span></div></div></section>
<div class="module-card-grid"><article v-for="module in modules" :key="module.key" class="card module-card"><span class="module-icon" :class="`module-icon--${module.tone}`">{{ module.icon }}</span><div><h2>{{ t(module.key) }}</h2><p>{{ module.text }}</p></div><button class="text-button">{{ t('actions.details') }} →</button></article></div>
<section class="card"><div class="card-heading"><div><p>最近の処理</p><h2>申告ステータス</h2></div></div><div class="record-list"><article><div><strong>佐藤 花子</strong><span>保険料控除申告書 · 10分前</span></div><StatusBadge tone="info">提出済</StatusBadge></article><article><div><strong>田中 美咲</strong><span>扶養控除等申告書 · 1時間前</span></div><StatusBadge tone="danger">差し戻し</StatusBadge></article></div></section></div></template>
