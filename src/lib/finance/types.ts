export type CalculatorCategory =
  | 'percentage'
  | 'interest'
  | 'financing'
  | 'investment'
  | 'business'
  | 'tax'
  | 'converter'
  | 'statistics'

export interface CalculatorParam {
  key: string
  label: string
  type: 'number' | 'select' | 'boolean'
  description: string
  defaultValue?: number | string | boolean
  required?: boolean
  step?: number
  options?: { value: string; label: string }[]
  prefix?: string
  suffix?: string
}

export interface CalculatorMeta {
  id: string
  name: string
  description: string
  category: CalculatorCategory
  params: CalculatorParam[]
  keywords: string[]
  formula: string
}

export interface CalculatorResult {
  label: string
  value: string
  rawValue: number
  description?: string
  highlight?: boolean
}

export interface CalculatorFn {
  (inputs: Record<string, number>): CalculatorResult[]
}

export interface Calculator {
  meta: CalculatorMeta
  calc: CalculatorFn
}
