import { Link } from '@tanstack/react-router'
import { Calculator, Github, Linkedin } from 'lucide-react'
import { categoryConfig } from './categoryConfig'
import { calculatorsByCategory } from '@/lib/finance/registry'

const FOOTER_CATEGORIES: { key: string; label: string; to: string }[] = [
  { key: 'percentage', label: 'Porcentagem', to: '/calculators' },
  { key: 'interest', label: 'Juros', to: '/calculators' },
  { key: 'financing', label: 'Financiamentos', to: '/calculators' },
  { key: 'investment', label: 'Investimentos', to: '/calculators' },
  { key: 'tax', label: 'Impostos', to: '/calculators' },
  { key: 'business', label: 'Empresarial', to: '/calculators' },
]

const POPULAR_LINKS = [
  { label: 'Juros Compostos', to: '/calculator/compound-interest' },
  { label: 'Financiamento (PRICE/SAC)', to: '/calculator/price-table' },
  { label: 'CDB / Renda Fixa', to: '/calculator/cdb' },
  { label: 'ROI', to: '/calculator/roi' },
  { label: 'IRPF 2024', to: '/calculator/irpf' },
  { label: 'Todas as calculadoras', to: '/calculators' },
]

export function Footer() {
  const totalCalculators = Object.values(calculatorsByCategory).reduce(
    (sum, calcs) => sum + calcs.length, 0,
  )

  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
                <Calculator className="h-4 w-4" />
              </div>
              FinanceCalc<span className="text-primary">Ultimate</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Plataforma profissional de cálculos financeiros. {totalCalculators}+ calculadoras gratuitas com
              precisão matemática e fórmulas transparentes.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2.5">
              {FOOTER_CATEGORIES.map((cat) => (
                <li key={cat.key}>
                  <Link
                    to={cat.to}
                    search={{ category: cat.key }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Mais usadas</h4>
            <ul className="space-y-2.5">
              {POPULAR_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to as any}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter placeholder */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Fique por dentro</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Novas calculadoras, atualizações de alíquotas e dicas financeiras direto no seu email.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 h-9 rounded-lg border border-border/50 bg-secondary/50 px-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/30"
              />
              <button className="shrink-0 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/90 active:scale-[0.98]">
                Assinar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FinanceCalc Ultimate. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Resultados para fins informativos. Consulte um contador ou planejador financeiro certificado para decisões importantes.
          </p>
        </div>
      </div>
    </footer>
  )
}
