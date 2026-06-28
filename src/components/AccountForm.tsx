import type { Account } from '../types/finance'
import type { FormEvent } from 'react'

import { useState } from 'react'

import { parseDecimal } from '../utils/number'
import Icon from './Icon'

const TYPES = [
  { value: 'cash', label: 'Efectivo / corriente', icon: 'wallet' },
  { value: 'savings', label: 'Ahorro / remunerada', icon: 'piggy' },
  { value: 'investment', label: 'Inversión', icon: 'trending' },
] as const

const ACCENTS = [
  { value: 'indigo', color: '#0a6ce0' },
  { value: 'emerald', color: '#1ea35b' },
  { value: 'violet', color: '#8d66d9' },
] as const

const ACCOUNT_ICONS = ['wallet', 'piggy', 'trending', 'card', 'accounts'] as const

type AccountFormProperties = {
  initial?: Account
  onSubmit: (accumulator: Omit<Account, 'id'> | (Partial<Account> & { id: string })) => void
  onCancel: () => void
}

function getAccentColor(accent: string): string {
  return ACCENTS.find((a) => a.value === accent)?.color ?? '#0a6ce0'
}

function AccountPreview({
  accentColor,
  icon,
  name,
}: {
  accentColor: string
  icon: string
  name: string
}) {
  return (
    <div className="cat-preview">
      <span
        className="icon-tile"
        style={{
          color: accentColor,
          background: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
        }}
      >
        <Icon name={icon} size={22} />
      </span>
      <span className="cat-preview__name">{name.trim() || 'Nueva cuenta'}</span>
    </div>
  )
}

function BalanceFields({
  type,
  openingBalance,
  onOpeningBalanceChange,
  interestRate,
  onInterestRateChange,
}: {
  type: string
  openingBalance: string
  onOpeningBalanceChange: (value: string) => void
  interestRate: string
  onInterestRateChange: (value: string) => void
}) {
  return (
    <div className="field-row">
      <label className="field">
        <span className="field__label">Saldo inicial</span>
        <div className="field__money">
          <input
            className="field__input"
            inputMode="decimal"
            onChange={(event_) => onOpeningBalanceChange(event_.target.value)}
            placeholder="0,00"
            value={openingBalance}
          />
          <span className="field__suffix">€</span>
        </div>
      </label>

      {type === 'savings' && (
        <label className="field">
          <span className="field__label">Interés (TAE)</span>
          <div className="field__money">
            <input
              className="field__input"
              inputMode="decimal"
              onChange={(event_) => onInterestRateChange(event_.target.value)}
              placeholder="2,75"
              value={interestRate}
            />
            <span className="field__suffix">%</span>
          </div>
        </label>
      )}
    </div>
  )
}

function ColorSwatches({
  accent,
  onAccentChange,
}: {
  accent: string
  onAccentChange: (value: string) => void
}) {
  return (
    <div className="field">
      <span className="field__label">Color</span>
      <div className="swatches">
        {ACCENTS.map((a) => (
          <button
            aria-label={a.value}
            className={`swatch ${a.value === accent ? 'is-active' : ''}`}
            key={a.value}
            onClick={() => onAccentChange(a.value)}
            style={{ background: a.color }}
            type="button"
          >
            {a.value === accent && <Icon name="check" size={14} strokeWidth={3} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function IconPicker({
  icon,
  onIconChange,
  accentColor,
}: {
  icon: string
  onIconChange: (value: string) => void
  accentColor: string
}) {
  return (
    <div className="field">
      <span className="field__label">Icono</span>
      <div className="icon-picker">
        {ACCOUNT_ICONS.map((name) => (
          <button
            aria-label={name}
            className={`icon-pick ${name === icon ? 'is-active' : ''}`}
            key={name}
            onClick={() => onIconChange(name)}
            style={name === icon ? { color: accentColor } : undefined}
            type="button"
          >
            <Icon name={name} size={18} />
          </button>
        ))}
      </div>
    </div>
  )
}

function AccountForm({ initial, onSubmit, onCancel }: AccountFormProperties) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState(initial?.type ?? 'cash')
  const [icon, setIcon] = useState(initial?.icon ?? 'wallet')
  const [accent, setAccent] = useState(initial?.accent ?? 'indigo')
  const accentColor = getAccentColor(accent)
  const [openingBalance, setOpeningBalance] = useState(
    initial ? String(initial.openingBalance) : '',
  )
  const [interestRate, setInterestRate] = useState(
    initial?.interestRate === undefined ? '' : String(initial.interestRate * 100),
  )
  const [error, setError] = useState('')

  function handleSubmit(event_: FormEvent) {
    event_.preventDefault()
    if (!name.trim()) return setError('Ponle un nombre a la cuenta.')
    const opening = parseDecimal(openingBalance || '0')
    if (!Number.isFinite(opening)) return setError('El saldo inicial no es válido.')

    const rate = type === 'savings' ? parseDecimal(interestRate || '0') : NaN
    const payload: Omit<Account, 'id'> | (Partial<Account> & { id: string }) = {
      ...(initial?.id && { id: initial.id }),
      name: name.trim(),
      type,
      icon,
      accent,
      openingBalance: opening,
      interestRate: type === 'savings' && Number.isFinite(rate) ? rate / 100 : undefined,
    }
    onSubmit(payload)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <AccountPreview accentColor={accentColor} icon={icon} name={name} />

      <label className="field">
        <span className="field__label">Nombre</span>
        <input
          className="field__input"
          onChange={(event_) => setName(event_.target.value)}
          placeholder="Ej. Cuenta nómina"
          type="text"
          value={name}
        />
      </label>

      <label className="field">
        <span className="field__label">Tipo</span>
        <select
          className="field__input"
          onChange={(event_) => {
            const next = event_.target.value
            setType(next as 'cash' | 'savings' | 'investment')
            setIcon(TYPES.find((t) => t.value === next)?.icon ?? 'wallet')
          }}
          value={type}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <BalanceFields
        interestRate={interestRate}
        onInterestRateChange={setInterestRate}
        onOpeningBalanceChange={setOpeningBalance}
        openingBalance={openingBalance}
        type={type}
      />

      <ColorSwatches accent={accent} onAccentChange={setAccent} />
      <IconPicker accentColor={accentColor} icon={icon} onIconChange={setIcon} />

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button className="btn-ghost" onClick={onCancel} type="button">
          Cancelar
        </button>
        <button className="btn-primary" type="submit">
          <Icon name="check" size={18} strokeWidth={2.2} />
          {initial ? 'Guardar cambios' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  )
}

export default AccountForm
