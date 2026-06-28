import type { AccountWithBalance } from '../types/finance'

import { formatCurrency, formatPercent } from '../utils/format'
import Icon from './Icon'
import Sparkline from './Sparkline'

const tagByType: Record<string, string> = {
  cash: 'Disponible',
  savings: 'Remunerada',
  investment: 'Invertido',
}

const accentColor: Record<string, string> = {
  indigo: '#0a6ce0',
  emerald: '#1ea35b',
  violet: '#8d66d9',
}

type SummaryCardsProperties = {
  accounts: (AccountWithBalance & { monthlyGrowthRate: number; history: number[] })[]
}

function SummaryCards({ accounts }: SummaryCardsProperties) {
  return (
    <div className="summary-cards">
      {accounts.map((account, index) => {
        const isPositive = account.monthlyGrowthRate >= 0
        return (
          <article
            className={`summary-card summary-card--${account.accent}`}
            key={account.id}
            style={{ animationDelay: `${0.05 + index * 0.06}s` }}
          >
            <header className="summary-card__header">
              <span className={`icon-tile icon-tile--${account.accent}`}>
                <Icon name={account.icon} size={20} />
              </span>
              <span className="summary-card__tag">{tagByType[account.type]}</span>
            </header>

            <h3 className="summary-card__name">{account.name}</h3>
            <p className="summary-card__balance tnum">{formatCurrency(account.balance)}</p>

            <footer className="summary-card__footer">
              <span className={`delta ${isPositive ? 'delta--up' : 'delta--down'}`}>
                <Icon name={isPositive ? 'up' : 'down'} size={13} strokeWidth={2.4} />
                {formatPercent(Math.abs(account.monthlyGrowthRate))}
              </span>
              {account.type === 'savings' && account.interestRate !== undefined ? (
                <span className="summary-card__note tnum">{formatPercent(account.interestRate)} TAE</span>
              ) : (
                <span className="summary-card__note">este mes</span>
              )}
              <span className="summary-card__spark">
                <Sparkline color={accentColor[account.accent]} data={account.history} fill height={30} id={account.id} width={84} />
              </span>
            </footer>
          </article>
        )
      })}
    </div>
  )
}

export default SummaryCards
