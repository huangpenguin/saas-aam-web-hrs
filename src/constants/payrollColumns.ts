import type { PayrollColumnConfig, SalaryDetailColumn } from '@/types/table'

export function formatCurrency(value: string | number | null): string {
  if (typeof value !== 'number') {
    return value === null ? '-' : value
  }

  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value)
}

export const partTimeColumns: PayrollColumnConfig[] = [
  {
    id: 'basic',
    groupKey: 'basic',
    children: [
      { id: 'employeeNo', field: 'employeeNo', width: 120, fixed: 'left' },
      { id: 'name', field: 'name', width: 140, fixed: 'left' },
      { id: 'taxCategory', field: 'taxCategory', width: 100 },
    ],
  },
  {
    id: 'attendance',
    groupKey: 'attendance',
    children: [
      { id: 'attendanceDays', field: 'attendanceDays', width: 110 },
      { id: 'totalWorkingHours', field: 'totalWorkingHours', width: 120 },
    ],
  },
  {
    id: 'payment',
    groupKey: 'paymentDeduction',
    children: [
      { id: 'baseSalary', field: 'baseSalary', width: 120 },
      { id: 'nonTaxableCommutingAllowance', field: 'nonTaxableCommutingAllowance', width: 140 },
      { id: 'withholdingIncomeTax', field: 'withholdingIncomeTax', width: 130 },
      { id: 'netPay', field: 'netPay', width: 130, fixed: 'right' },
    ],
  },
]

export const fullTimeColumns: PayrollColumnConfig[] = [
  {
    id: 'basic',
    groupKey: 'basic',
    children: [
      { id: 'employeeNo', field: 'employeeNo', width: 120, fixed: 'left' },
      { id: 'name', field: 'name', width: 140, fixed: 'left' },
      { id: 'age', field: 'age', width: 80 },
    ],
  },
  {
    id: 'payments',
    groupKey: 'payments',
    children: [
      { id: 'baseSalary', field: 'baseSalary', width: 120 },
      { id: 'positionAllowance', field: 'positionAllowance', width: 120 },
      { id: 'housingAllowance', field: 'housingAllowance', width: 120 },
      { id: 'commutingAllowance', field: 'commutingAllowance', width: 120 },
    ],
  },
  {
    id: 'deductions',
    groupKey: 'deductions',
    children: [
      { id: 'healthInsurancePremium', field: 'healthInsurancePremium', width: 130 },
      { id: 'welfarePensionPremium', field: 'welfarePensionPremium', width: 150 },
      { id: 'employmentInsurancePremium', field: 'employmentInsurancePremium', width: 130 },
      { id: 'nursingCareInsurancePremium', field: 'nursingCareInsurancePremium', width: 130 },
      { id: 'withholdingIncomeTax', field: 'withholdingIncomeTax', width: 130 },
      { id: 'residentTax', field: 'residentTax', width: 120 },
    ],
  },
  {
    id: 'summary',
    groupKey: 'summary',
    children: [
      { id: 'grossPay', field: 'grossPay', width: 120 },
      { id: 'totalDeductions', field: 'totalDeductions', width: 120 },
      { id: 'netPay', field: 'netPay', width: 130, fixed: 'right' },
    ],
  },
]

/** @deprecated Use getDefaultSalaryDetailColumns from queryResultTable */
export function getLegacySalaryDetailColumns(): SalaryDetailColumn[] {
  return ['baseSalary', 'bonus', 'tax'].map((field) => ({
    field,
    title: field,
    formatter: formatCurrency,
    editable: true,
  }))
}
