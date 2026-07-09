import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Input, Card, CardContent, Badge } from '@blinkdotnew/ui'
import {
  Percent,
  TrendingUp,
  Landmark,
  PiggyBank,
  Building2,
  Receipt,
  Search,
  Calculator,
  Shield,
  Zap,
  Sparkles,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react'
import { calculatorList, calculatorsByCategory } from '@/lib/finance/registry'
import { cn } from '@/lib/utils'
import type { Calculator, CalculatorCategory } from '@/lib/finance/types'

// ── Category display config ──────────────────────────────────────────────
type CategoryStyleKey = 'percentage' | 'interest' | 'financing' | 'investment' | 'business' | 'tax'

interface CategoryDisplay {
  name: string
  icon: typeof Percent
  description: string
  iconBg: string
  iconColor: string
  badgeClass: string
  cardHoverBorder: string
}

const categoryDisplay: Record<CategoryStyleKey, CategoryDisplay> = {
  percentage: {
    name: 'Porcentagem',
    icon: Percent,
    description: 'Descontos, acréscimos, comissões e markup',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    badgeClass: 'border-primary/30 text-primary',
    cardHoverBorder: 'hover:border-primary/40',
  },
  interest: {
    name: 'Juros',
    icon: TrendingUp,
    description: 'Simples, compostos, taxas equivalentes',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    badgeClass: 'border-accent/30 text-accent',
    cardHoverBorder: 'hover:border-accent/40',
  },
  financing: {
    name: 'Financiamentos',
    icon: Landmark,
    description: 'PRICE, SAC, simulação de parcelas',
    iconBg: 'bg-[hsl(217,91%,60%,0.12)]',
    iconColor: 'text-[hsl(217,91%,60%)]',
    badgeClass: 'border-[hsl(217,91%,60%,0.3)] text-[hsl(217,91%,60%)]',
    cardHoverBorder: 'hover:border-[hsl(217,91%,60%,0.4)]',
  },
  investment: {
    name: 'Investimentos',
    icon: PiggyBank,
    description: 'CDB, renda fixa, crescimento composto',
    iconBg: 'bg-[hsl(271,81%,65%,0.12)]',
    iconColor: 'text-[hsl(271,81%,65%)]',
    badgeClass: 'border-[hsl(271,81%,65%,0.3)] text-[hsl(271,81%,65%)]',
    cardHoverBorder: 'hover:border-[hsl(271,81%,65%,0.4)]',
  },
  business: {
    name: 'Empresarial',
    icon: Building2,
    description: 'ROI, VPL, TIR, ponto de equilíbrio',
    iconBg: 'bg-[hsl(340,82%,59%,0.12)]',
    iconColor: 'text-[hsl(340,82%,59%)]',
    badgeClass: 'border-[hsl(340,82%,59%,0.3)] text-[hsl(340,82%,59%)]',
    cardHoverBorder: 'hover:border-[hsl(340,82%,59%,0.4)]',
  },
  tax: {
    name: 'Tributos',
    icon: Receipt,
    description: 'INSS, IRPF, FGTS',
    iconBg: 'bg-[hsl(30,95%,55%,0.12)]',
    iconColor: 'text-[hsl(30,95%,55%)]',
    badgeClass: 'border-[hsl(30,95%,55%,0.3)] text-[hsl(30,95%,55%)]',
    cardHoverBorder: 'hover:border-[hsl(30,95%,55%,0.4)]',
  },
}

const visibleCategories: CategoryStyleKey[] = ['percentage', 'interest', 'financing', 'investment', 'business', 'tax']

// ── Popular calculator IDs ────────────────────────────────────────────────
const popularIds = ['compound-interest', 'price-table', 'cdb', 'percent-of', 'irpf', 'inss']

// ── Animation variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const sectionTransition = { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }

// ── Floating stat pills for hero ──────────────────────────────────────────
const heroStats = [
  { icon: Calculator, label: '18+ Calculadoras' },
  { icon: Shield, label: '100% Grátis' },
  { icon: Zap, label: 'Cálculos Precisos' },
]

// ── Stats strip items ─────────────────────────────────────────────────────
const statsStripItems = [
  { icon: Calculator, value: '18+', label: 'Calculadoras' },
  { icon: LayoutGrid, value: '8', label: 'Categorias' },
  { icon: Zap, value: 'Tempo real', label: 'Resultados instantâneos' },
  { icon: Shield, value: '100%', label: 'Gratuito' },
]

// ── Footer links ──────────────────────────────────────────────────────────
const footerLinks = [
  { label: 'Sobre', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contato', to: '/contact' },
  { label: 'Privacidade', to: '/privacy' },
]

// ── Section wrapper ───────────────────────────────────────────────────────
function Section({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('mx-auto max-w-7xl px-4 sm:px-6', className)}>
      {children}
    </section>
  )
}

// ── Section heading ───────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {children}
      </h2>
      <div className="mt-3 h-1 w-12 rounded-full bg-accent" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════
function Hero() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return calculatorList
      .filter(
        (c) =>
          c.meta.name.toLowerCase().includes(q) ||
          c.meta.description.toLowerCase().includes(q) ||
          c.meta.keywords.some((k) => k.toLowerCase().includes(q)),
      )
      .slice(0, 6)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!focused || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const idx = selectedIdx >= 0 ? selectedIdx : 0
      if (results[idx]) {
        navigate({ to: '/calculator/$id', params: { id: results[idx].meta.id } })
        setFocused(false)
        setQuery('')
      }
    } else if (e.key === 'Escape') {
      setFocused(false)
    }
  }

  const displayConfig = (cat: CalculatorCategory): CategoryDisplay | undefined =>
    categoryDisplay[cat as CategoryStyleKey]

  return (
    <section className="relative pt-28 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--primary)/0.12),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,hsl(var(--accent)/0.06),transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            A calculadora financeira mais completa do Brasil
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight"
        >
          Domine suas{' '}
          <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            finanças
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
        >
          Mais de 18 calculadoras gratuitas, precisas e profissionais.
          <br className="hidden sm:block" />
          Tudo o que você precisa para tomar decisões financeiras inteligentes.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-8 relative mx-auto max-w-xl"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Buscar calculadora..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIdx(-1)
                if (!focused) setFocused(true)
              }}
              onFocus={() => setFocused(true)}
              onKeyDown={handleKeyDown}
              className="h-14 pl-12 pr-4 text-base bg-card border-border rounded-xl shadow-lg focus-visible:ring-primary focus-visible:ring-2 transition-shadow"
            />
          </div>

          {/* Results dropdown */}
          <AnimatePresence>
            {focused && results.length > 0 && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {results.map((c, i) => {
                  const cfg = displayConfig(c.meta.category)
                  const Icon = cfg?.icon ?? Calculator
                  return (
                    <button
                      key={c.meta.id}
                      onMouseDown={() => {
                        navigate({ to: '/calculator/$id', params: { id: c.meta.id } })
                        setFocused(false)
                        setQuery('')
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border last:border-0',
                        i === selectedIdx ? 'bg-secondary' : 'hover:bg-secondary/50',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          cfg?.iconBg ?? 'bg-primary/10',
                        )}
                      >
                        <Icon className={cn('h-4 w-4', cfg?.iconColor ?? 'text-primary')} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">
                          {c.meta.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {c.meta.description}
                        </div>
                      </div>
                      {cfg && <Badge variant="outline" className={cn('shrink-0 text-[10px] px-2 py-0 h-5', cfg.badgeClass)}>{cfg.name}</Badge>}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur-sm px-4 py-2 text-sm text-foreground"
            >
              <stat.icon className="h-4 w-4 text-accent" />
              <span>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════
function Categories() {
  return (
    <Section className="pb-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <motion.div variants={fadeUp} transition={sectionTransition}>
          <SectionHeading>Categorias</SectionHeading>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {visibleCategories.map((key, i) => {
            const cfg = categoryDisplay[key]
            const count =
              (calculatorsByCategory as Record<string, Calculator[]>)[key]?.length ?? 0
            const Icon = cfg.icon
            return (
              <motion.div
                key={key}
                variants={fadeUp}
                transition={{ ...sectionTransition, delay: i * 0.06 }}
              >
                <Link
                  to="/calculator/$id"
                  params={{
                    id:
                      (calculatorsByCategory as Record<string, Calculator[]>)[key]?.[0]?.meta
                        .id ?? 'percent-of',
                  }}
                >
                  <Card
                    className={cn(
                      'group cursor-pointer border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5',
                      cfg.cardHoverBorder,
                    )}
                  >
                    <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center gap-3">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                          cfg.iconBg,
                        )}
                      >
                        <Icon className={cn('h-6 w-6', cfg.iconColor)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cfg.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {count} calculadora{count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULAR CALCULATORS
// ═══════════════════════════════════════════════════════════════════════════
function PopularCalculators() {
  const popular = useMemo(
    () =>
      popularIds
        .map((id) => calculatorList.find((c) => c.meta.id === id))
        .filter((c): c is Calculator => !!c),
    [],
  )

  const displayConfig = (cat: CalculatorCategory): CategoryDisplay | undefined =>
    categoryDisplay[cat as CategoryStyleKey]

  return (
    <Section className="pb-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <motion.div variants={fadeUp} transition={sectionTransition}>
          <SectionHeading>Mais utilizados</SectionHeading>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popular.map((c, i) => {
            const cfg = displayConfig(c.meta.category)
            const Icon = cfg?.icon ?? Calculator
            return (
              <motion.div
                key={c.meta.id}
                variants={fadeUp}
                transition={{ ...sectionTransition, delay: i * 0.08 }}
              >
                <Link to="/calculator/$id" params={{ id: c.meta.id }}>
                  <Card
                    className={cn(
                      'group h-full cursor-pointer border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5',
                      cfg?.cardHoverBorder ?? 'hover:border-primary/40',
                    )}
                  >
                    <div className="p-5 flex flex-col h-full">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                            cfg?.iconBg ?? 'bg-primary/10',
                          )}
                        >
                          <Icon className={cn('h-5 w-5', cfg?.iconColor ?? 'text-primary')} />
                        </div>
                        {cfg && (
                          <Badge
                            variant="outline"
                            className={cn('shrink-0 text-[10px] px-2 py-0 h-5', cfg.badgeClass)}
                          >
                            {cfg.name}
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {c.meta.name}
                      </h3>

                      {/* Description */}
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 flex-1">
                        {c.meta.description}
                      </p>

                      {/* Formula + CTA */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground/60 font-mono truncate mr-2">
                          {c.meta.formula}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary group-hover:gap-1.5 transition-all">
                          Calcular
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS STRIP
// ═══════════════════════════════════════════════════════════════════════════
function StatsStrip() {
  return (
    <Section className="pb-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={sectionTransition}
        className="rounded-2xl bg-card border border-border px-6 py-10 sm:px-10 sm:py-12"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statsStripItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{item.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Calculator className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            FinanceCalc Ultimate
          </span>
          <span className="hidden sm:inline text-sm text-muted-foreground">
            · 2024 · Todos os direitos reservados
          </span>
        </div>

        {/* Mobile copyright */}
        <span className="sm:hidden text-xs text-muted-foreground">
          2024 · Todos os direitos reservados
        </span>

        {/* Links */}
        <div className="flex items-center gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-center">
          <p className="text-xs text-muted-foreground font-mono">
            Feito com precisão matemática
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE
// ═══════════════════════════════════════════════════════════════════════════
export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'FinanceCalc Ultimate — Calculadoras Financeiras Online',
      },
      {
        name: 'description',
        content:
          'A calculadora financeira mais completa do Brasil. Juros compostos, financiamentos PRICE e SAC, investimentos, impostos e muito mais. 100% grátis.',
      },
      {
        property: 'og:title',
        content: 'FinanceCalc Ultimate — Calculadoras Financeiras Online',
      },
      {
        property: 'og:description',
        content:
          'A calculadora financeira mais completa do Brasil. Juros compostos, financiamentos PRICE e SAC, investimentos, impostos e muito mais. 100% grátis.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://financecalc.app' }],
  }),
  component: Home,
})

function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Hero />
      <Categories />
      <PopularCalculators />
      <StatsStrip />
      <Footer />
    </div>
  )
}
