export type HrsLocale = 'ja-JP' | 'zh-CN'
export type EmployeeStatus = 'ACTIVE' | 'RESIGNED' | 'SUSPENDED'
export type AttendanceDayState = 'NOT_STARTED' | 'WORKING' | 'ON_BREAK' | 'COMPLETED'
export type AttendanceEventType = 'CLOCK_IN' | 'BREAK_START' | 'BREAK_END' | 'CLOCK_OUT'
export type SalaryPeriodStatus = 'PENDING' | 'CALCULATING' | 'CALCULATED' | 'FINALIZED'
export type NenchoDeclarationStatus = 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'RETURNED'

export interface HrsEmployee {
  id: string
  employeeNo: string
  name: string
  nameKana: string
  department: string
  position: string
  employmentType: string
  status: EmployeeStatus
  maskedBankAccountNumber: string
  updatedAt: string
  version: number
}

export interface AttendanceEvent {
  id: string
  type: AttendanceEventType
  occurredAt: string
}

export interface SalarySummary {
  employeeId: string
  employeeName: string
  department: string
  salaryType: string
  confirmationStatus: 'UNCONFIRMED' | 'CONFIRMED_BY_EMPLOYEE' | 'AUTO_CONFIRMED'
  status: SalaryPeriodStatus
  netPay: string
}

export interface ApiEnvelope<T> {
  success: true
  code: 'HRS_OK'
  message: string
  data: T
  requestId: string
}

export interface ApiProblem {
  success: false
  code: string
  message: string
  data: null
  errors?: Array<{ field?: string; reason: string }>
  requestId: string
}
