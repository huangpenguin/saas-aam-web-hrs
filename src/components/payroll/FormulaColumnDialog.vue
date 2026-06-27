<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTranslation } from 'i18next-vue'

const props = defineProps<{
  open: boolean
  availableFields: { field: string; label: string }[]
  initialTitle?: string
  initialFormula?: string
  editing?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: { title: string; formula: string }]
}>()

const { t } = useTranslation()

const title = ref('')
const formula = ref('baseSalary + commutingAllowance')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      title.value = props.initialTitle ?? t('payroll:formulaColumnDefaultTitle')
      formula.value = props.initialFormula ?? 'baseSalary + bonus'
    }
  },
)

function handleSubmit(): void {
  emit('submit', {
    title: title.value.trim() || t('payroll:formulaColumnDefaultTitle'),
    formula: formula.value.trim(),
  })
}
</script>

<template>
  <div v-if="props.open" class="dialog-backdrop" role="dialog" aria-modal="true">
    <section class="dialog-panel">
      <header>
        <h2>
          {{ props.editing ? t('payroll:editFormulaColumn') : t('payroll:addFormulaColumn') }}
        </h2>
        <button type="button" class="ghost-button" @click="emit('close')">
          {{ t('common:close') }}
        </button>
      </header>

      <label>
        <span>{{ t('payroll:columnName') }}</span>
        <input v-model="title" type="text" />
      </label>

      <label>
        <span>{{ t('payroll:formula') }}</span>
        <input
          v-model="formula"
          type="text"
          :placeholder="t('payroll:formulaPlaceholder')"
        />
      </label>

      <div class="field-list">
        <span v-for="item in props.availableFields" :key="item.field">
          {{ item.label }}: <code>{{ item.field }}</code>
        </span>
      </div>

      <footer>
        <button type="button" class="ghost-button" @click="emit('close')">
          {{ t('common:cancel') }}
        </button>
        <button type="button" class="primary-button" @click="handleSubmit">
          {{ props.editing ? t('common:save') : t('common:add') }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.42);
  z-index: 20;
  padding: 24px;
}

.dialog-panel {
  width: min(560px, 100%);
  background: var(--bg);
  border-radius: 18px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  padding: 22px;
  display: grid;
  gap: 16px;
}

header,
footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

h2 {
  margin: 0;
}

label {
  display: grid;
  gap: 6px;
  text-align: left;
}

input {
  min-height: 42px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-h);
  padding: 0 12px;
  font: inherit;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
}

.field-list span {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 10px;
  background: var(--surface);
}

button {
  border-radius: 10px;
  min-height: 40px;
  padding: 0 14px;
  cursor: pointer;
  font: inherit;
}

.ghost-button {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-h);
}

.primary-button {
  border: 0;
  background: var(--accent);
  color: #fff;
}
</style>
