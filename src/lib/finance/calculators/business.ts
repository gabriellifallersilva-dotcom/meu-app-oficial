import type { CalculatorFn } from '../types'
import { round, formatCurrency, formatPercent, formatNumber, npv, irr } from '../math'

export const roi: CalculatorFn = (inputs) => {
  const invested = inputs.invested ?? 0
  const returned = inputs.returned ?? 0
  const absoluteReturn = returned - invested
  const roiPct = invested > 0 ? (absoluteReturn / invested) * 100 : 0

  return [
    {
      label: 'ROI',
      value: formatPercent(roiPct),
      rawValue: round(roiPct),
      highlight: true,
      description: 'Retorno sobre o investimento',
    },
    {
      label: 'Retorno absoluto',
      value: formatCurrency(absoluteReturn),
      rawValue: round(absoluteReturn),
      description: absoluteReturn >= 0 ? 'Lucro' : 'Prejuízo',
    },
    {
      label: 'Valor investido',
      value: formatCurrency(invested),
      rawValue: round(invested),
    },
    {
      label: 'Valor retornado',
      value: formatCurrency(returned),
      rawValue: round(returned),
    },
    {
      label: 'Índice de lucratividade',
      value: formatNumber(invested > 0 ? returned / invested : 0, 4),
      rawValue: round(invested > 0 ? returned / invested : 0, 4),
      description: 'Quanto retornou para cada R$1 investido',
    },
  ]
}

export const breakEven: CalculatorFn = (inputs) => {
  const fixedCosts = inputs.fixedCosts ?? 0
  const unitPrice = inputs.unitPrice ?? 0
  const unitVariableCost = inputs.unitVariableCost ?? 0

  const contributionMargin = unitPrice - unitVariableCost

  if (contributionMargin <= 0) {
    return [
      {
        label: 'Ponto de equilíbrio',
        value: '—',
        rawValue: 0,
        highlight: true,
        description: 'Margem de contribuição negativa ou zero. Impossível atingir o equilíbrio.',
      },
      {
        label: 'Margem de contribuição',
        value: formatCurrency(contributionMargin),
        rawValue: round(contributionMargin),
      },
    ]
  }

  const breakEvenUnits = fixedCosts / contributionMargin
  const breakEvenRevenue = breakEvenUnits * unitPrice

  return [
    {
      label: 'Unidades para equilíbrio',
      value: formatNumber(Math.ceil(breakEvenUnits), 0),
      rawValue: round(breakEvenUnits),
      highlight: true,
      description: 'Quantidade mínima de vendas',
    },
    {
      label: 'Receita no equilíbrio',
      value: formatCurrency(breakEvenRevenue),
      rawValue: round(breakEvenRevenue),
      highlight: true,
    },
    {
      label: 'Margem de contribuição unitária',
      value: formatCurrency(contributionMargin),
      rawValue: round(contributionMargin),
      description: 'Preço - Custo variável',
    },
    {
      label: 'Custos fixos',
      value: formatCurrency(fixedCosts),
      rawValue: round(fixedCosts),
    },
    {
      label: 'Preço unitário',
      value: formatCurrency(unitPrice),
      rawValue: round(unitPrice),
    },
    {
      label: 'Custo variável unitário',
      value: formatCurrency(unitVariableCost),
      rawValue: round(unitVariableCost),
    },
  ]
}

export const npvCalc: CalculatorFn = (inputs) => {
  const rate = (inputs.rate ?? 0) / 100

  // Parse cash flows from numbered inputs: cf0, cf1, cf2, ...
  const cashflows: number[] = []
  let i = 0
  while (true) {
    const key = `cf${i}`
    if (!(key in inputs)) break
    cashflows.push(inputs[key])
    i++
  }

  if (cashflows.length === 0) {
    return [
      {
        label: 'VPL',
        value: formatCurrency(0),
        rawValue: 0,
        highlight: true,
        description: 'Nenhum fluxo de caixa informado',
      },
    ]
  }

  const npvResult = npv(rate, cashflows)

  return [
    {
      label: 'VPL',
      value: formatCurrency(npvResult),
      rawValue: round(npvResult),
      highlight: true,
      description: npvResult >= 0 ? 'Investimento viável' : 'Investimento inviável',
    },
    {
      label: 'Taxa de desconto',
      value: formatPercent(inputs.rate ?? 0),
      rawValue: round(inputs.rate ?? 0),
    },
    {
      label: 'Investimento inicial',
      value: formatCurrency(cashflows[0]),
      rawValue: round(cashflows[0]),
    },
    {
      label: 'Nº de fluxos',
      value: formatNumber(cashflows.length, 0),
      rawValue: cashflows.length,
    },
  ]
}

export const irrCalc: CalculatorFn = (inputs) => {
  const cashflows: number[] = []
  let i = 0
  while (true) {
    const key = `cf${i}`
    if (!(key in inputs)) break
    cashflows.push(inputs[key])
    i++
  }

  if (cashflows.length < 2) {
    return [
      {
        label: 'TIR',
        value: '—',
        rawValue: 0,
        highlight: true,
        description: 'São necessários pelo menos 2 fluxos de caixa',
      },
    ]
  }

  const irrResult = irr(cashflows) * 100

  return [
    {
      label: 'TIR',
      value: formatPercent(irrResult),
      rawValue: round(irrResult),
      highlight: true,
      description: 'Taxa Interna de Retorno',
    },
    {
      label: 'Investimento inicial',
      value: formatCurrency(cashflows[0]),
      rawValue: round(cashflows[0]),
    },
    {
      label: 'Nº de fluxos',
      value: formatNumber(cashflows.length, 0),
      rawValue: cashflows.length,
    },
    {
      label: 'Soma dos fluxos',
      value: formatCurrency(cashflows.reduce((a, b) => a + b, 0)),
      rawValue: round(cashflows.reduce((a, b) => a + b, 0)),
    },
  ]
}
