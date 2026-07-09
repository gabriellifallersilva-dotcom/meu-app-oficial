import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Button, Input } from '@blinkdotnew/ui'
import { Calculator, Search } from 'lucide-react'

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    const q = searchQuery.trim()
    if (q) navigate({ to: '/calculators', search: { q } })
  }

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/85 backdrop-blur-xl border-b border-border/40"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
            <Calculator className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">
            FinanceCalc<span className="text-primary">Ultimate</span>
          </span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar calculadoras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              className="pl-10 h-9 bg-secondary/50 border-border text-sm rounded-lg transition-all focus-within:border-primary/40 focus-within:bg-secondary/80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/calculators">Explorar</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}
