import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calculator,
  AlertCircle,
  Table,
} from 'lucide-react'
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@blinkdotnew/ui'
import { calculatorRegistry } from '@/lib/finance/registry'
import type { CalculatorResult, CalculatorParam } from '@/lib/finance/types'

export const Route = createFileRoute('/calculator/$id')({
  component: CalculatorPage,
})

function CalculatorPage() {
  const { id } = useParams({ from: '/calculator/$id' })
  const navigate = useNavigate()
  const calc = calculatorRegistry[id]

  // ---- 404: calculator not found ----
  if (!calc) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Calculadora não encontrada
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            A calculadora <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{id}</code> não
            existe no registro. Verifique o endereço ou volte para a página inicial.
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">
          Voltar ao início
        </Button>
      </div>
    )
  }

  return <CalculatorShell calc={calc} />
}

/* ────────────────────────────────────────────────────────────────────────────
   Calculator Shell
   ──────────────────────────────────────────────────────────────────────────── */

interface AmortizationRow {
  period: number
  payment: number
  principal: number
  interest: number
  balance: number
}

function CalculatorShell({ calc }: { calc: (typeof calculatorRegistry)[string] }) {
  const navigate = useNavigate()
  const { meta } = calc

  // Form state — initialized from each param's defaultValue
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const p of meta.params) {
      const dv = p.defaultValue
      initial[p.key] = dv != null ? String(dv) : ''
    }
    return initial
  })

  // Derived state
  const [results, setResults] = useState<CalculatorResult[] | null>(null)
  const [scheduleData, setScheduleData] = useState<AmortizationRow[] | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)

  const handleParamChange = useCallback((key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    if (hasCalculated) {
      // Reset results on input change so user knows to recalculate
      setResults(null)
      setScheduleData(null)
      setCalcError(null)
    }
  }, [hasCalculated])

  const handleCalculate = useCallback(() => {
    setCalcError(null)
    setScheduleData(null)

    const numericInputs: Record<string, number> = {}
    for (const p of meta.params) {
      const raw = values[p.key]
      if (p.type === 'select') {
        numericInputs[p.key] = parseFloat(raw) || 0
      } else {
        numericInputs[p.key] = parseFloat(raw) || 0
      }
    }

    try {
      const computed = calc.calc(numericInputs)

      // Look for amortization schedule embedded as JSON in the description
      // of a result with label "Tabela de amortização"
      const scheduleIdx = computed.findIndex((r) => r.label === 'Tabela de amortização')
      let amortRows: AmortizationRow[] | null = null
      const filtered = computed.filter((_, i) => i !== scheduleIdx)

      if (scheduleIdx !== -1 && computed[scheduleIdx].description) {
        try {
          const parsed: string[][] = JSON.parse(computed[scheduleIdx].description!)
          // first row = headers, subsequent rows = data
          amortRows = parsed.slice(1).map((row) => ({
            period: parseInt(row[0], 10) || 0,
            payment: parseCurrencyString(row[1]),
            principal: parseCurrencyString(row[2]),
            interest: parseCurrencyString(row[3]),
            balance: parseCurrencyString(row[4]),
          }))
        } catch {
          // JSON parse failed — no schedule to show
        }
      }

      setResults(filtered)
      setScheduleData(amortRows)
      setHasCalculated(true)
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : 'Erro ao calcular')
      setResults(null)
      setScheduleData(null)
      setHasCalculated(true)
    }
  }, [calc, meta.params, values])

  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/' })}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {meta.name}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Description + Formula badge */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-start gap-3">
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
              {meta.description}
            </p>
            <Badge
              variant="secondary"
              className="shrink-0 gap-1.5 border border-border/50 bg-emerald-500/10 font-mono text-xs text-emerald-400 shadow-sm"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>{meta.formula}</span>
            </Badge>
          </div>
        </div>

        {/* Inputs section */}
        <Card className="mb-8 border border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-foreground">
              Parâmetros
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Preencha os campos abaixo e clique em Calcular
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {meta.params.map((param) => (
                <ParamField
                  key={param.key}
                  param={param}
                  value={values[param.key] ?? ''}
                  onChange={(v) => handleParamChange(param.key, v)}
                />
              ))}
            </div>

            <Button
              onClick={handleCalculate}
              className="w-full bg-primary font-semibold text-primary-foreground shadow-lg shadow-emerald-500/20 transition-all hover:bg-primary/90 hover:shadow-emerald-500/30 active:scale-[0.98]"
              size="lg"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calcular
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {calcError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{calcError}</p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {results && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="mb-8 space-y-4"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">Resultados</h2>
                <Badge variant="outline" className="text-[10px]">
                  {results.length} {results.length === 1 ? 'item' : 'itens'}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((r, i) => (
                  <ResultCard key={r.label} result={r} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Amortization table */}
        <AnimatePresence>
          {scheduleData && scheduleData.length > 0 && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
              className="mb-8"
            >
              <Card className="border border-border/40 bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
                    <Table className="h-4 w-4 text-emerald-400" />
                    Tabela de Amortização
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {scheduleData.length} parcela{scheduleData.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground">
                          <th className="whitespace-nowrap px-4 py-2.5 font-medium">Parcela</th>
                          <th className="whitespace-nowrap px-4 py-2.5 font-medium">Amortização</th>
                          <th className="whitespace-nowrap px-4 py-2.5 font-medium">Juros</th>
                          <th className="whitespace-nowrap px-4 py-2.5 font-medium">Prestação</th>
                          <th className="whitespace-nowrap px-4 py-2.5 font-medium">Saldo Devedor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleData.map((row, i) => (
                          <tr
                            key={row.period}
                            className={`border-b border-border/30 transition-colors hover:bg-muted/30 ${
                              i % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                            }`}
                          >
                            <td className="px-4 py-2 font-mono text-foreground">{row.period}ª</td>
                            <td className="px-4 py-2 font-mono tabular-nums text-foreground">
                              {formatBrl(row.principal)}
                            </td>
                            <td className="px-4 py-2 font-mono tabular-nums text-amber-400">
                              {formatBrl(row.interest)}
                            </td>
                            <td className="px-4 py-2 font-mono tabular-nums font-medium text-emerald-400">
                              {formatBrl(row.payment)}
                            </td>
                            <td className="px-4 py-2 font-mono tabular-nums text-muted-foreground">
                              {formatBrl(row.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Param Field
   ──────────────────────────────────────────────────────────────────────────── */

function ParamField({
  param,
  value,
  onChange,
}: {
  param: CalculatorParam
  value: string
  onChange: (v: string) => void
}) {
  if (param.type === 'select' && param.options) {
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={`param-${param.key}`}
          className="block text-xs font-medium text-muted-foreground"
        >
          {param.label}
        </label>
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger
            id={`param-${param.key}`}
            className="h-10 w-full border border-border/50 bg-input/50 text-sm text-foreground backdrop-blur-sm transition-colors focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30"
          >
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent className="border border-border/60 bg-popover text-sm">
            {param.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {param.description && (
          <p className="text-[11px] leading-tight text-muted-foreground/70">
            {param.description}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={`param-${param.key}`}
        className="block text-xs font-medium text-muted-foreground"
      >
        {param.label}
      </label>
      <div className="relative">
        {param.prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
            {param.prefix}
          </span>
        )}
        <Input
          id={`param-${param.key}`}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={param.step ?? 'any'}
          className={`h-10 border border-border/50 bg-input/50 text-sm text-foreground backdrop-blur-sm transition-colors placeholder:text-muted-foreground/40 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 ${
            param.prefix ? 'pl-9' : ''
          } ${param.suffix ? 'pr-9' : ''}`}
          placeholder={String(param.defaultValue ?? '')}
        />
        {param.suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            {param.suffix}
          </span>
        )}
      </div>
      {param.description && (
        <p className="text-[11px] leading-tight text-muted-foreground/70">
          {param.description}
        </p>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Result Card
   ──────────────────────────────────────────────────────────────────────────── */

function ResultCard({ result, index }: { result: CalculatorResult; index: number }) {
  const isHighlighted = result.highlight === true

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Card
        className={`relative overflow-hidden border transition-colors ${
          isHighlighted
            ? 'border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
            : 'border-border/40 bg-card/50 shadow-sm'
        }`}
      >
        {/* Glass gradient bar at top for highlighted */}
        {isHighlighted && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
        )}

        <CardContent className="p-4">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {result.label}
          </div>
          <div
            className={`text-xl font-bold tabular-nums tracking-tight ${
              isHighlighted ? 'text-emerald-400' : 'text-foreground'
            }`}
          >
            {result.value || '—'}
          </div>
          {result.description && (
            <p className="mt-1 text-[11px] leading-tight text-muted-foreground/70">
              {result.description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────────── */

function parseCurrencyString(raw: string): number {
  if (!raw) return 0
  // Remove "R$", dots, and replace comma with dot
  const sanitized = raw.replace(/[R$\s.]/g, '').replace(',', '.')
  return parseFloat(sanitized) || 0
}

function formatBrl(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
