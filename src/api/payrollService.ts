import { httpClient } from './httpClient'
import { queryMockMonthlySalaryDetails } from '@/mocks/payrollMock'
import { translatePayrollMessage } from '@/utils/columnLabels'
import type {
  ApiResponse,
  MonthlySalaryDetailsData,
  MonthlySalaryDetailsRequest,
} from '@/types/payroll'

const switchMock = import.meta.env.VITE_SWITCH_MOCK !== 'false'

function delayMockResponse<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), 250)
  })
}

export async function fetchMonthlySalaryDetails(
  payload: MonthlySalaryDetailsRequest,
): Promise<MonthlySalaryDetailsData[]> {
  if (switchMock) {
    const records = queryMockMonthlySalaryDetails(payload)
    if (records.length === 0) {
      throw new Error(translatePayrollMessage('mockNotFound'))
    }

    return delayMockResponse(records)
  }

  const response = await httpClient.post<ApiResponse<MonthlySalaryDetailsData>>(
    '/salary/monthly-details',
    payload,
  )

  if (!response.data.success) {
    throw new Error(response.data.message)
  }

  return [response.data.data]
}

export function isMockModeEnabled(): boolean {
  return switchMock
}
