import type { CalculatorFn } from '../types'
import { round, formatCurrency, formatPercent, formatNumber } from '../math'

/**
 * INSS 2024 progressive brackets (Brazilian Social Security).
 */
interface InssBracket {
  cap: number
  rate: number
}

const INSS_BRACKETS: InssBracket[] = [
  { cap: 1412.0, rate: 0.075 },
  { cap: 2666.68, rate: 0.09 },
  { cap: 4000.03, rate: 0.12 },
  { cap: 7786.02, rate: 0.14 },
]

const INSS_CEILING = 908.85

function calculateInss(salary: number): { total: number; effectiveRate: number; ceilingHit: boolean } {
  let remaining = salary
  let total = 0
  let prevCap = 0

  for (const bracket of INSS_BRACKETS) {
    if (remaining <= 0) break
    const bracketRange = bracket.cap - prevCap
    const taxableInBracket = Math.min(remaining, bracketRange)
    total += taxableInBracket * bracket.rate
    remaining -= taxableInBracket
    prevCap = bracket.cap
  }

  // Apply ceiling
  const capped = Math.min(total, INSS_CEILING)
  const effectiveRate = salary > 0 ? (capped / salary) * 100 : 0

  return {
    total: round(capped),
    effectiveRate: round(effectiveRate, 1),
    ceilingHit: total > INSS_CEILING,
  }
}

/**
 * IRPF 2024 monthly brackets (Brazilian Income Tax).
 */
interface IrpfBracket {
  cap: number
  rate: number
  deduction: number
}

const IRPF_BRACKETS: IrpfBracket[] = [
  { cap: 2259.2, rate: 0, deduction: 0 },
  { cap: 2826.65, rate: 0.075, deduction: 169.44 },
  { cap: 3751.05, rate: 0.15, deduction: 381.44 },
  { cap: 4664.68, rate: 0.225, deduction: 662.77 },
  { cap: Infinity, rate: 0.275, deduction: 896.0 },
]

const DEPENDENT_DEDUCTION = 189.59 // per dependent, monthly

function calculateIrpf(
  monthlySalary: number,
  dependents: number,
  otherDeductions: number,
): { tax: number; effectiveRate: number; aliquot: number } {
  const dependentDeduction = dependents * DEPENDENT_DEDUCTION
  const totalDeductions = dependentDeduction + otherDeductions

  // INSS is also deductible from IRPF base
  const inssResult = calculateInss(monthlySalary)

  const taxableBase = Math.max(0, monthlySalary - inssResult.total - totalDeductions)

  // Find applicable bracket
  let tax = 0
  let applicableRate = 0

  for (const bracket of IRPF_BRACKETS) {
    if (taxableBase <= bracket.cap) {
      tax = Math.max(0, taxableBase * bracket.rate - bracket.deduction)
      applicableRate = bracket.rate
      break
    }
  }

  const effectiveRate = monthlySalary > 0 ? (tax / monthlySalary) * 100 : 0

  return {
    tax: round(tax),
    effectiveRate: round(effectiveRate, 1),
    aliquot: applicableRate * 100,
  }
}

export const inss: CalculatorFn = (inputs) => {
  const salary = inputs.salary ?? 0
  const result = calculateInss(salary)

  return [
    {
      label: 'Desconto INSS',
      value: formatCurrency(result.total),
      rawValue: result.total,
      highlight: true,
      description: result.ceilingHit
        ? 'Atingiu o teto de contribuição'
        : 'Contribuição mensal',
    },
    {
      label: 'Salário líquido (após INSS)',
      value: formatCurrency(salary - result.total),
      rawValue: round(salary - result.total),
      highlight: true,
    },
    {
      label: 'Alíquota efetiva',
      value: formatPercent(result.effectiveRate),
      rawValue: result.effectiveRate,
      description: 'Percentual real descontado',
    },
    {
      label: 'Salário bruto',
      value: formatCurrency(salary),
      rawValue: round(salary),
    },
    {
      label: 'Teto INSS',
      value: formatCurrency(INSS_CEILING),
      rawValue: INSS_CEILING,
      description: 'Valor máximo de contribuição mensal',
    },
  ]
}

export const irpf: CalculatorFn = (inputs) => {
  const salary = inputs.salary ?? 0
  const dependents = Math.round(inputs.dependents ?? 0)
  const deductions = inputs.deductions ?? 0

  const inssResult = calculateInss(salary)
  const irpfResult = calculateIrpf(salary, dependents, deductions)

  const netSalary = salary - inssResult.total - irpfResult.tax
  const totalTax = inssResult.total + irpfResult.tax

  return [
    {
      label: 'IRPF a pagar',
      value: irpfResult.tax === 0 ? 'Isento' : formatCurrency(irpfResult.tax),
      rawValue: irpfResult.tax,
      highlight: true,
      description:
        irpfResult.tax === 0
          ? 'Base de cálculo dentro da faixa de isenção'
          : `Alíquota de ${formatPercent(irpfResult.aliquot)}`,
    },
    {
      label: 'Salário líquido',
      value: formatCurrency(netSalary),
      rawValue: round(netSalary),
      highlight: true,
      description: 'Após INSS e IRPF',
    },
    {
      label: 'Total de impostos',
      value: formatCurrency(totalTax),
      rawValue: round(totalTax),
      description: 'INSS + IRPF',
    },
    {
      label: 'Taxa efetiva total',
      value: formatPercent(salary > 0 ? (totalTax / salary) * 100 : 0),
      rawValue: round(salary > 0 ? (totalTax / salary) * 100 : 0),
    },
    {
      label: 'Base de cálculo IRPF',
      value: formatCurrency(Math.max(0, salary - inssResult.total - dependents * DEPENDENT_DEDUCTION - deductions)),
      rawValue: round(Math.max(0, salary - inssResult.total - dependents * DEPENDENT_DEDUCTION - deductions)),
      description: 'Salário - INSS - Dependentes - Deduções',
    },
    {
      label: 'Salário bruto',
      value: formatCurrency(salary),
      rawValue: round(salary),
    },
  ]
}

export const fgts: CalculatorFn = (inputs) => {
  const salary = inputs.salary ?? 0
  const fgtsRate = 0.08
  const monthlyDeposit = salary * fgtsRate
  const annualDeposit = monthlyDeposit * 12
  // 13th salary also generates FGTS
  const thirteenthDeposit = salary * fgtsRate
  const totalAnnual = annualDeposit + thirteenthDeposit

  return [
    {
      label: 'Depósito mensal FGTS',
      value: formatCurrency(monthlyDeposit),
      rawValue: round(monthlyDeposit),
      highlight: true,
      description: '8% do salário bruto',
    },
    {
      label: 'Depósito anual (12 meses)',
      value: formatCurrency(annualDeposit),
      rawValue: round(annualDeposit),
    },
    {
      label: 'Depósito 13º salário',
      value: formatCurrency(thirteenthDeposit),
      rawValue: round(thirteenthDeposit),
    },
    {
      label: 'Total anual (incl. 13º)',
      value: formatCurrency(totalAnnual),
      rawValue: round(totalAnnual),
      highlight: true,
    },
    {
      label: 'Salário base',
      value: formatCurrency(salary),
      rawValue: round(salary),
    },
    {
      label: 'Alíquota FGTS',
      value: '8%',
      rawValue: 8,
    },
  ]
}
