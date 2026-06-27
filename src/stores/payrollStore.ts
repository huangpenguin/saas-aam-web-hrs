import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchMonthlySalaryDetails, isMockModeEnabled } from '@/api/payrollService'
import i18next from '@/i18n'
import { getMockMonthlySalaryDetailsHint } from '@/mocks/payrollMock'
import { useAuthStore } from './authStore'
import {
  appendCustomColumnField,
  buildQueryPreviewColumnsFromRows,
  normalizeQueryPreviewRows,
} from '@/utils/queryResultTable'
import {
  resolvePreviewColumnTitle,
  translatePayrollMessage,
} from '@/utils/columnLabels'
import { normalizeMonthlySalaryQuery } from '@/utils/payrollQuery'
import type { MonthlySalaryDetailsRequest, PayrollMode } from '@/types/payroll'
import type { SalaryDetailColumn } from '@/types/table'

export const usePayrollStore = defineStore('payroll', () => {
  const mode = ref<PayrollMode>('overview')
  const loading = ref(false)
  const errorMessage = ref('')
  const hasQueryResult = ref(false)
  const resultCount = ref(0)
  const lastQuery = ref<MonthlySalaryDetailsRequest | null>(null)
  const previewRows = ref<Record<string, string | number | null>[]>([])
  const previewColumns = ref<SalaryDetailColumn[]>([])
  const customColumns = ref<SalaryDetailColumn[]>([])
  const localeVersion = ref(0)

  i18next.on('languageChanged', () => {
    localeVersion.value += 1
    if (previewRows.value.length > 0) {
      previewColumns.value = buildQueryPreviewColumnsFromRows(previewRows.value)
    }
  })

  const isMockMode = computed(() => isMockModeEnabled())
  const mockHint = computed(() => (isMockMode.value ? getMockMonthlySalaryDetailsHint() : ''))

  const displayColumns = computed(() => {
    localeVersion.value

    const localizedCustomColumns = customColumns.value.map((column) => {
      if (column.field.startsWith('custom_remark_') && !column.formula) {
        return {
          ...column,
          title: translatePayrollMessage('remarkColumn'),
        }
      }

      return column
    })

    return [...previewColumns.value, ...localizedCustomColumns]
  })

  const availableFormulaFields = computed(() => {
    localeVersion.value

    return previewColumns.value
      .filter((column) => !column.formula)
      .map((column) => ({
        field: column.field,
        label: resolvePreviewColumnTitle(column),
      }))
  })

  async function queryMonthlyDetails(payload: MonthlySalaryDetailsRequest): Promise<boolean> {
    const authStore = useAuthStore()
    const scopedPayload: MonthlySalaryDetailsRequest = normalizeMonthlySalaryQuery(
      authStore.isTeacher
        ? {
            ...payload,
            uid: authStore.currentUser.employeeNo,
          }
        : payload,
    )

    loading.value = true
    errorMessage.value = ''
    hasQueryResult.value = false
    resultCount.value = 0
    customColumns.value = []

    try {
      const records = await fetchMonthlySalaryDetails(scopedPayload)
      const rows = normalizeQueryPreviewRows(records)

      lastQuery.value = scopedPayload
      previewRows.value = rows
      previewColumns.value = buildQueryPreviewColumnsFromRows(rows)
      resultCount.value = rows.length
      hasQueryResult.value = true
      return true
    } catch (error: unknown) {
      errorMessage.value =
        error instanceof Error ? error.message : translatePayrollMessage('fetchFailed')
      previewRows.value = []
      previewColumns.value = []
      customColumns.value = []
      hasQueryResult.value = false
      resultCount.value = 0
      return false
    } finally {
      loading.value = false
    }
  }

  function setMode(nextMode: PayrollMode): void {
    mode.value = nextMode
  }

  function addRemarkColumn(): void {
    const suffix = Date.now().toString(36)
    const field = `custom_remark_${suffix}`

    customColumns.value.push({
      field,
      title: translatePayrollMessage('remarkColumn'),
      editable: true,
    })
    previewRows.value = appendCustomColumnField(previewRows.value, field, '')
  }

  function addFormulaColumn(title: string, formula: string): void {
    const suffix = Date.now().toString(36)
    const field = `custom_formula_${suffix}`

    customColumns.value.push({
      field,
      title: title.trim() || translatePayrollMessage('formulaColumnDefaultTitle'),
      formula: formula.trim(),
    })
  }

  function updateFormulaColumn(field: string, title: string, formula: string): void {
    const target = customColumns.value.find((column) => column.field === field)
    if (!target) {
      return
    }

    target.title = title.trim() || target.title
    target.formula = formula.trim()
  }

  function updatePreviewCell(
    rowIndex: number,
    field: string,
    value: string | number | null,
  ): void {
    const row = previewRows.value[rowIndex]
    if (!row) {
      return
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      row[field] = Number.isFinite(parsed) ? parsed : value
      return
    }

    row[field] = value
  }

  function clearQueryResult(): void {
    hasQueryResult.value = false
    resultCount.value = 0
    lastQuery.value = null
    previewRows.value = []
    previewColumns.value = []
    customColumns.value = []
    errorMessage.value = ''
  }

  return {
    mode,
    loading,
    errorMessage,
    hasQueryResult,
    resultCount,
    lastQuery,
    previewRows,
    previewColumns,
    customColumns,
    displayColumns,
    availableFormulaFields,
    isMockMode,
    mockHint,
    queryMonthlyDetails,
    setMode,
    addRemarkColumn,
    addFormulaColumn,
    updateFormulaColumn,
    updatePreviewCell,
    clearQueryResult,
  }
})
