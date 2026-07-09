import type { CalculatorFn } from '../types'
import { round, formatPercent, formatCurrency, formatNumber } from '../math'

export const percentOf: CalculatorFn = (inputs) => {
  const x = inputs.x ?? 0
  const y = inputs.y ?? 0
  const result = (x / 100) * y

  return [
    {
      label: `${formatPercent(x)} de ${formatNumber(y)}`,
      value: formatNumber(result),
      rawValue: round(result),
      highlight: true,
      description: 'Resultado',
    },
    {
      label: 'Percentual aplicado',
      value: formatPercent(x),
      rawValue: x,
    },
    {
      label: 'Base de cálculo',
      value: formatNumber(y),
      rawValue: y,
    },
  ]
}

export const whatPercent: CalculatorFn = (inputs) => {
  const x = inputs.x ?? 0
  const y = inputs.y ?? 0
  const result = x === 0 ? 0 : (y / x) * 100

  return [
    {
      label: `${formatNumber(y)} representa`,
      value: formatPercent(result),
      rawValue: round(result),
      highlight: true,
      description: `de ${formatNumber(x)}`,
    },
    {
      label: 'Valor total',
      value: formatNumber(x),
      rawValue: x,
    },
    {
      label: 'Valor parcial',
      value: formatNumber(y),
      rawValue: y,
    },
  ]
}

export const discount: CalculatorFn = (inputs) => {
  const original = inputs.original ?? 0
  const discountPct = inputs.discountPct ?? 0
  const discountAmount = original * (discountPct / 100)
  const finalPrice = original - discountAmount

  return [
    {
      label: 'Preço final',
      value: formatCurrency(finalPrice),
      rawValue: round(finalPrice),
      highlight: true,
      description: 'Valor com desconto aplicado',
    },
    {
      label: 'Desconto em R$',
      value: formatCurrency(discountAmount),
      rawValue: round(discountAmount),
      description: 'Economia',
    },
    {
      label: 'Percentual de desconto',
      value: formatPercent(discountPct),
      rawValue: round(discountPct),
    },
    {
      label: 'Preço original',
      value: formatCurrency(original),
      rawValue: round(original),
    },
  ]
}

export const markup: CalculatorFn = (inputs) => {
  const cost = inputs.cost ?? 0
  const markupPct = inputs.markupPct ?? 0
  const sellingPrice = cost * (1 + markupPct / 100)
  const grossProfit = sellingPrice - cost
  const margin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0

  return [
    {
      label: 'Preço de venda',
      value: formatCurrency(sellingPrice),
      rawValue: round(sellingPrice),
      highlight: true,
      description: `Com markup de ${formatPercent(markupPct)}`,
    },
    {
      label: 'Margem de lucro',
      value: formatPercent(margin),
      rawValue: round(margin),
      description: 'Margem sobre o preço de venda',
    },
    {
      label: 'Lucro bruto',
      value: formatCurrency(grossProfit),
      rawValue: round(grossProfit),
    },
    {
      label: 'Custo',
      value: formatCurrency(cost),
      rawValue: round(cost),
    },
  ]
}

export const percentChange: CalculatorFn = (inputs) => {
  const from = inputs.from ?? 0
  const to = inputs.to ?? 0
  const change = to - from
  const changePct = from === 0 ? (to > 0 ? Infinity : 0) : (change / from) * 100

  return [
    {
      label: 'Variação percentual',
      value: isFinite(changePct) ? formatPercent(changePct) : '∞',
      rawValue: round(isFinite(changePct) ? changePct : 0),
      highlight: true,
      description: change >= 0 ? 'Aumento' : 'Redução',
    },
    {
      label: 'Variação absoluta',
      value: formatNumber(change),
      rawValue: round(change),
    },
    {
      label: 'Valor inicial',
      value: formatNumber(from),
      rawValue: round(from),
    },
    {
      label: 'Valor final',
      value: formatNumber(to),
      rawValue: round(to),
    },
  ]
}

export const commission: CalculatorFn = (inputs) => {
  const salesAmount = inputs.salesAmount ?? 0
  const commissionRate = inputs.commissionRate ?? 0
  const commissionEarned = salesAmount * (commissionRate / 100)

  return [
    {
      label: 'Comissão recebida',
      value: formatCurrency(commissionEarned),
      rawValue: round(commissionEarned),
      highlight: true,
    },
    {
      label: 'Taxa de comissão',
      value: formatPercent(commissionRate),
      rawValue: round(commissionRate),
    },
    {
      label: 'Total de vendas',
      value: formatCurrency(salesAmount),
      rawValue: round(salesAmount),
    },
  ]
}
