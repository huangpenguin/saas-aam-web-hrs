import { parse } from 'mathjs'
import type { OperatorNode, SymbolNode } from 'mathjs'

const allowedNodeTypes = new Set(['OperatorNode', 'ParenthesisNode', 'SymbolNode', 'ConstantNode'])
const allowedOperators = new Set(['+', '-', '*', '/'])

export function evaluatePayrollFormula(formula: string, scope: Record<string, number>): number {
  const node = parse(formula)

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
      if (!(symbolNode.name in scope)) {
        throw new Error(`Unknown payroll field: ${symbolNode.name}`)
      }
    }
  })

  const value: unknown = node.compile().evaluate(scope)
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Formula result must be a finite number')
  }

  return Math.round(value)
}
