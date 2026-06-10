import { useState, type FormEvent } from 'react'
import Icon from './Icon'
import { parseDecimalAmount } from '../utils/validation'
import type { Account, Transfer } from '../types/finance'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

type TransferFormProps = {
  accounts: Account[]
  initial?: Transfer
  onSubmit: (transfer: Omit<Transfer, 'id'> | Partial<Transfer> & { id: string }) => void
  onCancel: () => void
}

function TransferForm({ accounts, initial, onSubmit, onCancel }: TransferFormProps) {
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [fromAccountId, setFromAccountId] = useState(initial?.fromAccountId ?? accounts[0]?.id ?? '')
  const [toAccountId, setToAccountId] = useState(
    initial?.toAccountId ?? accounts.find((account) => account.id !== fromAccountId)?.id ?? '',
  )
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = parseDecimalAmount(amount)
    if (value == null || value <= 0) {
      return setError('Introduce un importe válido mayor que 0.')
    }
    if (!description.trim()) {
      return setError('Añade una descripción.')
    }
    if (!fromAccountId || !toAccountId) {
      return setError('Selecciona las dos cuentas.')
    }
    if (fromAccountId === toAccountId) {
      return setError('El origen y el destino deben ser cuentas distintas.')
    }

    onSubmit({
      ...(initial?.id ? { id: initial.id } : {}),
      fromAccountId,
      toAccountId,
      description: description.trim(),
      date,
      amount: value,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Importe</span>
        <div className="field__money">
          <input
            className="field__input"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
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
          placeholder="Ej. Aportación a ahorro"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field__label">Desde</span>
          <select
            className="field__input"
            value={fromAccountId}
            onChange={(event) => setFromAccountId(event.target.value)}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Hacia</span>
          <select
            className="field__input"
            value={toAccountId}
            onChange={(event) => setToAccountId(event.target.value)}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field__label">Fecha</span>
        <input
          className="field__input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          <Icon name="check" size={18} strokeWidth={2.2} />
          {initial ? 'Guardar cambios' : 'Añadir traspaso'}
        </button>
      </div>
    </form>
  )
}

export default TransferForm
