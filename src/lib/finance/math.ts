import type { CalculatorResult } from './types'

/**
 * Round a number to the specified number of decimal places.
 */
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/**
 * Format a number as currency.
 */
export function formatCurrency(
  value: number,
  currency = 'BRL',
  locale = 'pt-BR',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a number as a percentage string.
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${round(value, decimals).toFixed(decimals)}%`
}

/**
 * Format a number with thousand separators and fixed decimals.
 */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * PMT — Periodic payment for a loan/investment based on constant payments
 * and a constant interest rate.
 *
 * @param rate — interest rate per period (decimal, e.g. 0.01 for 1%)
 * @param nper — total number of payment periods
 * @param pv — present value (principal)
 * @param fv — future value desired after last payment (default 0)
 * @param type — 0 = end of period (default), 1 = beginning of period
 */
export function pmt(
  rate: number,
  nper: number,
  pv: number,
  fv = 0,
  type = 0,
): number {
  if (rate === 0) return -(pv + fv) / nper

  const pvif = (1 + rate) ** nper
  const pmtVal = (rate / (pvif - 1)) * -(pv * pvif + fv)

  if (type === 1) {
    return pmtVal / (1 + rate)
  }

  return pmtVal
}

/**
 * IPMT — Interest payment for a given period of a loan/investment.
 *
 * @param rate — interest rate per period (decimal)
 * @param per — period for which to find interest (1-based)
 * @param nper — total number of payment periods
 * @param pv — present value
 * @param fv — future value (default 0)
 */
export function ipmt(
  rate: number,
  per: number,
  nper: number,
  pv: number,
  fvVal = 0,
): number {
  const payment = pmt(rate, nper, pv, fvVal, 0)
  const ipmtVal = -(fv(rate, per - 1, payment, pv) * rate)

  return ipmtVal
}

/**
 * PPMT — Principal payment for a given period of a loan/investment.
 *
 * @param rate — interest rate per period (decimal)
 * @param per — period for which to find principal (1-based)
 * @param nper — total number of payment periods
 * @param pv — present value
 * @param fv — future value (default 0)
 */
export function ppmt(
  rate: number,
  per: number,
  nper: number,
  pv: number,
  fv = 0,
): number {
  const payment = pmt(rate, nper, pv, fv, 0)
  return payment - ipmt(rate, per, nper, pv, fv)
}

/**
 * FV — Future value of an investment.
 *
 * @param rate — interest rate per period (decimal)
 * @param nper — total number of payment periods
 * @param pmtVal — payment made each period
 * @param pv — present value
 */
export function fv(
  rate: number,
  nper: number,
  pmtVal: number,
  pv: number,
): number {
  if (rate === 0) return -(pv + pmtVal * nper)

  const factor = (1 + rate) ** nper
  return -(pv * factor + (pmtVal * (factor - 1)) / rate)
}

/**
 * PV — Present value of an investment.
 *
 * @param rate — interest rate per period (decimal)
 * @param nper — total number of payment periods
 * @param pmtVal — payment made each period (can be 0)
 * @param fvVal — future value
 */
export function pv(
  rate: number,
  nper: number,
  pmtVal: number,
  fvVal: number,
): number {
  if (rate === 0) return -(fvVal + pmtVal * nper)
  return -(fvVal + (pmtVal * ((1 + rate) ** nper - 1)) / rate) / (1 + rate) ** nper
}

/**
 * Convert an interest rate from one compounding frequency to another.
 *
 * @param rate — original rate (decimal)
 * @param fromPeriods — periods per year of the original rate
 * @param toPeriods — periods per year of the desired rate
 */
export function rateEquivalent(
  rate: number,
  fromPeriods: number,
  toPeriods: number,
): number {
  if (rate <= -1) return NaN
  return (1 + rate) ** (toPeriods / fromPeriods) - 1
}

/**
 * NPV — Net Present Value of a series of cash flows.
 *
 * @param rate — discount rate per period (decimal)
 * @param cashflows — array of cash flows (first element is usually initial investment, negative)
 */
export function npv(rate: number, cashflows: number[]): number {
  let total = 0
  for (let i = 0; i < cashflows.length; i++) {
    total += cashflows[i] / (1 + rate) ** i
  }
  return total
}

/**
 * IRR — Internal Rate of Return using the Newton-Raphson method.
 *
 * @param cashflows — array of cash flows
 * @param guess — initial guess for the rate (default 0.1 = 10%)
 */
export function irr(cashflows: number[], guess = 0.1): number {
  const maxIterations = 1000
  const tolerance = 1e-7
  let rate = guess

  for (let iter = 0; iter < maxIterations; iter++) {
    let npvVal = 0
    let dnpv = 0

    for (let i = 0; i < cashflows.length; i++) {
      const discount = (1 + rate) ** i
      npvVal += cashflows[i] / discount
      if (i > 0) {
        dnpv -= (i * cashflows[i]) / ((1 + rate) ** (i + 1))
      }
    }

    if (dnpv === 0) break

    const newRate = rate - npvVal / dnpv

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate
    }

    rate = newRate
  }

  return rate
}

/**
 * Standard deviation of an array of values (sample standard deviation).
 */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const squaredDiffs = values.map((v) => (v - avg) ** 2)
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

/**
 * Arithmetic mean of an array of values.
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

/**
 * Median of an array of values.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Helper: create a result with formatted currency value.
 */
export function resultCurrency(
  label: string,
  value: number,
  description?: string,
  highlight?: boolean,
): CalculatorResult {
  return {
    label,
    value: formatCurrency(value),
    rawValue: round(value),
    description,
    highlight,
  }
}

/**
 * Helper: create a result with formatted percentage value.
 */
export function resultPercent(
  label: string,
  value: number,
  description?: string,
  highlight?: boolean,
): CalculatorResult {
  return {
    label,
    value: formatPercent(value),
    rawValue: round(value),
    description,
    highlight,
  }
}

/**
 * Helper: create a result with formatted number value.
 */
export function resultNumber(
  label: string,
  value: number,
  decimals = 2,
  description?: string,
  highlight?: boolean,
): CalculatorResult {
  return {
    label,
    value: formatNumber(value, decimals),
    rawValue: round(value, decimals),
    description,
    highlight,
  }
}
