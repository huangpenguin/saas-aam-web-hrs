import { describe, expect, it } from 'vitest'
import { isApiProblem, unwrapEnvelope } from './hrsClient'

describe('HRS API envelope', () => {
  it('unwraps successful data', () => {
    expect(
      unwrapEnvelope({ success: true, code: 'HRS_OK', message: '', data: { id: '1' }, requestId: 'req-1' }),
    ).toEqual({ id: '1' })
  })

  it('recognizes the documented problem shape', () => {
    expect(isApiProblem({ success: false, code: 'HRS_VERSION_CONFLICT', message: '', data: null, requestId: 'req-2' })).toBe(true)
  })
})
