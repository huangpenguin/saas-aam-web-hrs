import { parse } from 'mathjs'
import type { OperatorNode, SymbolNode } from 'mathjs'

const allowedNodeTypes = new Set(['OperatorNode', 'ParenthesisNode', 'SymbolNode', 'ConstantNode'])
const allowedOperators = new Set(['+', '-', '*', '/'])
const compiledFormulaCache = new Map<
  string,
  {
    compiled: {
      evaluate(scope: Record<string, number>): unknown
    }
    symbolNames: string[]
  }
>()

function compilePayrollFormula(formula: string) {
  const cached = compiledFormulaCache.get(formula)
  if (cached) {
    return cached
  }

  const node = parse(formula)
  const symbolNames = new Set<string>()

  node.traverse((child) => {
    if (!allowedNodeTypes.has(child.type)) {
      throw new Error(`Unsupported formula syntax: ${child.type}`)
    }

    if (child.type === 'OperatorNode') {
      const operatorNode = child as OperatorNode
      if (!allowedOperators.has(operatorNode.op)) {
        throw new Error(`Unsupported operator: ${operatorNode.op}`)
      }
    }

    if (child.type === 'SymbolNode') {
      const symbolNode = child as SymbolNode
      symbolNames.add(symbolNode.name)
    }
  })

  const cachedFormula = {
    compiled: node.compile(),
    symbolNames: [...symbolNames],
  }
  compiledFormulaCache.set(formula, cachedFormula)
  return cachedFormula
}

export function evaluatePayrollFormula(formula: string, scope: Record<string, number>): number {
  const { compiled, symbolNames } = compilePayrollFormula(formula)
  symbolNames.forEach((symbolName) => {
    if (!(symbolName in scope)) {
      throw new Error(`Unknown payroll field: ${symbolName}`)
    }
  })

  const value: unknown = compiled.evaluate(scope)
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Formula result must be a finite number')
  }

  return Math.round(value)
}
