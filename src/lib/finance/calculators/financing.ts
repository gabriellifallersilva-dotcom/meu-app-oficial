import type { CalculatorFn } from '../types'
import { round, formatCurrency, formatPercent, formatNumber, pmt } from '../math'

interface AmortizationRow {
  period: number
  payment: number
  principal: number
  interest: number
  balance: number
}

/**
 * Generate a full PRICE (French) amortization schedule.
 * Constant payments. Interest decreases, principal increases over time.
 */
function priceSchedule(
  amount: number,
  monthlyRate: number,
  months: number,
): AmortizationRow[] {
  const payment = pmt(monthlyRate, months, amount)
  const schedule: AmortizationRow[] = []
  let balance = amount

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate
    const principal = payment - interest
    balance -= principal

    schedule.push({
      period: i,
      payment: round(payment),
      principal: round(principal),
      interest: round(interest),
      balance: Math.max(0, round(balance)),
    })
  }

  return schedule
}

/**
 * Generate a full SAC (Constant Amortization) schedule.
 * Constant principal reduction. Interest and payment decrease over time.
 */
function sacSchedule(
  amount: number,
  monthlyRate: number,
  months: number,
): AmortizationRow[] {
  const amortization = amount / months
  const schedule: AmortizationRow[] = []
  let balance = amount

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate
    const payment = amortization + interest
    balance -= amortization

    schedule.push({
      period: i,
      payment: round(payment),
      principal: round(amortization),
      interest: round(interest),
      balance: Math.max(0, round(balance)),
    })
  }

  return schedule
}

export const priceTable: CalculatorFn = (inputs) => {
  const amount = inputs.amount ?? 0
  const annualRate = (inputs.rate ?? 0) / 100
  const months = Math.round(inputs.months ?? 0)
  const system = inputs.system ?? 0 // 0 = PRICE, 1 = SAC

  const monthlyRate = (1 + annualRate) ** (1 / 12) - 1

  const schedule =
    system === 1 ? sacSchedule(amount, monthlyRate, months) : priceSchedule(amount, monthlyRate, months)

  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0)
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0)

  // Build string-based amortization table for display
  const tableHeaders = ['Parcela', 'Prestação', 'Amortização', 'Juros', 'Saldo Devedor']
  const tableRows: string[][] = [tableHeaders]

  for (const row of schedule) {
    tableRows.push([
      `${row.period}ª`,
      formatCurrency(row.payment),
      formatCurrency(row.principal),
      formatCurrency(row.interest),
      formatCurrency(row.balance),
    ])
  }

  const systemName = system === 1 ? 'SAC' : 'PRICE'
  const annualRatePct = inputs.rate ?? 0

  return [
    {
      label: `Prestação${system === 0 ? ' (fixa)' : ' inicial'}`,
      value: formatCurrency(schedule[0]?.payment ?? 0),
      rawValue: schedule[0]?.payment ?? 0,
      highlight: true,
      description: system === 1 ? 'SAC: prestações decrescentes' : 'PRICE: prestações fixas',
    },
    {
      label: 'Total pago',
      value: formatCurrency(totalPaid),
      rawValue: round(totalPaid),
      highlight: true,
      description: 'Soma de todas as prestações',
    },
    {
      label: 'Total de juros',
      value: formatCurrency(totalInterest),
      rawValue: round(totalInterest),
      description: `${formatPercent((totalInterest / amount) * 100)} do principal`,
    },
    {
      label: 'Valor financiado',
      value: formatCurrency(amount),
      rawValue: round(amount),
    },
    {
      label: 'Sistema',
      value: systemName,
      rawValue: system,
      description: 'Tabela de amortização',
    },
    {
      label: 'Taxa anual',
      value: formatPercent(annualRatePct),
      rawValue: round(annualRatePct),
    },
    {
      label: 'Prazo',
      value: `${formatNumber(months, 0)} meses`,
      rawValue: months,
    },
    {
      label: 'Tabela de amortização',
      value: '',
      rawValue: 0,
      description: JSON.stringify(tableRows),
    },
  ]
}
