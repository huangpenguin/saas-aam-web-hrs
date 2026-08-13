<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import type { AttendanceDayState, AttendanceEvent, AttendanceEventType } from '@/types/hrs'

const { t } = useTranslation('hrs')
const now = ref(new Date())
const state = ref<AttendanceDayState>('NOT_STARTED')
const events = ref<AttendanceEvent[]>([])
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => (now.value = new Date()), 1000)
})
onUnmounted(() => window.clearInterval(timer))

const time = computed(() => new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now.value))
const date = computed(() => new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' }).format(now.value))
const stateLabel = computed(() => ({ NOT_STARTED: t('status.notStarted'), WORKING: t('status.working'), ON_BREAK: t('status.onBreak'), COMPLETED: t('status.completed') })[state.value])
const nextActions = computed<AttendanceEventType[]>(() => ({ NOT_STARTED: ['CLOCK_IN'], WORKING: ['BREAK_START', 'CLOCK_OUT'], ON_BREAK: ['BREAK_END'], COMPLETED: [] })[state.value] as AttendanceEventType[])

function actionLabel(action: AttendanceEventType): string {
  return ({ CLOCK_IN: t('dashboard.clockIn'), BREAK_START: t('dashboard.breakStart'), BREAK_END: t('dashboard.breakEnd'), CLOCK_OUT: t('dashboard.clockOut') })[action]
}

function record(action: AttendanceEventType): void {
  events.value.push({ id: crypto.randomUUID(), type: action, occurredAt: now.value.toISOString() })
  state.value = ({ CLOCK_IN: 'WORKING', BREAK_START: 'ON_BREAK', BREAK_END: 'WORKING', CLOCK_OUT: 'COMPLETED' } as const)[action]
}
</script>

<template>
  <div class="page-stack">
    <PageHeader :title="`${t('dashboard.title')}、山田さん`" :subtitle="t('dashboard.subtitle')" eyebrow="2026 / 08 / 13" />
    <div class="dashboard-grid">
      <section class="card attendance-hero">
        <div class="card-heading"><div><p>{{ t('dashboard.attendanceTitle') }}</p><h2>{{ date }}</h2></div><StatusBadge :tone="state === 'WORKING' ? 'success' : state === 'ON_BREAK' ? 'warning' : 'neutral'">{{ stateLabel }}</StatusBadge></div>
        <div class="clock-display"><small>{{ t('dashboard.currentTime') }}</small><strong>{{ time }}</strong></div>
        <div class="punch-actions">
          <button v-for="action in nextActions" :key="action" class="button" :class="action === 'CLOCK_IN' || action === 'CLOCK_OUT' ? 'button--primary' : 'button--secondary'" @click="record(action)">{{ actionLabel(action) }}</button>
          <p v-if="nextActions.length === 0">{{ t('status.completed') }} · {{ events.length }} events</p>
        </div>
      </section>

      <section class="card monthly-card">
        <div class="card-heading"><div><p>{{ t('dashboard.monthlyTitle') }}</p><h2>2026年8月</h2></div><RouterLink to="/attendance">{{ t('actions.details') }} →</RouterLink></div>
        <div class="metric-row"><div><span>{{ t('dashboard.workDays') }}</span><strong>9<small> / 20日</small></strong></div><div><span>{{ t('dashboard.overtime') }}</span><strong>4:30</strong></div><div><span>{{ t('dashboard.paidLeave') }}</span><strong>1<small> 日</small></strong></div></div>
      </section>

      <section class="card salary-card">
        <div><p>{{ t('dashboard.salaryTitle') }}</p><h2>¥286,420</h2><span>{{ t('dashboard.salaryNote') }}</span></div>
        <RouterLink class="button button--secondary" to="/salary/self">{{ t('actions.details') }}</RouterLink>
      </section>

      <section class="card todo-card">
        <div class="card-heading"><div><p>{{ t('dashboard.todoTitle') }}</p><h2>3 {{ t('commonUi.records') }}</h2></div></div>
        <ul class="todo-list"><li><span class="todo-icon todo-icon--orange">!</span><div><strong>勤怠の打刻漏れ</strong><small>8月7日の退勤時刻を確認してください</small></div><span>›</span></li><li><span class="todo-icon todo-icon--blue">¥</span><div><strong>給与明細の確認</strong><small>確認期限 8月20日</small></div><span>›</span></li><li><span class="todo-icon todo-icon--green">✓</span><div><strong>年末調整の事前確認</strong><small>対象情報を確認できます</small></div><span>›</span></li></ul>
      </section>
    </div>
  </div>
</template>
