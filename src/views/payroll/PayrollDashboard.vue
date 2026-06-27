<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTranslation } from 'i18next-vue'
import FormulaColumnDialog from '@/components/payroll/FormulaColumnDialog.vue'
import LocaleSwitcher from '@/components/LocaleSwitcher.vue'
import MonthlySalaryQueryForm from '@/components/payroll/MonthlySalaryQueryForm.vue'
import PayrollToolbar from '@/components/payroll/PayrollToolbar.vue'
import QueryPreviewTable from '@/components/payroll/QueryPreviewTable.vue'
import { useRbac } from '@/composables/useRbac'
import { useVerticalResize } from '@/composables/useVerticalResize'
import { ensureVxeTableInstalled } from '@/plugins/vxeTable'
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

const app = getCurrentInstance()?.appContext.app
const { t } = useTranslation()

const authStore = useAuthStore()
const payrollStore = usePayrollStore()
const { can, canEditPayrollLayout } = useRbac()
const { currentUser, isTeacher } = storeToRefs(authStore)
const {
  availableFormulaFields,
  displayColumns,
  errorMessage,
  hasQueryResult,
  isMockMode,
  lastQuery,
  loading,
  mockHint,
  mode,
  previewRows,
  resultCount,
} = storeToRefs(payrollStore)

const showPreview = ref(false)
const previewReady = ref(false)
const previewLoading = ref(false)
const previewLoadError = ref('')
const pageRef = ref<HTMLElement | null>(null)
const formulaDialogOpen = ref(false)
const editingFormulaColumn = ref<SalaryDetailColumn | null>(null)
const exporting = ref(false)
const exportError = ref('')

const PREVIEW_MIN_HEIGHT = 220
const TOP_MIN_HEIGHT = 160
const PAGE_CHROME_HEIGHT = 52
const PREVIEW_CHROME_HEIGHT = 72

function getInitialPreviewHeight(): number {
  if (typeof window === 'undefined') {
    return 360
  }

  return Math.round(window.innerHeight * 0.42)
}

function getPreviewMaxHeight(): number {
  const pageHeight = pageRef.value?.clientHeight ?? window.innerHeight
  return Math.max(PREVIEW_MIN_HEIGHT, pageHeight - TOP_MIN_HEIGHT - PAGE_CHROME_HEIGHT)
}

const { panelHeight: previewHeight, isResizing, startResize, syncBounds } = useVerticalResize({
  initialHeight: getInitialPreviewHeight(),
  minHeight: PREVIEW_MIN_HEIGHT,
  maxHeight: getPreviewMaxHeight,
  containerRef: pageRef,
})

const previewTableHeight = computed(() =>
  Math.max(160, previewHeight.value - PREVIEW_CHROME_HEIGHT),
)

const querySummary = computed(() => {
  if (!lastQuery.value) {
    return ''
  }

  return buildQuerySummary(lastQuery.value)
})

async function ensurePreviewTableReady(): Promise<boolean> {
  if (previewReady.value) {
    return true
  }

  if (!app) {
    previewLoadError.value = t('payroll:previewInitError')
    return false
  }

  previewLoading.value = true
  previewLoadError.value = ''

  try {
    await ensureVxeTableInstalled(app)
    previewReady.value = true
    return true
  } catch (error: unknown) {
    previewLoadError.value =
      error instanceof Error ? error.message : t('payroll:previewLoadError')
    return false
  } finally {
    previewLoading.value = false
  }
}

async function handleSearch(payload: MonthlySalaryDetailsRequest): Promise<void> {
  const success = await payrollStore.queryMonthlyDetails(payload)
  if (!success) {
    showPreview.value = false
    return
  }

  showPreview.value = true
  await ensurePreviewTableReady()
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
  rowIndex: number,
  field: string,
  value: string | number | null,
): void {
  payrollStore.updatePreviewCell(rowIndex, field, value)
}

function handleEditFormulaColumn(column: SalaryDetailColumn): void {
  openFormulaDialog(column)
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

function syncPreviewBounds(): void {
  syncBounds()
}

onMounted(() => {
  syncPreviewBounds()
  window.addEventListener('resize', syncPreviewBounds)
})

onUnmounted(() => {
  window.removeEventListener('resize', syncPreviewBounds)
})
</script>

<template>
  <main
    ref="pageRef"
    class="payroll-page"
    :class="{ 'payroll-page--with-preview': showPreview && hasQueryResult }"
  >
    <section class="payroll-top">
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

      <section class="panel panel--compact">
        <MonthlySalaryQueryForm
          :loading="loading"
          :mock-mode="isMockMode"
          :mock-hint="mockHint"
          :default-uid="isTeacher ? currentUser.employeeNo : ''"
          :uid-readonly="isTeacher"
          @search="handleSearch"
        />

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-else-if="!showPreview" class="query-hint">
          {{ t('payroll:queryHint') }}
        </p>
      </section>
    </section>

    <template v-if="showPreview && hasQueryResult">
      <div
        class="preview-resizer"
        :class="{ 'preview-resizer--active': isResizing }"
        role="separator"
        aria-orientation="horizontal"
        :aria-label="t('payroll:resizePreviewAria')"
        @mousedown="startResize"
      >
        <span class="preview-resizer__grip" />
        <span class="preview-resizer__hint">{{ t('payroll:resizePreviewHint') }}</span>
      </div>

      <section class="panel panel--preview" :style="{ height: `${previewHeight}px` }">
        <div class="panel-heading">
          <div>
            <h2>{{ t('payroll:previewTitle') }}</h2>
            <p v-if="querySummary" class="query-summary">
              <code>{{ querySummary }}</code>
              <span class="result-count">{{ t('payroll:resultCount', { count: resultCount }) }}</span>
              <span v-if="mode === 'layout'" class="layout-badge">{{ t('payroll:layoutEditMode') }}</span>
            </p>
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

        <p v-if="exportError" class="error-message">{{ exportError }}</p>

        <p v-if="mode === 'layout'" class="layout-hint">
          {{ t('payroll:layoutHint') }}
        </p>

        <div class="preview-table-shell">
          <p v-if="previewLoadError" class="error-message">{{ previewLoadError }}</p>
          <p v-else-if="previewLoading" class="preview-loading">{{ t('payroll:previewLoading') }}</p>
          <QueryPreviewTable
            v-else-if="previewReady"
            :rows="previewRows"
            :columns="displayColumns"
            :table-height="previewTableHeight"
            :mode="mode"
            :editable="canEditPayrollLayout"
            @cell-change="handleCellChange"
            @edit-formula-column="handleEditFormulaColumn"
          />
        </div>
      </section>
    </template>

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
  grid-template-rows: 1fr;
  box-sizing: border-box;
  text-align: left;
  overflow: hidden;
}

.payroll-page--with-preview {
  grid-template-rows: minmax(0, 1fr) 14px auto;
  row-gap: 8px;
}

.payroll-top {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: grid;
  gap: 12px;
  align-content: start;
  padding-right: 2px;
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

.panel--compact {
  padding: 16px 18px;
  display: grid;
  gap: 14px;
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

.query-hint {
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 13px;
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

.preview-resizer {
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: row-resize;
  touch-action: none;
  user-select: none;
}

.preview-resizer__grip {
  width: 56px;
  height: 4px;
  border-radius: 999px;
  background: var(--border);
  transition: background 0.2s ease;
}

.preview-resizer__hint {
  font-size: 11px;
  color: var(--text);
  opacity: 0.75;
}

.preview-resizer:hover .preview-resizer__grip,
.preview-resizer--active .preview-resizer__grip {
  background: var(--accent);
}

.preview-table-shell {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
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

  .preview-resizer__hint {
    display: none;
  }
}
</style>
