<script setup lang="ts">
import { computed } from 'vue'
import {
  resolvePayrollColumnTitle,
  resolvePayrollGroupTitle,
} from '@/constants/payrollPayslipSchemas'
import type { PayrollColumnConfig } from '@/types/table'
import PayrollColumnRenderer from './PayrollColumnRenderer.vue'

const props = defineProps<{
  column: PayrollColumnConfig
  editable: boolean
}>()

const groupTitle = computed(() => resolvePayrollGroupTitle(props.column))
const columnTitle = computed(() => resolvePayrollColumnTitle(props.column))
</script>

<template>
  <vxe-column
    v-if="props.column.children?.length"
    :title="groupTitle"
    :fixed="props.column.fixed"
  >
    <PayrollColumnRenderer
      v-for="child in props.column.children"
      :key="child.id"
      :column="child"
      :editable="props.editable"
    />
  </vxe-column>

  <vxe-column
    v-else
    :field="props.column.field"
    :title="columnTitle"
    :width="props.column.width"
    :fixed="props.column.fixed"
    :edit-render="props.editable && props.column.editable ? { name: 'input' } : undefined"
  />
</template>
