import { formatCurrency, formatPercent } from '../utils/format'

const RADIUS = 80
const CIRCUMFERENCE = Math.PI * RADIUS

const tiers = {
  good: { label: '¡Excelente ritmo!', from: '#10b981', to: '#34d399' },
  mid: { label: 'Vas bien', from: '#0a6ce0', to: '#3f8cff' },
  low: { label: 'Mejorable', from: '#f59e0b', to: '#fbbf24' },
}

type SavingsRateProps = {
  income: number
  expenses: number
}

function SavingsRate({ income, expenses }: SavingsRateProps) {
  const saved = income - expenses
  const rate = income > 0 ? saved / income : 0
  const clamped = Math.max(0, Math.min(1, rate))
  const dash = clamped * CIRCUMFERENCE

  const tierKey = rate >= 0.2 ? 'good' : rate >= 0.1 ? 'mid' : 'low'
  const tier = tiers[tierKey]

  return (
    <section className="card savings">
      <header className="card__header">
        <h3 className="card__title">Tasa de ahorro</h3>
        <span className={`badge badge--${tierKey}`}>{tier.label}</span>
      </header>

      <div className="savings__gauge">
        <svg viewBox="0 0 200 116" className="gauge">
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={tier.from} />
              <stop offset="100%" stopColor={tier.to} />
            </linearGradient>
          </defs>
          <path className="gauge__track" d="M 20 108 A 80 80 0 0 1 180 108" fill="none" />
          <path
            className="gauge__value"
            d="M 20 108 A 80 80 0 0 1 180 108"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          />
        </svg>
        <div className="savings__center">
          <span className="savings__pct tnum">{formatPercent(rate)}</span>
          <span className="savings__sub">de tus ingresos</span>
        </div>
      </div>

      <div className="savings__stats">
        <div className="stat">
          <span className="stat__dot stat__dot--in" />
          <span className="stat__label">Ingresos</span>
          <span className="stat__value tnum">{formatCurrency(income)}</span>
        </div>
        <div className="stat">
          <span className="stat__dot stat__dot--out" />
          <span className="stat__label">Gastos</span>
          <span className="stat__value tnum">{formatCurrency(expenses)}</span>
        </div>
        <div className="stat">
          <span className="stat__dot stat__dot--save" />
          <span className="stat__label">Ahorrado</span>
          <span className="stat__value tnum">{formatCurrency(saved)}</span>
        </div>
      </div>
    </section>
  )
}

export default SavingsRate
