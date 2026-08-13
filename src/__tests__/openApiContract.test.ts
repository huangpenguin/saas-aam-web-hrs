import { describe, expect, it } from 'vitest'
import source from '../../docs/api/openapi/hrs-v1.yaml?raw'

describe('HRS OpenAPI contract', () => {
  it('declares OpenAPI 3.1 and the versioned base path', () => {
    expect(source).toContain('openapi: 3.1.0')
    expect(source).toContain('url: /api/hrs/v1')
  })

  it('uses unique operation ids for the complete module surface', () => {
    const operationIds = [...source.matchAll(/^\s+operationId:\s+(\S+)$/gm)].map((match) => match[1])
    expect(operationIds.length).toBeGreaterThanOrEqual(100)
    expect(new Set(operationIds).size).toBe(operationIds.length)
  })

  it('defines security, money, versioning, jobs and the critical state enums', () => {
    expect(source).toContain('bearerFormat: JWT')
    expect(source).toContain('Idempotency-Key')
    expect(source).toContain('SalaryConfirmationStatus:')
    expect(source).toContain('NenchoDeclarationStatus:')
    expect(source).toContain('Money:')
    expect(source).toContain('AsyncJob:')
  })
})
