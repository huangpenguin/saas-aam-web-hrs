import i18next from '@/i18n'

export function translateColumnField(field: string): string {
  return i18next.t(`fields.${field}`, {
    ns: 'columns',
    defaultValue: field,
  })
}

export function translateColumnGroup(groupKey: string): string {
  return i18next.t(`groups.${groupKey}`, {
    ns: 'columns',
    defaultValue: groupKey,
  })
}

export function translatePayrollMessage(key: string, options?: Record<string, unknown>): string {
  return i18next.t(key, {
    ns: 'payroll',
    ...options,
  })
}

export function translateCommonMessage(key: string, options?: Record<string, unknown>): string {
  return i18next.t(key, {
    ns: 'common',
    ...options,
  })
}

export function translateEnumValue(field: string, value: string): string | null {
  const translated = i18next.t(`enums.${field}.${value}`, {
    ns: 'columns',
    defaultValue: '',
  })

  return translated || null
}

/** 表头：标准字段走 i18n，公式列/用户自定义列保留原 title */
export function resolvePreviewColumnTitle(column: {
  field: string
  title: string
  formula?: string
}): string {
  if (column.formula || column.field.startsWith('custom_formula_')) {
    return column.title
  }

  if (column.field.startsWith('custom_remark_')) {
    return translatePayrollMessage('remarkColumn')
  }

  const translated = translateColumnField(column.field)
  if (translated !== column.field) {
    return translated
  }

  return column.title || column.field
}
