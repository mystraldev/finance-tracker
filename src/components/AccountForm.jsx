import { useState } from 'react'
import Icon from './Icon'

const TYPES = [
  { value: 'cash', label: 'Efectivo / corriente', icon: 'wallet' },
  { value: 'savings', label: 'Ahorro / remunerada', icon: 'piggy' },
  { value: 'investment', label: 'Inversión', icon: 'trending' },
]

const ACCENTS = [
  { value: 'indigo', color: '#6366f1' },
  { value: 'emerald', color: '#10b981' },
  { value: 'violet', color: '#8b5cf6' },
]

const ACCOUNT_ICONS = ['wallet', 'piggy', 'trending', 'card', 'accounts']

function parseNumber(text) {
  const v = parseFloat(String(text).replace(',', '.'))
  return Number.isFinite(v) ? v : NaN
}

// Formulario para crear / editar una cuenta.
function AccountForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState(initial?.type ?? 'cash')
  const [icon, setIcon] = useState(initial?.icon ?? 'wallet')
  const [accent, setAccent] = useState(initial?.accent ?? 'indigo')
  const [openingBalance, setOpeningBalance] = useState(
    initial ? String(initial.openingBalance) : '',
  )
  const [interestRate, setInterestRate] = useState(
    initial?.interestRate != null ? String(initial.interestRate * 100) : '',
  )
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('Ponle un nombre a la cuenta.')
    const opening = parseNumber(openingBalance || '0')
    if (!Number.isFinite(opening)) return setError('El saldo inicial no es válido.')

    const payload = {
      ...(initial?.id ? { id: initial.id } : {}),
      name: name.trim(),
      type,
      icon,
      accent,
      openingBalance: opening,
    }
    if (type === 'savings') {
      const rate = parseNumber(interestRate || '0')
      payload.interestRate = Number.isFinite(rate) ? rate / 100 : 0
    }
    onSubmit(payload)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="cat-preview">
        <span
          className="icon-tile"
          style={{
            color: ACCENTS.find((a) => a.value === accent)?.color,
            background: `color-mix(in srgb, ${ACCENTS.find((a) => a.value === accent)?.color} 14%, transparent)`,
          }}
        >
          <Icon name={icon} size={22} />
        </span>
        <span className="cat-preview__name">{name.trim() || 'Nueva cuenta'}</span>
      </div>

      <label className="field">
        <span className="field__label">Nombre</span>
        <input
          className="field__input"
          type="text"
          placeholder="Ej. Cuenta nómina"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field__label">Tipo</span>
        <select
          className="field__input"
          value={type}
          onChange={(e) => {
            const next = e.target.value
            setType(next)
            // ajusta el icono por defecto al cambiar de tipo
            setIcon(TYPES.find((t) => t.value === next)?.icon ?? 'wallet')
          }}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field__label">Saldo inicial</span>
          <div className="field__money">
            <input
              className="field__input"
              inputMode="decimal"
              placeholder="0,00"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
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
                placeholder="2,75"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
              <span className="field__suffix">%</span>
            </div>
          </label>
        )}
      </div>

      <div className="field">
        <span className="field__label">Color</span>
        <div className="swatches">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              className={`swatch ${a.value === accent ? 'is-active' : ''}`}
              style={{ background: a.color }}
              onClick={() => setAccent(a.value)}
              aria-label={a.value}
            >
              {a.value === accent && <Icon name="check" size={14} strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label">Icono</span>
        <div className="icon-picker">
          {ACCOUNT_ICONS.map((name) => (
            <button
              key={name}
              type="button"
              className={`icon-pick ${name === icon ? 'is-active' : ''}`}
              style={
                name === icon
                  ? { color: ACCENTS.find((a) => a.value === accent)?.color }
                  : undefined
              }
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
          {initial ? 'Guardar cambios' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  )
}

export default AccountForm
