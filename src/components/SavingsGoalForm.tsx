import type { AccountWithBalance, SavingsGoal } from '../types/finance'
import type { FormEvent } from 'react'

import { useMemo, useState } from 'react'

import { formatCurrency } from '../utils/format'
import { parseDecimal } from '../utils/number'
import Icon from './Icon'
import { selectableIcons } from './iconCatalog'

const PALETTE = ['#0a6ce0', '#8d66d9', '#ec4899', '#f43f5e', '#f59e0b', '#1ea35b', '#14b8a6', '#06b6d4', '#3b82f6', '#64748b']

function isCompleteTargetDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function autoSavedAmount(availableForAccount: number | undefined, targetText: string): string {
  if (availableForAccount === undefined) return ''
  const available = Math.max(availableForAccount, 0)
  const target = parseDecimal(targetText)
  const nextSaved = Number.isFinite(target) && target > 0 ? Math.min(available, target) : available
  return nextSaved > 0 ? String(nextSaved) : ''
}

function availableFor(
  nextAccountId: string,
  accounts: AccountWithBalance[],
  goals: SavingsGoal[],
  initialId: string | undefined,
): number | undefined {
  const account = accounts.find((item) => item.id === nextAccountId)
  if (!account) return undefined
  const reserved = goals.filter((g) => g.id !== initialId && g.accountId === nextAccountId).reduce((sum, g) => sum + g.savedAmount, 0)
  return account.balance - reserved
}

function validateGoal(
  name: string,
  targetAmount: string,
  savedAmount: string,
  targetDate: string,
  availableForAccount: number | undefined,
): string | null {
  if (!name.trim()) return 'Ponle un nombre al objetivo.'
  const target = parseDecimal(targetAmount)
  if (!Number.isFinite(target) || target <= 0) {
    return 'El importe objetivo debe ser mayor que cero.'
  }
  const saved = parseDecimal(savedAmount || '0')
  if (!Number.isFinite(saved) || saved < 0) {
    return 'El importe reservado no es válido.'
  }
  if (saved > target) {
    return 'El importe reservado no puede superar el objetivo.'
  }
  if (targetDate && !isCompleteTargetDate(targetDate)) {
    return 'La fecha objetivo no es válida.'
  }
  if (availableForAccount !== undefined && saved > availableForAccount) {
    return `Esta cuenta solo tiene ${formatCurrency(Math.max(availableForAccount, 0))} disponible para reservar.`
  }
}

function Preview({ name, color, icon }: { name: string; color: string; icon: string }) {
  return (
    <div className="cat-preview">
      <span className="icon-tile" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
        <Icon name={icon} size={22} />
      </span>
      <span className="cat-preview__name">{name.trim() || 'Nuevo objetivo'}</span>
    </div>
  )
}

function BudgetFields({
  targetAmount,
  setTargetAmount,
  savedAmount,
  setSavedAmount,
  savedTouched,
  setSavedTouched,
  availableForAccount,
}: {
  targetAmount: string
  setTargetAmount: (v: string) => void
  savedAmount: string
  setSavedAmount: (v: string) => void
  savedTouched: boolean
  setSavedTouched: (isTouched: boolean) => void
  availableForAccount: number | undefined
}) {
  return (
    <div className="field-row">
      <label className="field">
        <span className="field__label">Objetivo</span>
        <div className="field__money">
          <input
            aria-label="Objetivo"
            className="field__input"
            inputMode="decimal"
            onChange={(event) => {
              const next = event.target.value
              setTargetAmount(next)
              if (!savedTouched) {
                setSavedAmount(autoSavedAmount(availableForAccount, next))
              }
            }}
            placeholder="0,00"
            value={targetAmount}
          />
          <span className="field__suffix">€</span>
        </div>
      </label>

      <label className="field">
        <span className="field__label">Reservado</span>
        <div className="field__money">
          <input
            aria-label="Reservado"
            className="field__input"
            inputMode="decimal"
            onChange={(event) => {
              setSavedTouched(true)
              setSavedAmount(event.target.value)
            }}
            placeholder="0,00"
            value={savedAmount}
          />
          <span className="field__suffix">€</span>
        </div>
      </label>
    </div>
  )
}

function AccountDateFields({
  accounts,
  goals,
  initial,
  accountId,
  setAccountId,
  targetDate,
  setTargetDate,
  savedTouched,
  setSavedAmount,
  targetAmount,
}: {
  accounts: AccountWithBalance[]
  goals: SavingsGoal[]
  initial?: SavingsGoal
  accountId: string
  setAccountId: (v: string) => void
  targetDate: string
  setTargetDate: (v: string) => void
  savedTouched: boolean
  setSavedAmount: (v: string) => void
  targetAmount: string
}) {
  return (
    <div className="field-row">
      <label className="field">
        <span className="field__label">Cuenta asociada</span>
        <select
          className="field__input"
          onChange={(event) => {
            const next = event.target.value
            setAccountId(next)
            if (!savedTouched) {
              setSavedAmount(autoSavedAmount(availableFor(next, accounts, goals, initial?.id), targetAmount))
            }
          }}
          value={accountId}
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
        <input className="field__input" onChange={(event) => setTargetDate(event.target.value)} type="date" value={targetDate} />
      </label>
    </div>
  )
}

function ColorSwatches({ color, setColor }: { color: string; setColor: (v: string) => void }) {
  return (
    <div className="field">
      <span className="field__label">Color</span>
      <div className="swatches">
        {PALETTE.map((value) => (
          <button
            aria-label={`Color ${value}`}
            className={`swatch ${value === color ? 'is-active' : ''}`}
            key={value}
            onClick={() => setColor(value)}
            style={{ background: value }}
            type="button"
          >
            {value === color && <Icon name="check" size={14} strokeWidth={3} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function IconPicker({ icon, setIcon, color }: { icon: string; setIcon: (v: string) => void; color: string }) {
  return (
    <div className="field">
      <span className="field__label">Icono</span>
      <div className="icon-picker">
        {selectableIcons.map((name) => (
          <button
            aria-label={name}
            className={`icon-pick ${name === icon ? 'is-active' : ''}`}
            key={name}
            onClick={() => setIcon(name)}
            style={name === icon ? { color, borderColor: color } : undefined}
            type="button"
          >
            <Icon name={name} size={18} />
          </button>
        ))}
      </div>
    </div>
  )
}

function useSavingsGoalFormState({
  accounts,
  goals,
  initial,
}: {
  accounts: AccountWithBalance[]
  goals: SavingsGoal[]
  initial?: SavingsGoal
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [targetAmount, setTargetAmount] = useState(initial ? String(initial.targetAmount) : '')
  const [savedAmount, setSavedAmount] = useState(initial ? String(initial.savedAmount) : '')
  const [savedTouched, setSavedTouched] = useState(Boolean(initial))
  const [accountId, setAccountId] = useState(initial?.accountId ?? '')
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '')
  const [color, setColor] = useState(initial?.color ?? PALETTE[0])
  const [icon, setIcon] = useState(initial?.icon ?? 'piggy')
  const [error, setError] = useState('')

  const linkedAccount = useMemo(() => accounts.find((a) => a.id === accountId), [accounts, accountId])
  const otherReserved = useMemo(
    () => goals.filter((g) => g.id !== initial?.id && g.accountId === accountId).reduce((sum, g) => sum + g.savedAmount, 0),
    [accountId, goals, initial?.id],
  )
  const availableForAccount = linkedAccount ? linkedAccount.balance - otherReserved : undefined

  return {
    name,
    setName,
    targetAmount,
    setTargetAmount,
    savedAmount,
    setSavedAmount,
    savedTouched,
    setSavedTouched,
    accountId,
    setAccountId,
    targetDate,
    setTargetDate,
    color,
    setColor,
    icon,
    setIcon,
    error,
    setError,
    linkedAccount,
    availableForAccount,
  }
}

type SavingsGoalFormProperties = {
  accounts: AccountWithBalance[]
  goals: SavingsGoal[]
  initial?: SavingsGoal
  onSubmit: (goal: Omit<SavingsGoal, 'id'> | (Partial<SavingsGoal> & { id: string })) => void
  onCancel: () => void
}

function SavingsGoalForm({ accounts, goals, initial, onSubmit, onCancel }: SavingsGoalFormProperties) {
  const {
    name,
    setName,
    targetAmount,
    setTargetAmount,
    savedAmount,
    setSavedAmount,
    savedTouched,
    setSavedTouched,
    accountId,
    setAccountId,
    targetDate,
    setTargetDate,
    color,
    setColor,
    icon,
    setIcon,
    error,
    setError,
    linkedAccount,
    availableForAccount,
  } = useSavingsGoalFormState({ accounts, goals, initial })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationError = validateGoal(name, targetAmount, savedAmount, targetDate, availableForAccount)
    if (validationError) {
      setError(validationError)
      return
    }
    onSubmit({
      ...(initial?.id && { id: initial.id }),
      name: name.trim(),
      targetAmount: parseDecimal(targetAmount),
      savedAmount: parseDecimal(savedAmount || '0'),
      accountId: accountId || undefined,
      targetDate: targetDate || undefined,
      color,
      icon,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Preview color={color} icon={icon} name={name} />

      <label className="field">
        <span className="field__label">Nombre</span>
        <input
          className="field__input"
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej. Fondo de emergencia"
          type="text"
          value={name}
        />
      </label>

      <BudgetFields
        availableForAccount={availableForAccount}
        savedAmount={savedAmount}
        savedTouched={savedTouched}
        setSavedAmount={setSavedAmount}
        setSavedTouched={setSavedTouched}
        setTargetAmount={setTargetAmount}
        targetAmount={targetAmount}
      />

      <AccountDateFields
        accountId={accountId}
        accounts={accounts}
        goals={goals}
        initial={initial}
        savedTouched={savedTouched}
        setAccountId={setAccountId}
        setSavedAmount={setSavedAmount}
        setTargetDate={setTargetDate}
        targetAmount={targetAmount}
        targetDate={targetDate}
      />

      {availableForAccount !== undefined && (
        <p className="form__hint">
          Disponible en {linkedAccount?.name}: {formatCurrency(Math.max(availableForAccount, 0))}
        </p>
      )}

      <ColorSwatches color={color} setColor={setColor} />

      <IconPicker color={color} icon={icon} setIcon={setIcon} />

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button className="btn-ghost" onClick={onCancel} type="button">
          Cancelar
        </button>
        <button className="btn-primary" type="submit">
          <Icon name="check" size={18} strokeWidth={2.2} />
          {initial ? 'Guardar cambios' : 'Crear objetivo'}
        </button>
      </div>
    </form>
  )
}

export default SavingsGoalForm
