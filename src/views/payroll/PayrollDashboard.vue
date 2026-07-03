<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTranslation } from 'i18next-vue'
import FormulaColumnDialog from '@/components/payroll/FormulaColumnDialog.vue'
import LocaleSwitcher from '@/components/LocaleSwitcher.vue'
import MonthlySalaryQueryForm from '@/components/payroll/MonthlySalaryQueryForm.vue'
import PayrollToolbar from '@/components/payroll/PayrollToolbar.vue'
import QueryPreviewTable from '@/components/payroll/QueryPreviewTable.vue'
import { useRbac } from '@/composables/useRbac'
import { useAuthStore } from '@/stores/authStore'
import { usePayrollStore } from '@/stores/payrollStore'
import type { MonthlySalaryDetailsRequest, PayrollMode } from '@/types/payroll'
import type { SalaryDetailColumn } from '@/types/table'
import { buildQuerySummary } from '@/utils/payrollQuery'
import {
  buildPayrollExportPayload,
  exportPayroll,
  type PayrollExportFormat,
} from '@/utils/payrollExport'

const { t } = useTranslation()

const authStore = useAuthStore()
const payrollStore = usePayrollStore()
const { can, canEditPayrollLayout } = useRbac()
const { currentUser, isTeacher } = storeToRefs(authStore)
const {
  availableFormulaFields,
  displayColumns,
  displayTables,
  errorMessage,
  formulaContext,
  hasQueryResult,
  isMockMode,
  lastQuery,
  loading,
  mockHint,
  mode,
  previewRows,
  resultCount,
} = storeToRefs(payrollStore)

const formulaDialogOpen = ref(false)
const editingFormulaColumn = ref<SalaryDetailColumn | null>(null)
const exporting = ref(false)
const exportError = ref('')
const tableRenderReady = ref(false)

const querySummary = computed(() => {
  if (!lastQuery.value) {
    return ''
  }

  return buildQuerySummary(lastQuery.value)
})

async function handleSearch(payload: MonthlySalaryDetailsRequest): Promise<void> {
  tableRenderReady.value = false
  const success = await payrollStore.queryMonthlyDetails(payload)
  if (!success) {
    return
  }

  await nextTick()
  window.setTimeout(() => {
    tableRenderReady.value = true
  }, 0)
}

function handleModeChange(nextMode: PayrollMode): void {
  payrollStore.setMode(nextMode)
}

function handleAddRemarkColumn(): void {
  payrollStore.addRemarkColumn()
}

function openFormulaDialog(column?: SalaryDetailColumn): void {
  editingFormulaColumn.value = column ?? null
  formulaDialogOpen.value = true
}

function closeFormulaDialog(): void {
  formulaDialogOpen.value = false
  editingFormulaColumn.value = null
}

function handleFormulaSubmit(payload: { title: string; formula: string }): void {
  if (editingFormulaColumn.value) {
    payrollStore.updateFormulaColumn(
      editingFormulaColumn.value.field,
      payload.title,
      payload.formula,
    )
  } else {
    payrollStore.addFormulaColumn(payload.title, payload.formula)
  }

  closeFormulaDialog()
}

function handleCellChange(
  row: Record<string, string | number | null>,
  field: string,
  value: string | number | null,
): void {
  payrollStore.updatePreviewRowCell(row, field, value)
}

async function handleExport(format: PayrollExportFormat): Promise<void> {
  if (previewRows.value.length === 0) {
    exportError.value = t('payroll:exportNoData')
    return
  }

  exporting.value = true
  exportError.value = ''

  try {
    const payload = buildPayrollExportPayload(
      displayColumns.value,
      previewRows.value,
      lastQuery.value,
    )
    await exportPayroll(format, payload)
  } catch (error: unknown) {
    exportError.value = error instanceof Error ? error.message : t('payroll:exportFailed')
  } finally {
    exporting.value = false
  }
}

function handleFormulaContextChange(key: 'taxRate', value: number): void {
  payrollStore.updateFormulaContext(key, value)
}

function resolveTableHeight(tableCount: number): number {
  return tableCount > 1 ? 320 : 520
}
</script>

<template>
  <main class="payroll-page">
    <header class="page-header">
      <div class="page-header__main">
        <p class="eyebrow">{{ t('payroll:appEyebrow') }}</p>
        <h1>{{ t('payroll:dashboardTitle') }}</h1>
      </div>
      <div class="page-header__aside">
        <LocaleSwitcher />
        <div class="status-card">
          <span>{{ t('payroll:currentRole') }}</span>
          <strong>{{ currentUser.role }}</strong>
          <small>{{ isMockMode ? t('payroll:mockData') : t('payroll:realApi') }}</small>
        </div>
      </div>
    </header>

    <section class="panel panel--preview">
      <div class="panel-heading">
        <div class="panel-title-row">
          <div>
            <h2>{{ t('payroll:previewTitle') }}</h2>
            <p v-if="querySummary" class="query-summary">
              <code>{{ querySummary }}</code>
              <span class="result-count">{{ t('payroll:resultCount', { count: resultCount }) }}</span>
              <span v-if="mode === 'layout'" class="layout-badge">{{ t('payroll:layoutEditMode') }}</span>
            </p>
            <p v-else class="query-summary">{{ t('payroll:queryHint') }}</p>
          </div>

          <PayrollToolbar
            :mode="mode"
            :can-edit-layout="canEditPayrollLayout"
            :can-add-column="can('payroll:add:column')"
            :can-export="hasQueryResult"
            :exporting="exporting"
            @mode-change="handleModeChange"
            @add-remark-column="handleAddRemarkColumn"
            @open-formula-dialog="openFormulaDialog()"
            @export="handleExport"
          />
        </div>

        <MonthlySalaryQueryForm
          :loading="loading"
          :mock-mode="isMockMode"
          :mock-hint="mockHint"
          :default-uid="isTeacher ? currentUser.employeeNo : ''"
          :uid-readonly="isTeacher"
          @search="handleSearch"
        />
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="exportError" class="error-message">{{ exportError }}</p>

      <p v-if="mode === 'layout'" class="layout-hint">
        {{ t('payroll:layoutHint') }}
      </p>

      <div class="preview-table-shell">
        <p v-if="!hasQueryResult" class="preview-empty">{{ t('payroll:emptyTableHint') }}</p>
        <p v-else-if="!tableRenderReady" class="preview-loading">{{ t('payroll:previewLoading') }}</p>
        <div v-else class="table-sections">
          <section
            v-for="table in displayTables"
            :key="table.id"
            class="table-section"
          >
            <header v-if="displayTables.length > 1" class="table-section__header">
              <strong>{{ table.title }}</strong>
              <span>{{ t('payroll:resultCount', { count: table.rows.length }) }}</span>
            </header>
            <QueryPreviewTable
              :rows="table.rows"
              :columns="table.columns"
              :table-height="resolveTableHeight(displayTables.length)"
              :mode="mode"
              :editable="canEditPayrollLayout"
              :formula-context="formulaContext"
              :empty-text="hasQueryResult ? t('payroll:noQueryResults') : t('payroll:emptyTableHint')"
              @cell-change="handleCellChange"
              @formula-context-change="handleFormulaContextChange"
            />
          </section>
        </div>
      </div>
    </section>

    <FormulaColumnDialog
      :open="formulaDialogOpen"
      :available-fields="availableFormulaFields"
      :initial-title="editingFormulaColumn?.title"
      :initial-formula="editingFormulaColumn?.formula"
      :editing="Boolean(editingFormulaColumn)"
      @close="closeFormulaDialog"
      @submit="handleFormulaSubmit"
    />
  </main>
</template>

<style scoped>
.payroll-page {
  width: min(1280px, 100%);
  height: 100%;
  margin: 0 auto;
  padding: 16px 20px 20px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  box-sizing: border-box;
  text-align: left;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 18px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.page-header__aside {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.page-header__main {
  min-width: 0;
}

.panel {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.panel--preview {
  min-height: 0;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.eyebrow {
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 4px 0 0;
  font-size: clamp(22px, 2.4vw, 28px);
  line-height: 1.2;
  color: var(--text-h);
}

h2 {
  margin: 0;
  font-size: 18px;
  color: var(--text-h);
}

.status-card {
  min-width: 148px;
  display: grid;
  gap: 2px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg);
  padding: 10px 12px;
  text-align: right;
}

.status-card span,
.status-card small {
  color: var(--text);
  font-size: 12px;
}

.status-card strong {
  color: var(--text-h);
  font-size: 14px;
}

.query-summary {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text);
}

.query-summary code {
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-h);
  font-size: 12px;
}

.panel-heading {
  display: grid;
  gap: 12px;
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.layout-badge {
  margin-left: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
  font-size: 11px;
  font-weight: 600;
}

.layout-hint {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  font-size: 12px;
}

.result-count {
  margin-left: 10px;
  color: var(--accent);
  font-weight: 600;
  font-size: 12px;
}

.preview-table-shell {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
}

.table-sections {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
}

.table-section {
  min-height: 240px;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-h);
  font-size: 13px;
}

.table-section__header span {
  color: var(--text);
  font-size: 12px;
}

.preview-loading {
  display: grid;
  place-items: center;
  height: 100%;
  min-height: 160px;
  margin: 0;
  color: var(--text);
  font-size: 14px;
}

.preview-empty {
  margin: 0;
  padding: 14px 12px;
  color: var(--text);
  font-size: 13px;
}

.error-message {
  margin: 0;
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
}

@media (max-width: 860px) {
  .payroll-page {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header__aside {
    align-items: stretch;
  }

  .status-card {
    text-align: left;
  }

  .panel-title-row {
    flex-direction: column;
  }
}
</style>
