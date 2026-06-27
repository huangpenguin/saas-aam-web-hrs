import type { EmploymentType, TaxCategory } from '@/types/payroll'

export const QUERY_YEARS = ['2025', '2026', '2027'] as const

export const QUERY_MONTHS = Array.from({ length: 12 }, (_, index) => String(index + 1))

/** 空字符串表示「全部」 */
export const EMPLOYMENT_TYPE_FILTER_VALUES = ['', 'partTime', 'fullTime'] as const
export type EmploymentTypeFilter = (typeof EMPLOYMENT_TYPE_FILTER_VALUES)[number]

export const TAX_CATEGORY_FILTER_VALUES = ['', 'kou', 'otsu'] as const
export type TaxCategoryFilter = (typeof TAX_CATEGORY_FILTER_VALUES)[number]

export function isEmploymentTypeFilter(value: string): value is EmploymentType {
  return value === 'partTime' || value === 'fullTime'
}

export function isTaxCategoryFilter(value: string): value is TaxCategory {
  return value === 'kou' || value === 'otsu'
}
