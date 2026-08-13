<script setup lang="ts">
defineProps<{ title: string; subtitle: string; eyebrow?: string }>()
</script>

<template>
  <header class="page-title-row">
    <div>
      <p v-if="eyebrow" class="page-eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    <div class="page-actions"><slot /></div>
  </header>
</template>
