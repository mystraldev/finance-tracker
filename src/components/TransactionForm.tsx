import type { Account, Category, Transaction } from '../types/finance'
import type { FormEvent } from 'react'

import { useState } from 'react'

import { parseDecimal } from '../utils/number'
import Icon from './Icon'

const INCOME_CATEGORY_ID = 'income'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type TransactionFormProperties = {
  accounts: Account[]
  categories: Category[]
  initial?: Transaction
  onSubmit: (tx: Omit<Transaction, 'id'> | (Partial<Transaction> & { id: string })) => void
  onCancel: () => void
}

type ValidationResult = { valid: true } | { valid: false; error: string }

function validateForm(
  amount: string,
  description: string,
  accountId: string,
  type: string,
  categoryId: string,
  date: string,
): ValidationResult {
  const value = parseDecimal(amount)
  if (!Number.isFinite(value) || value <= 0) {
    return { valid: false, error: 'Introduce un importe válido mayor que 0.' }
  }
  if (!description.trim()) {
    return { valid: false, error: 'Añade una descripción.' }
  }
  if (!accountId) {
    return { valid: false, error: 'Selecciona una cuenta.' }
  }
  if (type === 'gasto' && !categoryId) {
    return { valid: false, error: 'Selecciona una categoría.' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { valid: false, error: 'Selecciona una fecha.' }
  }
  return { valid: true }
}

function toPayload(
  amount: string,
  description: string,
  accountId: string,
  type: string,
  categoryId: string,
  date: string,
  initial?: Transaction,
) {
  const value = parseDecimal(amount)
  const signed = type === 'gasto' ? -Math.abs(value) : Math.abs(value)
  return {
    ...(initial?.id && { id: initial.id }),
    accountId,
    categoryId: type === 'ingreso' ? INCOME_CATEGORY_ID : categoryId,
    description: description.trim(),
    date,
    amount: signed,
  }
}

type TypeSelectorProperties = {
  type: string
  onChange: (type: string) => void
}

function TypeSelector({ type, onChange }: TypeSelectorProperties) {
  return (
    <div className="segmented">
      <button
        aria-pressed={type === 'gasto'}
        className={`segmented__btn ${type === 'gasto' ? 'is-active is-expense' : ''}`}
        onClick={() => onChange('gasto')}
        type="button"
      >
        <Icon name="down" size={16} strokeWidth={2.2} /> Gasto
      </button>
      <button
        aria-pressed={type === 'ingreso'}
        className={`segmented__btn ${type === 'ingreso' ? 'is-active is-income' : ''}`}
        onClick={() => onChange('ingreso')}
        type="button"
      >
        <Icon name="up" size={16} strokeWidth={2.2} /> Ingreso
      </button>
    </div>
  )
}

type FieldProperties = {
  value: string
  onChange: (value: string) => void
}

function AmountField({ value, onChange }: FieldProperties) {
  return (
    <label className="field">
      <span className="field__label">Importe</span>
      <div className="field__money">
        <input
          className="field__input"
          inputMode="decimal"
          onChange={(event) => onChange(event.target.value)}
          placeholder="0,00"
          value={value}
        />
        <span className="field__suffix">€</span>
      </div>
    </label>
  )
}

function DescriptionField({ value, onChange }: FieldProperties) {
  return (
    <label className="field">
      <span className="field__label">Descripción</span>
      <input
        className="field__input"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ej. Compra semanal"
        type="text"
        value={value}
      />
    </label>
  )
}

type CategoryFieldProperties = {
  value: string
  onChange: (value: string) => void
  categories: Category[]
}

function CategoryField({ value, onChange, categories }: CategoryFieldProperties) {
  return (
    <label className="field">
      <span className="field__label">Categoría</span>
      <select className="field__input" onChange={(event) => onChange(event.target.value)} value={value}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  )
}

type AccountFieldProperties = {
  value: string
  onChange: (value: string) => void
  accounts: Account[]
}

function AccountField({ value, onChange, accounts }: AccountFieldProperties) {
  return (
    <label className="field">
      <span className="field__label">Cuenta</span>
      <select className="field__input" onChange={(event) => onChange(event.target.value)} value={value}>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function DateField({ value, onChange }: FieldProperties) {
  return (
    <label className="field">
      <span className="field__label">Fecha</span>
      <input className="field__input" onChange={(event) => onChange(event.target.value)} type="date" value={value} />
    </label>
  )
}

function TransactionForm({ accounts, categories, initial, onSubmit, onCancel }: TransactionFormProperties) {
  const expenseCategories = categories.filter((c) => c.id !== INCOME_CATEGORY_ID)
  const isEditingIncome = initial ? initial.amount > 0 : false

  const [type, setType] = useState(isEditingIncome ? 'ingreso' : 'gasto')
  const [amount, setAmount] = useState(initial ? String(Math.abs(initial.amount)) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [categoryId, setCategoryId] = useState(initial && !isEditingIncome ? initial.categoryId : (expenseCategories[0]?.id ?? ''))
  const [accountId, setAccountId] = useState(initial?.accountId ?? accounts[0]?.id ?? '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [error, setError] = useState('')

  function handleSubmit(event_: FormEvent) {
    event_.preventDefault()
    const result = validateForm(amount, description, accountId, type, categoryId, date)
    if (!result.valid) {
      return setError(result.error)
    }
    onSubmit(toPayload(amount, description, accountId, type, categoryId, date, initial))
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <TypeSelector onChange={setType} type={type} />
      <AmountField onChange={setAmount} value={amount} />
      <DescriptionField onChange={setDescription} value={description} />
      {type === 'gasto' && <CategoryField categories={expenseCategories} onChange={setCategoryId} value={categoryId} />}
      <div className="field-row">
        <AccountField accounts={accounts} onChange={setAccountId} value={accountId} />
        <DateField onChange={setDate} value={date} />
      </div>
      {error && <p className="form__error">{error}</p>}
      <div className="form__actions">
        <button className="btn-ghost" onClick={onCancel} type="button">
          Cancelar
        </button>
        <button className="btn-primary" type="submit">
          <Icon name="check" size={18} strokeWidth={2.2} />
          {initial ? 'Guardar cambios' : 'Añadir movimiento'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
