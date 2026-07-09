import type { CalculatorFn } from '../types'
import {
  round,
  formatCurrency,
  formatPercent,
  formatNumber,
  rateEquivalent as rateEq,
  pv,
  fv,
} from '../math'

export const simpleInterest: CalculatorFn = (inputs) => {
  const principal = inputs.principal ?? 0
  const rate = (inputs.rate ?? 0) / 100
  const time = inputs.time ?? 0
  const interest = principal * rate * time
  const amount = principal + interest

  return [
    {
      label: 'Montante final',
      value: formatCurrency(amount),
      rawValue: round(amount),
      highlight: true,
      description: 'Principal + Juros',
    },
    {
      label: 'Juros',
      value: formatCurrency(interest),
      rawValue: round(interest),
      description: 'Rendimento no período',
    },
    {
      label: 'Principal',
      value: formatCurrency(principal),
      rawValue: round(principal),
    },
    {
      label: 'Taxa de juros',
      value: formatPercent(inputs.rate ?? 0),
      rawValue: round(inputs.rate ?? 0),
    },
    {
      label: 'Período',
      value: `${formatNumber(time, 1)} períodos`,
      rawValue: time,
    },
  ]
}

export const compoundInterest: CalculatorFn = (inputs) => {
  const principal = inputs.principal ?? 0
  const rate = (inputs.rate ?? 0) / 100
  const time = inputs.time ?? 0
  const frequency = inputs.frequency ?? 12

  const n = time * frequency
  const ratePerPeriod = rateEquivalent(rate, 1, frequency)
  const amount = principal * (1 + ratePerPeriod) ** n
  const interest = amount - principal

  return [
    {
      label: 'Montante final',
      value: formatCurrency(amount),
      rawValue: round(amount),
      highlight: true,
      description: 'Principal + Juros compostos',
    },
    {
      label: 'Juros compostos',
      value: formatCurrency(interest),
      rawValue: round(interest),
    },
    {
      label: 'Principal',
      value: formatCurrency(principal),
      rawValue: round(principal),
    },
    {
      label: 'Taxa anual',
      value: formatPercent(inputs.rate ?? 0),
      rawValue: round(inputs.rate ?? 0),
    },
    {
      label: 'Capitalizações',
      value: formatNumber(n, 0),
      rawValue: n,
      description: `${formatNumber(frequency, 0)}× ao ano por ${formatNumber(time, 1)} anos`,
    },
  ]
}

export const rateConverter: CalculatorFn = (inputs) => {
  const rate = (inputs.rate ?? 0) / 100
  const fromPeriods = inputs.fromPeriods ?? 12
  const toPeriods = inputs.toPeriods ?? 1

  const equivalentRate = rateEq(rate, fromPeriods, toPeriods)
  const equivalentRatePct = equivalentRate * 100

  const periodNames: Record<number, string> = {
    1: 'Anual',
    2: 'Semestral',
    4: 'Trimestral',
    12: 'Mensal',
    252: 'Diária (dias úteis)',
    360: 'Diária',
  }

  return [
    {
      label: `Taxa ${periodNames[toPeriods] || toPeriods + ' períodos/ano'}`,
      value: formatPercent(equivalentRatePct),
      rawValue: round(equivalentRatePct),
      highlight: true,
    },
    {
      label: 'Taxa original',
      value: formatPercent(inputs.rate ?? 0),
      rawValue: round(inputs.rate ?? 0),
      description: periodNames[fromPeriods] || `${fromPeriods} períodos/ano`,
    },
    {
      label: 'Fator de conversão',
      value: formatNumber(equivalentRate + 1, 6),
      rawValue: round(equivalentRate, 6),
    },
  ]
}

export const presentValue: CalculatorFn = (inputs) => {
  const futureValue = inputs.futureValue ?? 0
  const rate = (inputs.rate ?? 0) / 100
  const periods = inputs.periods ?? 0

  const presentVal = pv(rate, periods, 0, -futureValue)
  const discount = futureValue - presentVal

  return [
    {
      label: 'Valor presente',
      value: formatCurrency(presentVal),
      rawValue: round(presentVal),
      highlight: true,
      description: `Descontado a ${formatPercent(inputs.rate ?? 0)} por ${formatNumber(periods, 0)} períodos`,
    },
    {
      label: 'Valor futuro',
      value: formatCurrency(futureValue),
      rawValue: round(futureValue),
    },
    {
      label: 'Desconto',
      value: formatCurrency(discount),
      rawValue: round(discount),
      description: 'Diferença entre VF e VP',
    },
  ]
}

export const futureValue: CalculatorFn = (inputs) => {
  const presentValueVal = inputs.presentValue ?? 0
  const rate = (inputs.rate ?? 0) / 100
  const periods = inputs.periods ?? 0

  const futureVal = fv(rate, periods, 0, -presentValueVal)
  const gain = futureVal - presentValueVal

  return [
    {
      label: 'Valor futuro',
      value: formatCurrency(futureVal),
      rawValue: round(futureVal),
      highlight: true,
      description: `Capitalizado a ${formatPercent(inputs.rate ?? 0)} por ${formatNumber(periods, 0)} períodos`,
    },
    {
      label: 'Valor presente',
      value: formatCurrency(presentValueVal),
      rawValue: round(presentValueVal),
    },
    {
      label: 'Rendimento',
      value: formatCurrency(gain),
      rawValue: round(gain),
    },
  ]
}
