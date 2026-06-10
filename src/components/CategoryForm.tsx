import { useState, type FormEvent } from 'react'
import Icon from './Icon'
import { selectableIcons } from './iconCatalog'
import type { Category } from '../types/finance'

const PALETTE = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#ef4444',
  '#f59e0b', '#eab308', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
  '#64748b', '#94a3b8',
]

type CategoryFormProps = {
  initial?: Category
  onSubmit: (cat: Omit<Category, 'id'> | Partial<Category> & { id: string }) => void
  onCancel: () => void
}

/** '' or 0 -> undefined (no budget); invalid -> null; otherwise the parsed number. */
function parseBudget(text: string): number | undefined | null {
  const trimmed = text.trim()
  if (!trimmed) return undefined
  const value = parseFloat(trimmed.replace(',', '.'))
  if (!Number.isFinite(value) || value < 0) return null
  return value === 0 ? undefined : value
}

function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [color, setColor] = useState(initial?.color ?? PALETTE[0])
  const [icon, setIcon] = useState(initial?.icon ?? 'package')
  const [budget, setBudget] = useState(initial?.budget != null ? String(initial.budget) : '')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!label.trim()) return setError('Ponle un nombre a la categoría.')
    const parsedBudget = parseBudget(budget)
    if (parsedBudget === null) return setError('El presupuesto no es válido.')
    onSubmit({
      ...(initial?.id ? { id: initial.id } : {}),
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
          type="text"
          placeholder="Ej. Suscripciones"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field__label">Presupuesto mensual (opcional)</span>
        <div className="field__money">
          <input
            className="field__input"
            inputMode="decimal"
            placeholder="Sin límite"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <span className="field__suffix">€</span>
        </div>
      </label>

      <div className="field">
        <span className="field__label">Color</span>
        <div className="swatches">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch ${c === color ? 'is-active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
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
          {initial ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}

export default CategoryForm
