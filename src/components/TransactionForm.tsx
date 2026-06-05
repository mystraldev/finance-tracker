import { useState, type FormEvent } from 'react'
import Icon from './Icon'
import type { Account, Category, Transaction } from '../types/finance'

const INCOME_CATEGORY_ID = 'income'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function parseAmount(text: string): number {
  const value = parseFloat(String(text).replace(',', '.'))
  return Number.isFinite(value) ? value : NaN
}

type TransactionFormProps = {
  accounts: Account[]
  categories: Category[]
  initial?: Transaction
  onSubmit: (tx: Omit<Transaction, 'id'> | Partial<Transaction> & { id: string }) => void
  onCancel: () => void
}

function TransactionForm({ accounts, categories, initial, onSubmit, onCancel }: TransactionFormProps) {
  const expenseCategories = categories.filter((c) => c.id !== INCOME_CATEGORY_ID)
  const isEditingIncome = initial ? initial.amount > 0 : false

  const [type, setType] = useState(isEditingIncome ? 'ingreso' : 'gasto')
  const [amount, setAmount] = useState(initial ? String(Math.abs(initial.amount)) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [categoryId, setCategoryId] = useState(
    initial && !isEditingIncome
      ? initial.categoryId
      : (expenseCategories[0]?.id ?? ''),
  )
  const [accountId, setAccountId] = useState(initial?.accountId ?? accounts[0]?.id ?? '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = parseAmount(amount)
    if (!Number.isFinite(value) || value <= 0) {
      return setError('Introduce un importe válido mayor que 0.')
    }
    if (!description.trim()) {
      return setError('Añade una descripción.')
    }
    if (!accountId) {
      return setError('Selecciona una cuenta.')
    }
    if (type === 'gasto' && !categoryId) {
      return setError('Selecciona una categoría.')
    }

    const signed = type === 'gasto' ? -Math.abs(value) : Math.abs(value)
    onSubmit({
      ...(initial?.id ? { id: initial.id } : {}),
      accountId,
      categoryId: type === 'ingreso' ? INCOME_CATEGORY_ID : categoryId,
      description: description.trim(),
      date,
      amount: signed,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="segmented">
        <button
          type="button"
          className={`segmented__btn ${type === 'gasto' ? 'is-active is-expense' : ''}`}
          onClick={() => setType('gasto')}
          aria-pressed={type === 'gasto'}
        >
          <Icon name="down" size={16} strokeWidth={2.2} /> Gasto
        </button>
        <button
          type="button"
          className={`segmented__btn ${type === 'ingreso' ? 'is-active is-income' : ''}`}
          onClick={() => setType('ingreso')}
          aria-pressed={type === 'ingreso'}
        >
          <Icon name="up" size={16} strokeWidth={2.2} /> Ingreso
        </button>
      </div>

      <label className="field">
        <span className="field__label">Importe</span>
        <div className="field__money">
          <input
            className="field__input"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
          <span className="field__suffix">€</span>
        </div>
      </label>

      <label className="field">
        <span className="field__label">Descripción</span>
        <input
          className="field__input"
          type="text"
          placeholder="Ej. Compra semanal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      {type === 'gasto' && (
        <label className="field">
          <span className="field__label">Categoría</span>
          <select
            className="field__input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="field-row">
        <label className="field">
          <span className="field__label">Cuenta</span>
          <select
            className="field__input"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Fecha</span>
          <input
            className="field__input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          <Icon name="check" size={18} strokeWidth={2.2} />
          {initial ? 'Guardar cambios' : 'Añadir movimiento'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
