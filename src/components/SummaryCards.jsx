import Icon from './Icon'
import Sparkline from './Sparkline'
import { formatCurrency, formatPercent } from '../utils/format'

const tagByType = {
  cash: 'Disponible',
  savings: 'Remunerada',
  investment: 'Invertido',
}

const accentColor = {
  indigo: '#6366f1',
  emerald: '#10b981',
  violet: '#8b5cf6',
}

function SummaryCards({ accounts }) {
  return (
    <div className="summary-cards">
      {accounts.map((account, i) => {
        const positive = account.monthlyGrowthRate >= 0
        return (
          <article
            key={account.id}
            className={`summary-card summary-card--${account.accent}`}
            style={{ animationDelay: `${0.05 + i * 0.06}s` }}
          >
            <header className="summary-card__header">
              <span className={`icon-tile icon-tile--${account.accent}`}>
                <Icon name={account.icon} size={20} />
              </span>
              <span className="summary-card__tag">{tagByType[account.type]}</span>
            </header>

            <h3 className="summary-card__name">{account.name}</h3>
            <p className="summary-card__balance tnum">
              {formatCurrency(account.balance)}
            </p>

            <footer className="summary-card__footer">
              <span className={`delta ${positive ? 'delta--up' : 'delta--down'}`}>
                <Icon name={positive ? 'up' : 'down'} size={13} strokeWidth={2.4} />
                {formatPercent(Math.abs(account.monthlyGrowthRate))}
              </span>
              {account.interestRate != null ? (
                <span className="summary-card__note tnum">
                  {formatPercent(account.interestRate)} TAE
                </span>
              ) : (
                <span className="summary-card__note">este mes</span>
              )}
              <span className="summary-card__spark">
                <Sparkline
                  id={account.id}
                  data={account.history}
                  color={accentColor[account.accent]}
                  width={84}
                  height={30}
                  fill
                />
              </span>
            </footer>
          </article>
        )
      })}
    </div>
  )
}

export default SummaryCards
