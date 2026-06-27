import type { Category } from '../types/finance'

import { useState } from 'react'

import BudgetProgress from '../components/BudgetProgress'
import CategoryForm from '../components/CategoryForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import MonthSelector from '../components/MonthSelector'
import { useFinance } from '../store/financeContext'
import { categoryBudgets, monthLabel } from '../utils/derive'
import { formatCurrency } from '../utils/format'

const INCOME_CATEGORY_ID = 'income'

function monthlyUsage(id: string, transactions: { categoryId: string; amount: number }[]) {
  const txs = transactions.filter((t) => t.categoryId === id)
  return {
    count: txs.length,
    total: txs.reduce((s, t) => s + Math.abs(t.amount), 0),
  }
}

function usageCount(id: string, transactions: { categoryId: string }[]) {
  return transactions.filter((t) => t.categoryId === id).length
}

function handleDelete(
  cat: Category,
  transactions: { categoryId: string }[],
  onBlocked: (cat: Category) => void,
  onDeleting: (cat: Category) => void,
) {
  if (usageCount(cat.id, transactions) > 0) onBlocked(cat)
  else onDeleting(cat)
}

function CreateModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (cat: Omit<Category, 'id'>) => void
}) {
  if (!open) return
  return (
    <Modal onClose={onClose} title="Nueva categoría">
      <CategoryForm
        onCancel={onClose}
        onSubmit={(cat) => {
          onSave(cat as Omit<Category, 'id'>)
          onClose()
        }}
      />
    </Modal>
  )
}

function EditModal({
  category,
  onClose,
  onSave,
}: {
  category: Category | undefined
  onClose: () => void
  onSave: (cat: Partial<Category> & { id: string }) => void
}) {
  if (!category) return
  return (
    <Modal onClose={onClose} title="Editar categoría">
      <CategoryForm
        initial={category}
        onCancel={onClose}
        onSubmit={(cat) => {
          onSave(cat as Partial<Category> & { id: string })
          onClose()
        }}
      />
    </Modal>
  )
}

function DeleteConfirm({
  category,
  onCancel,
  onConfirm,
}: {
  category: Category | undefined
  onCancel: () => void
  onConfirm: (id: string) => void
}) {
  if (!category) return
  return (
    <ConfirmDialog
      message={`¿Seguro que quieres borrar "${category.label}"?`}
      onCancel={onCancel}
      onConfirm={() => {
        onConfirm(category.id)
        onCancel()
      }}
      title="Borrar categoría"
    />
  )
}

function BlockedModal({
  category,
  onClose,
}: {
  category: Category | undefined
  onClose: () => void
}) {
  if (!category) return
  return (
    <Modal onClose={onClose} title="No se puede borrar">
      <p className="confirm__message">
        La categoría <strong>{category.label}</strong> tiene movimientos asociados.
        Reasigna o borra esos movimientos antes de eliminarla.
      </p>
      <div className="form__actions">
        <button className="btn-primary" onClick={onClose} type="button">
          Entendido
        </button>
      </div>
    </Modal>
  )
}

function CategoriesPage() {
  const { categories, transactions, selectedMonth, getTransactions, addCategory, updateCategory, deleteCategory } =
    useFinance()

  const selectedMonthTransactions = getTransactions({ month: selectedMonth })

  const budgetById = new Map(
    categoryBudgets(transactions, categories, selectedMonth).map((b) => [b.id, b]),
  )

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Category | undefined>(undefined)
  const [deleting, setDeleting] = useState<Category | undefined>(undefined)
  const [blocked, setBlocked] = useState<Category | undefined>(undefined)

  const managed = categories.filter((c) => c.id !== INCOME_CATEGORY_ID)

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
          <button className="btn-primary" onClick={() => setCreating(true)} type="button">
            <Icon name="plus" size={18} strokeWidth={2.2} />
            Nueva categoría
          </button>
        </div>
      </header>

      <div className="cat-grid">
        {managed.map((c) => {
          const { count, total } = monthlyUsage(c.id, selectedMonthTransactions)
          const budget = budgetById.get(c.id)
          return (
            <article className="cat-card" key={c.id}>
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
                    className="cat-budget-cta"
                    onClick={() => setEditing(c)}
                    type="button"
                  >
                    Definir presupuesto
                  </button>
                )}
              </div>
              <div className="cat-card__actions">
                <button
                  aria-label="Editar"
                  className="icon-btn"
                  onClick={() => setEditing(c)}
                  type="button"
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  aria-label="Borrar"
                  className="icon-btn icon-btn--danger"
                  onClick={() => handleDelete(c, transactions, setBlocked, setDeleting)}
                  type="button"
                >
                  <Icon name="delete" size={16} />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <CreateModal
        onClose={() => setCreating(false)}
        onSave={(cat) => addCategory(cat)}
        open={creating}
      />

      <EditModal
        category={editing}
        onClose={() => setEditing(undefined)}
        onSave={(cat) => updateCategory(cat)}
      />

      <DeleteConfirm
        category={deleting}
        onCancel={() => setDeleting(undefined)}
        onConfirm={(id) => deleteCategory(id)}
      />

      <BlockedModal
        category={blocked}
        onClose={() => setBlocked(undefined)}
      />
    </>
  )
}

export default CategoriesPage
