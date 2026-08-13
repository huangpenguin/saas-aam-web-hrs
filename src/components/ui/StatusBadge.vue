<script setup lang="ts">
defineProps<{ tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }>()
</script>
<template><span class="status-badge" :class="`status-badge--${tone ?? 'neutral'}`"><slot /></span></template>
