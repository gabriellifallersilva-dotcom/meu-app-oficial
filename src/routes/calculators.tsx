import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calculator,
  TrendingUp,
  Percent,
  Building2,
  PiggyBank,
  Receipt,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import {
  Button,
  Card,
  CardTitle,
  CardContent,
  Badge,
  Input,
} from '@blinkdotnew/ui'
import {
  calculatorRegistry,
  calculatorsByCategory,
} from '@/lib/finance/registry'
import type { CalculatorCategory } from '@/lib/finance/types'

const CATEGORY_CONFIG: Record<
  CalculatorCategory,
  { label: string; icon: typeof Percent; description: string }
> = {
  percentage: {
    label: 'Porcentagem',
    icon: Percent,
    description: 'Cálculos de percentuais, descontos e markups',
  },
  interest: {
    label: 'Juros',
    icon: TrendingUp,
    description: 'Juros simples, compostos e conversões de taxa',
  },
  financing: {
    label: 'Financiamento',
    icon: Building2,
    description: 'Simulações de financiamento e amortização',
  },
  investment: {
    label: 'Investimentos',
    icon: PiggyBank,
    description: 'CDB, renda fixa e crescimento composto',
  },
  business: {
    label: 'Negócios',
    icon: Calculator,
    description: 'ROI, ponto de equilíbrio, VPL e TIR',
  },
  tax: {
    label: 'Impostos',
    icon: Receipt,
    description: 'INSS, IRPF e FGTS',
  },
  converter: {
    label: 'Conversores',
    icon: ArrowRight,
    description: 'Conversores de taxas e valores',
  },
  statistics: {
    label: 'Estatísticas',
    icon: SlidersHorizontal,
    description: 'Média, mediana e desvio padrão',
  },
}

type SearchParams = {
  category?: string
  q?: string
}

export const Route = createFileRoute('/calculators')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      category: typeof search.category === 'string' ? search.category : undefined,
      q: typeof search.q === 'string' ? search.q : undefined,
    }
  },
  head: () => ({
    meta: [
      { title: 'Calculadoras · FinanceCalc Ultimate' },
      {
        name: 'description',
        content:
          'Explore todas as calculadoras financeiras: juros, investimentos, financiamentos, impostos e muito mais.',
      },
    ],
  }),
  component: CalculatorsPage,
})

function CalculatorsPage() {
  const navigate = useNavigate()
  const { category: activeCategory, q: searchQuery } = Route.useSearch()

  // Build list of categories that actually have calculators
  let populatedCategories = (
    Object.entries(calculatorsByCategory) as [CalculatorCategory, typeof calculatorsByCategory[CalculatorCategory]][]
  ).filter(([, calcs]) => calcs.length > 0)

  // If a search query is present, filter calculators within each category
  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase()
    populatedCategories = populatedCategories
      .map(([cat, calcs]) => [
        cat,
        calcs.filter(
          (c) =>
            c.meta.name.toLowerCase().includes(q) ||
            c.meta.description.toLowerCase().includes(q) ||
            c.meta.keywords.some((k) => k.toLowerCase().includes(q)),
        ),
      ] as [CalculatorCategory, typeof calcs])
      .filter(([, calcs]) => calcs.length > 0)
  }

  // If a category filter is active, show only that category's calculators
  const filteredCategories = activeCategory
    ? populatedCategories.filter(([cat]) => cat === activeCategory)
    : populatedCategories

  const totalCalculators = Object.keys(calculatorRegistry).length

  const handleCategoryClick = (cat: CalculatorCategory) => {
    if (activeCategory === cat) {
      navigate({ to: '/calculators', search: {} })
    } else {
      navigate({ to: '/calculators', search: { category: cat } })
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Hero header */}
      <div className="relative border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              Início
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Calculadoras Financeiras
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Escolha entre {totalCalculators} calculadoras organizadas por categoria. Tudo o que você
              precisa para decisões financeiras precisas.
            </p>
            {/* Search input */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar calculadoras..."
                value={searchQuery ?? ''}
                onChange={(e) =>
                  navigate({
                    to: '/calculators',
                    search: {
                      category: activeCategory ?? undefined,
                      q: e.target.value || undefined,
                    },
                  })
                }
                className="h-10 pl-10 pr-8 text-sm bg-card/60 border-border"
              />
              {searchQuery?.trim() && (
                <button
                  onClick={() =>
                    navigate({
                      to: '/calculators',
                      search: { category: activeCategory ?? undefined, q: undefined },
                    })
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {populatedCategories.map(([cat, calcs]) => {
              const config = CATEGORY_CONFIG[cat]
              const isActive = activeCategory === cat
              const Icon = config.icon

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10'
                      : 'border-border/50 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground hover:bg-card/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                  <span className="tabular-nums opacity-60">{calcs.length}</span>
                </button>
              )
            })}

            {activeCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/calculators', search: {} })}
                className="rounded-full text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar filtro
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Category sections */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {filteredCategories.length === 0 ? (
          <EmptyState activeCategory={activeCategory} searchQuery={searchQuery} />
        ) : (
          <div className="space-y-12">
            {filteredCategories.map(([cat, calcs], catIdx) => {
              const config = CATEGORY_CONFIG[cat]
              const Icon = config.icon

              return (
                <motion.section
                  key={cat}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: catIdx * 0.08, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* Category header */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{config.label}</h2>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>

                  {/* Calculator cards grid */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {calcs.map((calc, calcIdx) => (
                      <CalculatorCard
                        key={calc.meta.id}
                        calculator={calc}
                        index={calcIdx}
                      />
                    ))}
                  </div>
                </motion.section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Calculator Card
   ──────────────────────────────────────────────────────────────────────────── */

function CalculatorCard({
  calculator,
  index,
}: {
  calculator: (typeof calculatorRegistry)[string]
  index: number
}) {
  const { meta } = calculator

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
    >
      <Link
        to="/calculator/$id"
        params={{ id: meta.id }}
        className="group block"
      >
        <Card className="h-full border border-border/40 bg-card/50 transition-all duration-200 hover:border-emerald-500/30 hover:bg-card/70 hover:shadow-lg hover:shadow-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-emerald-400">
                {meta.name}
              </CardTitle>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-400" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {meta.description}
            </p>
            <div className="mt-3">
              <Badge
                variant="secondary"
                className="border border-border/40 bg-muted/50 font-mono text-[10px] text-muted-foreground"
              >
                <Calculator className="mr-1 h-3 w-3" />
                {meta.formula}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Empty State
   ──────────────────────────────────────────────────────────────────────────── */

function EmptyState({ activeCategory, searchQuery: q }: { activeCategory?: string; searchQuery?: string }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">Nenhuma calculadora encontrada</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          {q?.trim()
            ? `Nenhuma calculadora corresponde à busca "${q}".`
            : activeCategory
              ? `A categoria "${CATEGORY_CONFIG[activeCategory as CalculatorCategory]?.label ?? activeCategory}" não possui calculadoras disponíveis no momento.`
              : 'Nenhuma calculadora disponível.'}
        </p>
      </div>
      {(activeCategory || q?.trim()) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/calculators', search: {} })}
        >
          Ver todas as calculadoras
        </Button>
      )}
    </div>
  )
}
