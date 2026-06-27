import { describe, expect, it } from 'vitest'
import { evaluatePayrollFormula } from '@/utils/formulaEvaluator'

describe('evaluatePayrollFormula', () => {
  it('evaluates allowed arithmetic formulas', () => {
    expect(
      evaluatePayrollFormula('(baseSalary + commutingAllowance) * 0.1', {
        baseSalary: 300000,
        commutingAllowance: 10000,
      }),
    ).toBe(31000)
  })

  it('rejects unknown symbols', () => {
    expect(() =>
      evaluatePayrollFormula('baseSalary + unknownAllowance', {
        baseSalary: 300000,
      }),
    ).toThrow('Unknown payroll field')
  })

  it('rejects function calls', () => {
    expect(() =>
      evaluatePayrollFormula('sqrt(baseSalary)', {
        baseSalary: 300000,
      }),
    ).toThrow('Unsupported formula syntax')
  })
})
