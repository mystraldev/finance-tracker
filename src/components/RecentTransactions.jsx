import Icon from './Icon'
import { formatDate, formatSignedCurrency } from '../utils/format'

function RecentTransactions({ transactions }) {
  return (
    <section className="card transactions">
      <header className="card__header">
        <h3 className="card__title">Movimientos recientes</h3>
        <button type="button" className="card__action" disabled>
          Ver todos
        </button>
      </header>

      <ul className="tx-list">
        {transactions.map((tx) => {
          const isIncome = tx.amount > 0
          return (
            <li key={tx.id} className="tx">
              <span className={`tx__icon ${isIncome ? 'tx__icon--in' : ''}`}>
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
