<script setup lang="ts">
import type { PayrollMode, PayrollRow } from '@/types/payroll'
import type { PayrollColumnConfig } from '@/types/table'
import PayrollColumnRenderer from './PayrollColumnRenderer.vue'

const props = withDefaults(
  defineProps<{
    rows: PayrollRow[]
    columns: PayrollColumnConfig[]
    mode: PayrollMode
    editable: boolean
    tableHeight?: string | number
  }>(),
  {
    tableHeight: '100%',
  },
)

const emit = defineEmits<{
  cellChange: [row: PayrollRow, field: string, value: unknown]
}>()

function handleEditClosed(params: { row: PayrollRow; column: { field?: string } }): void {
  const field = params.column.field
  if (!field) {
    return
  }

  emit('cellChange', params.row, field, (params.row as unknown as Record<string, unknown>)[field])
}
</script>

<template>
  <div class="payroll-table-root">
    <vxe-table
      border
      show-overflow
      show-header-overflow
      :height="props.tableHeight"
      :data="props.rows"
      :edit-config="props.editable ? { trigger: 'click', mode: 'cell' } : undefined"
      :scroll-x="{ enabled: true, gt: 8 }"
      :scroll-y="{ enabled: true, gt: 20 }"
      @edit-closed="handleEditClosed"
    >
      <PayrollColumnRenderer
        v-for="column in props.columns"
        :key="column.id"
        :column="column"
        :editable="props.mode === 'layout' && props.editable"
      />
    </vxe-table>
  </div>
</template>

<style scoped>
.payroll-table-root {
  height: 100%;
  min-height: 0;
}
</style>
