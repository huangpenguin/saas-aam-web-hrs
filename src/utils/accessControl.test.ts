import { describe, expect, it } from 'vitest'
import { permissionMatches, resolveEffectivePermissions } from './accessControl'

describe('access control', () => {
  it('merges roles and grants, then applies revocations', () => {
    expect(
      resolveEffectivePermissions(
        [{ permissions: ['HRS:SALARY:ADMIN', 'HRS:SALARY:CALC'] }],
        ['HRS:ATTENDANCE:PUNCH'],
        ['HRS:SALARY:CALC'],
      ),
    ).toEqual(['HRS:ATTENDANCE:PUNCH', 'HRS:SALARY:ADMIN'])
  })

  it('accepts a module-level parent permission', () => {
    expect(permissionMatches(['HRS:SALARY'], 'HRS:SALARY:ADMIN')).toBe(true)
    expect(permissionMatches(['HRS:LEAVE:APPLY'], 'HRS:SALARY:ADMIN')).toBe(false)
  })
})
