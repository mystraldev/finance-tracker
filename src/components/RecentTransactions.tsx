import type { EnrichedTransaction } from '../types/finance'

import { Link } from 'react-router-dom'

import { formatDate, formatSignedCurrency } from '../utils/format'
import Icon from './Icon'

type RecentTransactionsProperties = {
  transactions: EnrichedTransaction[]
}

function RecentTransactions({ transactions }: RecentTransactionsProperties) {
  return (
    <section className="card transactions">
      <header className="card__header">
        <h3 className="card__title">Movimientos recientes</h3>
        <Link className="card__action" to="/movimientos">
          Ver todos
        </Link>
      </header>

      <ul className="tx-list">
        {transactions.map((tx) => {
          const isIncome = tx.amount > 0
          return (
            <li className="tx" key={tx.id}>
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
