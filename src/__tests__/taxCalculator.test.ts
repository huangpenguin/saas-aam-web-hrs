import { describe, expect, it } from 'vitest'
import {
  calculateEmploymentInsurancePremium,
  calculateNursingCareInsurancePremium,
  shouldApplyEmploymentInsurance,
  shouldApplyNursingCareInsurance,
} from '@/utils/taxCalculator'

describe('taxCalculator', () => {
  it('applies employment insurance from 20 weekly hours', () => {
    expect(shouldApplyEmploymentInsurance(19.5)).toBe(false)
    expect(shouldApplyEmploymentInsurance(20)).toBe(true)
    expect(calculateEmploymentInsurancePremium(200000, 20)).toBe(1000)
  })

  it('applies nursing care insurance for ages 40 to 64', () => {
    expect(shouldApplyNursingCareInsurance(39)).toBe(false)
    expect(shouldApplyNursingCareInsurance(40)).toBe(true)
    expect(shouldApplyNursingCareInsurance(64)).toBe(true)
    expect(shouldApplyNursingCareInsurance(65)).toBe(false)
    expect(calculateNursingCareInsurancePremium(300000, 42)).toBe(2430)
  })
})
