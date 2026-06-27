<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTranslation } from 'i18next-vue'
import {
  EMPLOYMENT_TYPE_FILTER_VALUES,
  QUERY_MONTHS,
  QUERY_YEARS,
  TAX_CATEGORY_FILTER_VALUES,
  isEmploymentTypeFilter,
  isTaxCategoryFilter,
} from '@/constants/payrollQueryOptions'
import type { MonthlySalaryDetailsRequest } from '@/types/payroll'
import { normalizeMonthlySalaryQuery } from '@/utils/payrollQuery'

const props = defineProps<{
  loading: boolean
  defaultUid: string
  uidReadonly: boolean
  mockMode: boolean
  mockHint?: string
}>()

const emit = defineEmits<{
  search: [payload: MonthlySalaryDetailsRequest]
}>()

const { t } = useTranslation()

const year = ref('2026')
const month = ref('4')
const uid = ref(props.defaultUid)
const employmentType = ref('')
const taxCategory = ref('')

const taxCategoryDisabled = computed(
  () => employmentType.value === 'fullTime',
)

watch(
  () => props.defaultUid,
  (nextUid) => {
    if (props.uidReadonly) {
      uid.value = nextUid
    }
  },
)

watch(employmentType, (nextType) => {
  if (nextType === 'fullTime') {
    taxCategory.value = ''
  }
})

function employmentTypeLabel(value: string): string {
  if (!value) {
    return t('payroll:filterAll')
  }

  return t(`columns:enums.employmentType.${value}`)
}

function taxCategoryLabel(value: string): string {
  if (!value) {
    return t('payroll:filterAll')
  }

  return t(`columns:enums.taxCategory.${value}`)
}

function handleSubmit(): void {
  const payload: MonthlySalaryDetailsRequest = {
    year: year.value,
    month: month.value,
  }

  const trimmedUid = uid.value.trim()
  if (trimmedUid) {
    payload.uid = trimmedUid
  }

  if (isEmploymentTypeFilter(employmentType.value)) {
    payload.employmentType = employmentType.value
  }

  if (!taxCategoryDisabled.value && isTaxCategoryFilter(taxCategory.value)) {
    payload.taxCategory = taxCategory.value
  }

  emit('search', normalizeMonthlySalaryQuery(payload))
}
</script>

<template>
  <section class="query-panel">
    <div class="query-panel__header">
      <div>
        <h2>{{ t('payroll:queryConditions') }}</h2>
        <p>{{ t('payroll:queryDescription') }}</p>
      </div>
      <span class="query-panel__badge" :class="{ 'query-panel__badge--mock': props.mockMode }">
        {{ props.mockMode ? t('payroll:mockMode') : t('payroll:apiMode') }}
      </span>
    </div>

    <form class="query-form" @submit.prevent="handleSubmit">
      <label>
        <span>{{ t('payroll:year') }}</span>
        <select v-model="year">
          <option v-for="option in QUERY_YEARS" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <label>
        <span>{{ t('payroll:month') }}</span>
        <select v-model="month">
          <option v-for="option in QUERY_MONTHS" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <label>
        <span>{{ t('payroll:employmentTypeOptional') }}</span>
        <select v-model="employmentType">
          <option
            v-for="option in EMPLOYMENT_TYPE_FILTER_VALUES"
            :key="option || 'all'"
            :value="option"
          >
            {{ employmentTypeLabel(option) }}
          </option>
        </select>
      </label>

      <label :class="{ 'label--disabled': taxCategoryDisabled }">
        <span>
          {{ t('payroll:taxCategoryOptional') }}
          <small v-if="taxCategoryDisabled">{{ t('payroll:taxCategoryPartTimeOnly') }}</small>
        </span>
        <select v-model="taxCategory" :disabled="taxCategoryDisabled">
          <option
            v-for="option in TAX_CATEGORY_FILTER_VALUES"
            :key="option || 'all'"
            :value="option"
          >
            {{ taxCategoryLabel(option) }}
          </option>
        </select>
      </label>

      <label class="uid-field">
        <span>{{ t('payroll:employeeNoOptional') }}</span>
        <input
          v-model="uid"
          type="text"
          :placeholder="t('payroll:employeeNoPlaceholder')"
          :readonly="props.uidReadonly"
        />
      </label>

      <button type="submit" class="query-submit" :disabled="props.loading">
        {{ props.loading ? t('common:loading') : t('common:search') }}
      </button>
    </form>

    <p v-if="props.mockMode && props.mockHint" class="mock-hint">{{ props.mockHint }}</p>
  </section>
</template>

<style scoped>
.query-panel {
  display: grid;
  gap: 14px;
}

.query-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.query-panel__header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--text-h);
}

.query-panel__header p {
  margin: 4px 0 0;
  color: var(--text);
  font-size: 13px;
}

.query-panel__badge {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #1d4ed8;
  background: #dbeafe;
  border: 1px solid #93c5fd;
}

.query-panel__badge--mock {
  color: #b45309;
  background: #fef3c7;
  border-color: #fcd34d;
}

.query-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 14px;
  align-items: end;
  padding: 14px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--bg);
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text);
  font-size: 14px;
  text-align: left;
}

label span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

label small {
  font-size: 11px;
  color: var(--text);
  opacity: 0.75;
}

.label--disabled {
  opacity: 0.72;
}

.uid-field {
  grid-column: span 1;
}

select,
input {
  min-height: 42px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-h);
  padding: 0 12px;
  font: inherit;
}

select:disabled {
  cursor: not-allowed;
  background: var(--muted);
  color: var(--text);
}

input[readonly] {
  background: var(--muted);
}

.query-submit {
  min-height: 42px;
  border: 0;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  padding: 0 22px;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  justify-self: start;
}

.query-submit:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.mock-hint {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  font-size: 13px;
}

@media (max-width: 860px) {
  .query-form {
    grid-template-columns: 1fr;
  }

  .query-panel__header {
    flex-direction: column;
  }

  .query-submit {
    width: 100%;
    justify-self: stretch;
  }
}
</style>
