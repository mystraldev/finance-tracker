import { Link } from 'react-router-dom'
import Icon from './Icon'
import { formatDate, formatSignedCurrency } from '../utils/format'
import type { EnrichedTransaction } from '../types/finance'

type RecentTransactionsProps = {
  transactions: EnrichedTransaction[]
}

function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section className="card transactions">
      <header className="card__header">
        <h3 className="card__title">Movimientos recientes</h3>
        <Link to="/movimientos" className="card__action">
          Ver todos
        </Link>
      </header>

      <ul className="tx-list">
        {transactions.map((tx) => {
          const isIncome = tx.amount > 0
          return (
            <li key={tx.id} className="tx">
              <span
                className={`tx__icon ${isIncome ? 'tx__icon--in' : ''}`}
                style={{
                  color: tx.color,
                  background: `color-mix(in srgb, ${tx.color} 13%, transparent)`,
                }}
              >
                <Icon name={tx.icon} size={18} />
              </span>
              <div className="tx__info">
                <span className="tx__desc">{tx.description}</span>
                <span className="tx__cat">{tx.category}</span>
              </div>
              <time className="tx__date">{formatDate(tx.date)}</time>
              <span className={`tx__amount tnum ${isIncome ? 'tx__amount--in' : ''}`}>
                {formatSignedCurrency(tx.amount)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default RecentTransactions
