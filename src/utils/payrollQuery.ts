import type { MonthlySalaryDetailsRequest } from '@/types/payroll'
import { translateColumnField, translateEnumValue } from '@/utils/columnLabels'

export function buildQuerySummary(query: MonthlySalaryDetailsRequest): string {
  const parts = [`year='${query.year}'`, `month='${query.month}'`]

  if (query.uid) {
    parts.push(`uid='${query.uid}'`)
  }

  if (query.employmentType) {
    const label =
      translateEnumValue('employmentType', query.employmentType) ?? query.employmentType
    parts.push(`${translateColumnField('employmentType')}='${label}'`)
  }

  if (query.taxCategory) {
    const label = translateEnumValue('taxCategory', query.taxCategory) ?? query.taxCategory
    parts.push(`${translateColumnField('taxCategory')}='${label}'`)
  }

  return `WHERE ${parts.join(' AND ')}`
}

export function normalizeMonthlySalaryQuery(
  payload: MonthlySalaryDetailsRequest,
): MonthlySalaryDetailsRequest {
  const normalized: MonthlySalaryDetailsRequest = {
    year: payload.year,
    month: payload.month,
  }

  const uid = payload.uid?.trim()
  if (uid) {
    normalized.uid = uid
  }

  if (payload.employmentType) {
    normalized.employmentType = payload.employmentType
  }

  if (payload.taxCategory && payload.employmentType !== 'fullTime') {
    normalized.taxCategory = payload.taxCategory
  }

  return normalized
}
