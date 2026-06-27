import { evaluatePayrollFormula } from '@/utils/formulaEvaluator'
import type { PayrollRow } from '@/types/payroll'

export function usePayrollFormula() {
  function evaluateForRow(formula: string, row: PayrollRow): number {
    return evaluatePayrollFormula(formula, buildNumericScope(row))
  }

  return {
    evaluateForRow,
  }
}

function buildNumericScope(row: PayrollRow): Record<string, number> {
  return Object.entries(row).reduce<Record<string, number>>((scope, [key, value]) => {
    if (typeof value === 'number') {
      scope[key] = value
    }

    return scope
  }, {})
}
