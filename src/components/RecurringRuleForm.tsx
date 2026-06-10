import { useState, type FormEvent } from 'react'
import Icon from './Icon'
import { parseDecimalAmount } from '../utils/validation'
import type { Account, Category, RecurringRule, RecurringRuleDraft } from '../types/finance'

const INCOME_CATEGORY_ID = 'income'

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

type RecurringRuleFormProps = {
  accounts: Account[]
  categories: Category[]
  initial?: RecurringRule
  onSubmit: (rule: RecurringRuleDraft | Partial<RecurringRule> & { id: string }) => void
  onCancel: () => void
}

function RecurringRuleForm({
  accounts,
  categories,
  initial,
  onSubmit,
  onCancel,
}: RecurringRuleFormProps) {
  const expenseCategories = categories.filter((category) => category.id !== INCOME_CATEGORY_ID)
  const [type, setType] = useState<RecurringRule['type']>(initial?.type ?? 'expense')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [dayOfMonth, setDayOfMonth] = useState(initial ? String(initial.dayOfMonth) : '1')
  const [accountId, setAccountId] = useState(
    initial && initial.type !== 'transfer' ? initial.accountId : accounts[0]?.id ?? '',
  )
  const [categoryId, setCategoryId] = useState(
    initial && initial.type !== 'transfer'
      ? initial.categoryId
      : expenseCategories[0]?.id ?? INCOME_CATEGORY_ID,
  )
  const [fromAccountId, setFromAccountId] = useState(
    initial?.type === 'transfer' ? initial.fromAccountId : accounts[0]?.id ?? '',
  )
  const [toAccountId, setToAccountId] = useState(
    initial?.type === 'transfer'
      ? initial.toAccountId
      : accounts.find((account) => account.id !== (accounts[0]?.id ?? ''))?.id ?? '',
  )
  const [startMonth, setStartMonth] = useState(initial?.startMonth ?? currentMonth())
  const [endMonth, setEndMonth] = useState(initial?.endMonth ?? '')
  const [active, setActive] = useState(initial?.active ?? true)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const parsedAmount = parseDecimalAmount(amount)
    const day = Number(dayOfMonth)

    if (!description.trim()) return setError('Añade una descripción.')
    if (parsedAmount == null || parsedAmount <= 0) return setError('Introduce un importe válido mayor que 0.')
    if (!Number.isInteger(day) || day < 1 || day > 31) return setError('El día debe estar entre 1 y 31.')
    if (!/^\d{4}-\d{2}$/.test(startMonth)) return setError('Selecciona un mes de inicio.')
    if (endMonth && (!/^\d{4}-\d{2}$/.test(endMonth) || endMonth < startMonth)) {
      return setError('El mes final debe ser posterior al inicio.')
    }

    const common = {
      ...(initial?.id ? { id: initial.id } : {}),
      description: description.trim(),
      amount: parsedAmount,
      dayOfMonth: day,
      startMonth,
      endMonth: endMonth || undefined,
      active,
      frequency: 'monthly' as const,
    }

    if (type === 'transfer') {
      if (!fromAccountId || !toAccountId) return setError('Selecciona las dos cuentas.')
      if (fromAccountId === toAccountId) return setError('El origen y destino deben ser distintos.')
      onSubmit({
        ...common,
        type,
        fromAccountId,
        toAccountId,
      })
      return
    }

    if (!accountId) return setError('Selecciona una cuenta.')
    const nextCategoryId = type === 'income' ? INCOME_CATEGORY_ID : categoryId
    if (!nextCategoryId) return setError('Selecciona una categoría.')
    onSubmit({
      ...common,
      type,
      accountId,
      categoryId: nextCategoryId,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="segmented">
        <button
          type="button"
          className={`segmented__btn ${type === 'expense' ? 'is-active is-expense' : ''}`}
          onClick={() => setType('expense')}
          aria-pressed={type === 'expense'}
        >
          <Icon name="down" size={16} strokeWidth={2.2} /> Gasto
        </button>
        <button
          type="button"
          className={`segmented__btn ${type === 'income' ? 'is-active is-income' : ''}`}
          onClick={() => setType('income')}
          aria-pressed={type === 'income'}
        >
          <Icon name="up" size={16} strokeWidth={2.2} /> Ingreso
        </button>
        <button
          type="button"
          className={`segmented__btn ${type === 'transfer' ? 'is-active is-transfer' : ''}`}
          onClick={() => setType('transfer')}
          aria-pressed={type === 'transfer'}
        >
          <Icon name="transfer" size={16} strokeWidth={2.2} /> Traspaso
        </button>
      </div>

      <label className="field">
        <span className="field__label">Descripción</span>
        <input
          className="field__input"
          type="text"
          placeholder="Ej. Alquiler"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          autoFocus
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field__label">Importe</span>
          <div className="field__money">
            <input
              className="field__input"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <span className="field__suffix">€</span>
          </div>
        </label>
        <label className="field">
          <span className="field__label">Día del mes</span>
          <input
            className="field__input"
            type="number"
            min={1}
            max={31}
            value={dayOfMonth}
            onChange={(event) => setDayOfMonth(event.target.value)}
          />
        </label>
      </div>

      {type === 'transfer' ? (
        <div className="field-row">
          <label className="field">
            <span className="field__label">Desde</span>
            <select className="field__input" value={fromAccountId} onChange={(event) => setFromAccountId(event.target.value)}>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Hacia</span>
            <select className="field__input" value={toAccountId} onChange={(event) => setToAccountId(event.target.value)}>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="field-row">
          <label className="field">
            <span className="field__label">Cuenta</span>
            <select className="field__input" value={accountId} onChange={(event) => setAccountId(event.target.value)}>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </label>
          {type === 'expense' && (
            <label className="field">
              <span className="field__label">Categoría</span>
              <select className="field__input" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <div className="field-row">
        <label className="field">
          <span className="field__label">Inicio</span>
          <input className="field__input" type="month" value={startMonth} onChange={(event) => setStartMonth(event.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Fin opcional</span>
          <input className="field__input" type="month" value={endMonth} onChange={(event) => setEndMonth(event.target.value)} />
        </label>
      </div>

      <label className="check-field">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        <span>Regla activa</span>
      </label>

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          <Icon name="check" size={18} strokeWidth={2.2} />
          {initial ? 'Guardar cambios' : 'Crear regla'}
        </button>
      </div>
    </form>
  )
}

export default RecurringRuleForm
