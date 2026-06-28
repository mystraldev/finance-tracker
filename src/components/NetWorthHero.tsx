import type { AccountWithBalance, SparklineDatum } from '../types/finance'

import { formatCurrency, formatPercent } from '../utils/format'
import { fractionOf } from '../utils/math'
import Sparkline from './Sparkline'

type NetWorthHeroProperties = {
  accounts: (AccountWithBalance & { monthlyGrowthRate: number; history: number[] })[]
  history: SparklineDatum[]
  month: string
}

function NetWorthHero({ accounts, history, month }: NetWorthHeroProperties) {
  const total = accounts.reduce((sum, a) => sum + a.balance, 0)

  const previous = history.length > 1 ? history.at(-2)!.value : total
  const change = previous === 0 ? 0 : (total - previous) / Math.abs(previous)
  const isPositive = change >= 0

  // Composition only shows positive contributions; negative balances would
  // produce negative widths and push the rest beyond 100%.
  const positiveTotal = accounts.reduce((sum, a) => sum + Math.max(a.balance, 0), 0)
  const segments = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    accent: a.accent,
    balance: a.balance,
    pct: fractionOf(Math.max(a.balance, 0), positiveTotal),
  }))

  return (
    <section className="hero">
      <div className="hero__main">
        <div className="hero__intro">
          <p className="hero__label">Patrimonio total</p>
          <h2 className="hero__amount tnum">{formatCurrency(total)}</h2>
          <span className={`hero__delta ${isPositive ? 'is-up' : 'is-down'}`}>
            {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(change))}
            <span className="hero__delta-note">vs. mes anterior</span>
          </span>
        </div>

        <div className="hero__trend">
          <span className="hero__month">{month}</span>
          <Sparkline color="#7fb4ff" data={history.map((h) => h.value)} fill height={64} id="networth" strokeWidth={2.5} width={200} />
        </div>
      </div>

      <div aria-label="Composición del patrimonio" className="hero__bar" role="img">
        {segments.map((s) => (
          <span
            className={`hero__segment hero__segment--${s.accent}`}
            key={s.id}
            style={{ width: `${s.pct * 100}%` }}
            title={`${s.name}: ${formatPercent(s.pct)}`}
          />
        ))}
      </div>

      <ul className="hero__legend">
        {segments.map((s) => (
          <li className="hero__legend-item" key={s.id}>
            <span aria-hidden className={`dot dot--${s.accent}`} />
            <span className="hero__legend-name">{s.name}</span>
            <strong className="tnum">{formatPercent(s.pct)}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default NetWorthHero
