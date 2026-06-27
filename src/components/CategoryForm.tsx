import type { Category } from '../types/finance'
import type {FormEvent} from 'react';

import {  useState } from 'react'

import Icon from './Icon'
import { selectableIcons } from './iconCatalog'

const PALETTE = [
  '#0a6ce0', '#8d66d9', '#a855f7', '#ec4899', '#f43f5e', '#ef4444',
  '#f59e0b', '#eab308', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
  '#64748b', '#94a3b8',
]

type CategoryFormProperties = {
  initial?: Category
  onSubmit: (cat: Omit<Category, 'id'> | Partial<Category> & { id: string }) => void
  onCancel: () => void
}

function parseBudget(text: string): number | undefined {
  const trimmed = text.trim()
  if (!trimmed) return undefined
  const value = Number(trimmed.replace(',', '.'))
  if (!Number.isFinite(value) || value < 0) return undefined
  return value === 0 ? undefined : value
}

function isInvalidBudgetInput(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  const value = Number(trimmed.replace(',', '.'))
  return !Number.isFinite(value) || value < 0
}

function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProperties) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [color, setColor] = useState(initial?.color ?? PALETTE[0])
  const [icon, setIcon] = useState(initial?.icon ?? 'package')
  const [budget, setBudget] = useState(initial?.budget === undefined ? '' : String(initial.budget))
  const [error, setError] = useState('')

  function handleSubmit(event_: FormEvent) {
    event_.preventDefault()
    if (!label.trim()) return setError('Ponle un nombre a la categoría.')
    if (isInvalidBudgetInput(budget)) return setError('El presupuesto no es válido.')
    const parsedBudget = parseBudget(budget)
    onSubmit({
      ...(initial?.id && { id: initial.id }),
      label: label.trim(),
      color,
      icon,
      budget: parsedBudget,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="cat-preview">
        <span className="icon-tile" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
          <Icon name={icon} size={22} />
        </span>
        <span className="cat-preview__name">{label.trim() || 'Nueva categoría'}</span>
      </div>

      <label className="field">
        <span className="field__label">Nombre</span>
        <input
          className="field__input"
          onChange={(event_) => setLabel(event_.target.value)}
          placeholder="Ej. Suscripciones"
          type="text"
          value={label}
        />
      </label>

      <label className="field">
        <span className="field__label">Presupuesto mensual (opcional)</span>
        <div className="field__money">
          <input
            className="field__input"
            inputMode="decimal"
            onChange={(event_) => setBudget(event_.target.value)}
            placeholder="Sin límite"
            value={budget}
          />
          <span className="field__suffix">€</span>
        </div>
      </label>

      <div className="field">
        <span className="field__label">Color</span>
        <div className="swatches">
          {PALETTE.map((c) => (
            <button
              aria-label={`Color ${c}`}
              className={`swatch ${c === color ? 'is-active' : ''}`}
              key={c}
              onClick={() => setColor(c)}
              style={{ background: c }}
              type="button"
            >
              {c === color && <Icon name="check" size={14} strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

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

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button className="btn-ghost" onClick={onCancel} type="button">
          Cancelar
        </button>
        <button className="btn-primary" type="submit">
          <Icon name="check" size={18} strokeWidth={2.2} />
          {initial ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}

export default CategoryForm
