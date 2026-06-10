import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import Icon from './Icon'
import { selectableIcons } from './iconCatalog'
import { formatCurrency } from '../utils/format'
import { parseDecimalAmount } from '../utils/validation'
import type { AccountWithBalance, SavingsGoal } from '../types/finance'

const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981',
  '#14b8a6', '#06b6d4', '#3b82f6', '#64748b',
]

function isTargetDateDraft(value: string): boolean {
  if (!/^[0-9-]*$/.test(value) || value.length > 10) return false
  const [year] = value.split('-')
  return year.length <= 4
}

function isCompleteTargetDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function autoSavedAmount(availableForAccount: number | null, targetText: string): string {
  if (availableForAccount == null) return ''
  const target = parseDecimalAmount(targetText)
  const available = Math.max(availableForAccount, 0)
  const nextSaved = target != null && target > 0
    ? Math.min(available, target)
    : available
  return nextSaved > 0 ? String(nextSaved) : ''
}

type SavingsGoalFormProps = {
  accounts: AccountWithBalance[]
  goals: SavingsGoal[]
  initial?: SavingsGoal
  onSubmit: (goal: Omit<SavingsGoal, 'id'> | Partial<SavingsGoal> & { id: string }) => void
  onCancel: () => void
}

function SavingsGoalForm({
  accounts,
  goals,
  initial,
  onSubmit,
  onCancel,
}: SavingsGoalFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [targetAmount, setTargetAmount] = useState(
    initial ? String(initial.targetAmount) : '',
  )
  const [savedAmount, setSavedAmount] = useState(
    initial ? String(initial.savedAmount) : '',
  )
  const [savedTouched, setSavedTouched] = useState(Boolean(initial))
  const [accountId, setAccountId] = useState(initial?.accountId ?? '')
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '')
  const [color, setColor] = useState(initial?.color ?? PALETTE[0])
  const [icon, setIcon] = useState(initial?.icon ?? 'piggy')
  const [error, setError] = useState('')

  const linkedAccount = accounts.find((account) => account.id === accountId)
  const otherReserved = useMemo(
    () =>
      goals
        .filter((goal) => goal.id !== initial?.id && goal.accountId === accountId)
        .reduce((sum, goal) => sum + goal.savedAmount, 0),
    [accountId, goals, initial?.id],
  )
  const availableForAccount = linkedAccount ? linkedAccount.balance - otherReserved : null

  function availableFor(nextAccountId: string): number | null {
    const account = accounts.find((item) => item.id === nextAccountId)
    if (!account) return null

    const reserved = goals
      .filter((goal) => goal.id !== initial?.id && goal.accountId === nextAccountId)
      .reduce((sum, goal) => sum + goal.savedAmount, 0)
    return account.balance - reserved
  }

  function handleTargetDateKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!/^\d$/.test(event.key)) return

    const input = event.currentTarget
    const selectionStart = input.selectionStart ?? 0
    const selectionEnd = input.selectionEnd ?? selectionStart
    const year = targetDate.split('-')[0] ?? ''
    const replacingYearText = selectionStart < 4 && selectionEnd > selectionStart

    if (year.length >= 4 && selectionStart <= 4 && !replacingYearText) {
      event.preventDefault()
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const target = parseDecimalAmount(targetAmount)
    const saved = parseDecimalAmount(savedAmount || '0')

    if (!name.trim()) return setError('Ponle un nombre al objetivo.')
    if (target == null || target <= 0) {
      return setError('El importe objetivo debe ser mayor que cero.')
    }
    if (saved == null || saved < 0) {
      return setError('El importe reservado no es válido.')
    }
    if (saved > target) {
      return setError('El importe reservado no puede superar el objetivo.')
    }
    if (targetDate && !isCompleteTargetDate(targetDate)) {
      return setError('La fecha objetivo debe tener formato AAAA-MM-DD.')
    }
    if (availableForAccount != null && saved > availableForAccount) {
      return setError(
        `Esta cuenta solo tiene ${formatCurrency(Math.max(availableForAccount, 0))} disponible para reservar.`,
      )
    }

    onSubmit({
      ...(initial?.id ? { id: initial.id } : {}),
      name: name.trim(),
      targetAmount: target,
      savedAmount: saved,
      accountId: accountId || undefined,
      targetDate: targetDate || undefined,
      color,
      icon,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="cat-preview">
        <span
          className="icon-tile"
          style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
        >
          <Icon name={icon} size={22} />
        </span>
        <span className="cat-preview__name">{name.trim() || 'Nuevo objetivo'}</span>
      </div>

      <label className="field">
        <span className="field__label">Nombre</span>
        <input
          className="field__input"
          type="text"
          placeholder="Ej. Fondo de emergencia"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field__label">Objetivo</span>
          <div className="field__money">
            <input
              className="field__input"
              aria-label="Objetivo"
              inputMode="decimal"
              placeholder="0,00"
              value={targetAmount}
              onChange={(event) => {
                const next = event.target.value
                setTargetAmount(next)
                if (!savedTouched) {
                  setSavedAmount(autoSavedAmount(availableForAccount, next))
                }
              }}
            />
            <span className="field__suffix">€</span>
          </div>
        </label>

        <label className="field">
          <span className="field__label">Reservado</span>
          <div className="field__money">
            <input
              className="field__input"
              aria-label="Reservado"
              inputMode="decimal"
              placeholder="0,00"
              value={savedAmount}
              onChange={(event) => {
                setSavedTouched(true)
                setSavedAmount(event.target.value)
              }}
            />
            <span className="field__suffix">€</span>
          </div>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span className="field__label">Cuenta asociada</span>
          <select
            className="field__input"
            value={accountId}
            onChange={(event) => {
              const next = event.target.value
              setAccountId(next)
              if (!savedTouched) {
                setSavedAmount(autoSavedAmount(availableFor(next), targetAmount))
              }
            }}
          >
            <option value="">Sin vincular</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Fecha objetivo</span>
          <input
            className="field__input"
            type="text"
            inputMode="numeric"
            placeholder="AAAA-MM-DD"
            maxLength={10}
            value={targetDate}
            onKeyDown={handleTargetDateKeyDown}
            onChange={(event) => {
              const next = event.target.value
              if (isTargetDateDraft(next)) setTargetDate(next)
            }}
          />
        </label>
      </div>

      {availableForAccount != null && (
        <p className="form__hint">
          Disponible en {linkedAccount?.name}: {formatCurrency(Math.max(availableForAccount, 0))}
        </p>
      )}

      <div className="field">
        <span className="field__label">Color</span>
        <div className="swatches">
          {PALETTE.map((value) => (
            <button
              key={value}
              type="button"
              className={`swatch ${value === color ? 'is-active' : ''}`}
              style={{ background: value }}
              onClick={() => setColor(value)}
              aria-label={`Color ${value}`}
            >
              {value === color && <Icon name="check" size={14} strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label">Icono</span>
        <div className="icon-picker">
          {selectableIcons.map((name) => (
            <button
              key={name}
              type="button"
              className={`icon-pick ${name === icon ? 'is-active' : ''}`}
              style={name === icon ? { color, borderColor: color } : undefined}
              onClick={() => setIcon(name)}
              aria-label={name}
            >
              <Icon name={name} size={18} />
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          <Icon name="check" size={18} strokeWidth={2.2} />
          {initial ? 'Guardar cambios' : 'Crear objetivo'}
        </button>
      </div>
    </form>
  )
}

export default SavingsGoalForm
