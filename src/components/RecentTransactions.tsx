import { Link } from 'react-router-dom'
import Icon from './Icon'
import { formatCurrency, formatDate, formatSignedCurrency } from '../utils/format'
import type { Account, Category, FinanceActivity } from '../types/finance'

type RecentTransactionsProps = {
  activities: FinanceActivity[]
  accounts: Account[]
  categories: Category[]
}

function RecentTransactions({ activities, accounts, categories }: RecentTransactionsProps) {
  const accountById = new Map(accounts.map((account) => [account.id, account]))
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  return (
    <section className="card transactions">
      <header className="card__header">
        <h3 className="card__title">Movimientos recientes</h3>
        <Link to="/movimientos" className="card__action">
          Ver todos
        </Link>
      </header>

      <ul className="tx-list">
        {activities.map((tx) => {
          const isTransfer = tx.kind === 'transfer'
          const category = isTransfer ? null : categoryById.get(tx.categoryId)
          const isIncome = !isTransfer && tx.amount > 0
          const color = isTransfer ? '#6366f1' : category?.color ?? '#64748b'
          return (
            <li key={tx.id} className="tx">
              <span
                className={`tx__icon ${isIncome ? 'tx__icon--in' : ''}`}
                style={{
                  color,
                  background: `color-mix(in srgb, ${color} 13%, transparent)`,
                }}
              >
                <Icon name={isTransfer ? 'transfer' : category?.icon ?? 'package'} size={18} />
              </span>
              <div className="tx__info">
                <span className="tx__desc">{tx.description}</span>
                <span className="tx__cat">
                  {isTransfer
                    ? `${accountById.get(tx.fromAccountId)?.name ?? 'Cuenta'} → ${accountById.get(tx.toAccountId)?.name ?? 'Cuenta'}`
                    : category?.label ?? 'Sin categoría'}
                </span>
              </div>
              <time className="tx__date">{formatDate(tx.date)}</time>
              <span className={`tx__amount tnum ${isIncome ? 'tx__amount--in' : ''}`}>
                {isTransfer ? formatCurrency(tx.amount) : formatSignedCurrency(tx.amount)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default RecentTransactions
