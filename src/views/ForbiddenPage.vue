<script setup lang="ts">import { useTranslation } from 'i18next-vue'; const { t } = useTranslation('hrs')</script>
<template><section class="card forbidden-page"><span>403</span><h1>アクセス権限がありません</h1><p>このページを表示する権限がありません。管理者にお問い合わせください。</p><RouterLink class="button button--primary" to="/">{{ t('navigation.home') }}</RouterLink></section></template>
