import Sparkline from './Sparkline'
import { formatCurrency, formatPercent } from '../utils/format'
import { fractionOf } from '../utils/math'
import type { AccountWithBalance, SparklineDatum } from '../types/finance'

type NetWorthHeroProps = {
  accounts: (AccountWithBalance & { monthlyGrowthRate: number; history: number[] })[]
  history: SparklineDatum[]
  month: string
}

function NetWorthHero({ accounts, history, month }: NetWorthHeroProps) {
  const total = accounts.reduce((sum, a) => sum + a.balance, 0)

  const prev = history.length > 1 ? history.at(-2)!.value : total
  const change = prev > 0 ? (total - prev) / prev : 0
  const positive = change >= 0

  const segments = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    accent: a.accent,
    balance: a.balance,
    pct: fractionOf(a.balance, total),
  }))

  return (
    <section className="hero">
      <div className="hero__main">
        <div className="hero__intro">
          <p className="hero__label">Patrimonio total</p>
          <h2 className="hero__amount tnum">{formatCurrency(total)}</h2>
          <span className={`hero__delta ${positive ? 'is-up' : 'is-down'}`}>
            {positive ? '▲' : '▼'} {formatPercent(Math.abs(change))}
            <span className="hero__delta-note">vs. mes anterior</span>
          </span>
        </div>

        <div className="hero__trend">
          <span className="hero__month">{month}</span>
          <Sparkline
            id="networth"
            data={history.map((h) => h.value)}
            color="#a5b4fc"
            width={200}
            height={64}
            strokeWidth={2.5}
            fill
          />
        </div>
      </div>

      <div className="hero__bar" role="img" aria-label="Composición del patrimonio">
        {segments.map((s) => (
          <span
            key={s.id}
            className={`hero__segment hero__segment--${s.accent}`}
            style={{ width: `${s.pct * 100}%` }}
            title={`${s.name}: ${formatPercent(s.pct)}`}
          />
        ))}
      </div>

      <ul className="hero__legend">
        {segments.map((s) => (
          <li key={s.id} className="hero__legend-item">
            <span className={`dot dot--${s.accent}`} aria-hidden />
            <span className="hero__legend-name">{s.name}</span>
            <strong className="tnum">{formatPercent(s.pct)}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default NetWorthHero
