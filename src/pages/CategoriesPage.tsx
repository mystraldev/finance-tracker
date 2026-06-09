import { useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import CategoryForm from '../components/CategoryForm'
import ConfirmDialog from '../components/ConfirmDialog'
import MonthSelector from '../components/MonthSelector'
import BudgetProgress from '../components/BudgetProgress'
import { useFinance } from '../store/financeContext'
import { categoryBudgets, monthLabel } from '../utils/derive'
import { formatCurrency } from '../utils/format'
import type { Category } from '../types/finance'

const INCOME_CATEGORY_ID = 'income'

function CategoriesPage() {
  const { categories, transactions, selectedMonth, getTransactions, addCategory, updateCategory, deleteCategory } =
    useFinance()

  const selectedMonthTransactions = getTransactions({ month: selectedMonth })

  // Budget status (for the selected month) indexed by category id.
  const budgetById = new Map(
    categoryBudgets(transactions, categories, selectedMonth).map((b) => [b.id, b]),
  )

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [blocked, setBlocked] = useState<Category | null>(null)

  const managed = categories.filter((c) => c.id !== INCOME_CATEGORY_ID)

  const monthlyUsage = (id: string) => {
    const txs = selectedMonthTransactions.filter((t) => t.categoryId === id)
    return {
      count: txs.length,
      total: txs.reduce((s, t) => s + Math.abs(t.amount), 0),
    }
  }

  const usageCount = (id: string) => transactions.filter((t) => t.categoryId === id).length

  function handleDelete(cat: Category) {
    if (usageCount(cat.id) > 0) setBlocked(cat)
    else setDeleting(cat)
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__greeting">Tus finanzas</p>
          <h1 className="page-header__title">Categorías</h1>
          <p className="page-header__description">Presupuestos de {monthLabel(selectedMonth)}</p>
        </div>
        <div className="page-header__actions">
          <MonthSelector />
          <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
            <Icon name="plus" size={18} strokeWidth={2.2} />
            Nueva categoría
          </button>
        </div>
      </header>

      <div className="cat-grid">
        {managed.map((c) => {
          const { count, total } = monthlyUsage(c.id)
          const budget = budgetById.get(c.id)
          return (
            <article key={c.id} className="cat-card">
              <span
                className="icon-tile"
                style={{ color: c.color, background: `color-mix(in srgb, ${c.color} 14%, transparent)` }}
              >
                <Icon name={c.icon} size={20} />
              </span>
              <div className="cat-card__info">
                <span className="cat-card__name">{c.label}</span>
                <span className="cat-card__meta">
                  <span>{count} {count === 1 ? 'movimiento' : 'movimientos'} este mes</span>
                  <span className="tnum">{formatCurrency(total)}</span>
                </span>
                {budget && (
                  <div className="cat-budget">
                    <BudgetProgress budget={budget} />
                  </div>
                )}
                {!budget && (
                  <button
                    type="button"
                    className="cat-budget-cta"
                    onClick={() => setEditing(c)}
                  >
                    Definir presupuesto
                  </button>
                )}
              </div>
              <div className="cat-card__actions">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Editar"
                  onClick={() => setEditing(c)}
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  aria-label="Borrar"
                  onClick={() => handleDelete(c)}
                >
                  <Icon name="delete" size={16} />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {creating && (
        <Modal title="Nueva categoría" onClose={() => setCreating(false)}>
          <CategoryForm
            onSubmit={(cat) => {
              addCategory(cat as Omit<Category, 'id'>)
              setCreating(false)
            }}
            onCancel={() => setCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar categoría" onClose={() => setEditing(null)}>
          <CategoryForm
            initial={editing}
            onSubmit={(cat) => {
              updateCategory(cat as Partial<Category> & { id: string })
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Borrar categoría"
          message={`¿Seguro que quieres borrar "${deleting.label}"?`}
          onConfirm={() => {
            deleteCategory(deleting.id)
            setDeleting(null)
          }}
          onCancel={() => setDeleting(null)}
        />
      )}

      {blocked && (
        <Modal title="No se puede borrar" onClose={() => setBlocked(null)}>
          <p className="confirm__message">
            La categoría <strong>{blocked.label}</strong> tiene movimientos asociados.
            Reasigna o borra esos movimientos antes de eliminarla.
          </p>
          <div className="form__actions">
            <button type="button" className="btn-primary" onClick={() => setBlocked(null)}>
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default CategoriesPage
