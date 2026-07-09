import type { CalculatorFn } from '../types'
import { round, formatCurrency, formatPercent, formatNumber, rateEquivalent } from '../math'

/**
 * CDB calculator following Brazilian rules.
 *
 * CDI reference rate: 13.65% per year (default)
 * IR regressive table:
 *   - Up to 180 days: 22.5%
 *   - 181 to 360 days: 20%
 *   - 361 to 720 days: 17.5%
 *   - Over 720 days: 15%
 */
function getIRAliquot(days: number): number {
  if (days <= 180) return 22.5
  if (days <= 360) return 20
  if (days <= 720) return 17.5
  return 15
}

export const cdb: CalculatorFn = (inputs) => {
  const initial = inputs.initial ?? 0
  const monthlyDeposit = inputs.monthlyDeposit ?? 0
  const cdiPct = (inputs.cdiPct ?? 100) / 100 // % of CDI
  const months = Math.round(inputs.months ?? 0)

  // CDI annual reference: 13.65%
  const cdiAnnual = 0.1365
  // Convert annual CDI rate to monthly
  const cdiMonthly = rateEquivalent(cdiAnnual, 1, 12)
  const effectiveMonthlyRate = cdiMonthly * cdiPct

  const days = months * 30
  const irAliquot = getIRAliquot(days)

  let totalInvested = initial
  let balance = initial

  for (let i = 0; i < months; i++) {
    balance = balance * (1 + effectiveMonthlyRate) + monthlyDeposit
    totalInvested += monthlyDeposit
  }

  const grossInterest = balance - totalInvested
  const irTax = grossInterest * (irAliquot / 100)
  const netBalance = balance - irTax
  const netInterest = grossInterest - irTax

  return [
    {
      label: 'Valor líquido',
      value: formatCurrency(netBalance),
      rawValue: round(netBalance),
      highlight: true,
      description: 'Após IR',
    },
    {
      label: 'Valor bruto',
      value: formatCurrency(balance),
      rawValue: round(balance),
    },
    {
      label: 'Total investido',
      value: formatCurrency(totalInvested),
      rawValue: round(totalInvested),
    },
    {
      label: 'Rendimento bruto',
      value: formatCurrency(grossInterest),
      rawValue: round(grossInterest),
    },
    {
      label: 'IR retido',
      value: formatCurrency(irTax),
      rawValue: round(irTax),
      description: `Alíquota de ${formatPercent(irAliquot)} (${Math.round(days)} dias)`,
    },
    {
      label: 'Rendimento líquido',
      value: formatCurrency(netInterest),
      rawValue: round(netInterest),
    },
    {
      label: 'Rentabilidade líquida',
      value: formatPercent(totalInvested > 0 ? (netInterest / totalInvested) * 100 : 0),
      rawValue: round(totalInvested > 0 ? (netInterest / totalInvested) * 100 : 0),
    },
  ]
}

export const compoundGrowth: CalculatorFn = (inputs) => {
  const initial = inputs.initial ?? 0
  const monthly = inputs.monthly ?? 0
  const annualRate = (inputs.rate ?? 0) / 100
  const years = inputs.years ?? 0

  const months = years * 12
  const monthlyRate = rateEquivalent(annualRate, 1, 12)

  let balance = initial
  let totalInvested = initial

  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthly
    totalInvested += monthly
  }

  const totalInterest = balance - totalInvested

  return [
    {
      label: 'Montante final',
      value: formatCurrency(balance),
      rawValue: round(balance),
      highlight: true,
      description: 'Valor total acumulado',
    },
    {
      label: 'Total investido',
      value: formatCurrency(totalInvested),
      rawValue: round(totalInvested),
    },
    {
      label: 'Total em juros',
      value: formatCurrency(totalInterest),
      rawValue: round(totalInterest),
    },
    {
      label: 'Rentabilidade',
      value: formatPercent(totalInvested > 0 ? (totalInterest / totalInvested) * 100 : 0),
      rawValue: round(totalInvested > 0 ? (totalInterest / totalInvested) * 100 : 0),
      description: 'Retorno sobre o total investido',
    },
    {
      label: 'Aportes mensais',
      value: formatCurrency(monthly),
      rawValue: round(monthly),
    },
    {
      label: 'Período',
      value: `${formatNumber(years, 1)} anos (${formatNumber(months, 0)} meses)`,
      rawValue: months,
    },
  ]
}
