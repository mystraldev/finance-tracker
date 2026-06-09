import { useState } from 'react'
import Icon from './Icon'
import Modal from './Modal'
import TransactionForm from './TransactionForm'
import TransferForm from './TransferForm'
import { useFinance } from '../store/financeContext'
import type { Transaction, Transfer } from '../types/finance'

type AddTransactionButtonProps = {
  label?: string
}

function AddTransactionButton({ label = 'Añadir movimiento' }: AddTransactionButtonProps) {
  const { accounts, categories, addTransaction, addTransfer } = useFinance()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'gasto' | 'ingreso' | 'traspaso'>('gasto')

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
        <Icon name="plus" size={18} strokeWidth={2.2} />
        {label}
      </button>

      {open && (
        <Modal title="Nuevo movimiento" onClose={() => setOpen(false)}>
          <div className="segmented segmented--activity">
            <button
              type="button"
              className={`segmented__btn ${mode === 'gasto' ? 'is-active is-expense' : ''}`}
              onClick={() => setMode('gasto')}
              aria-pressed={mode === 'gasto'}
            >
              <Icon name="down" size={16} strokeWidth={2.2} /> Gasto
            </button>
            <button
              type="button"
              className={`segmented__btn ${mode === 'ingreso' ? 'is-active is-income' : ''}`}
              onClick={() => setMode('ingreso')}
              aria-pressed={mode === 'ingreso'}
            >
              <Icon name="up" size={16} strokeWidth={2.2} /> Ingreso
            </button>
            <button
              type="button"
              className={`segmented__btn ${mode === 'traspaso' ? 'is-active is-transfer' : ''}`}
              onClick={() => setMode('traspaso')}
              aria-pressed={mode === 'traspaso'}
            >
              <Icon name="transfer" size={16} strokeWidth={2.2} /> Traspaso
            </button>
          </div>

          {mode === 'traspaso' ? (
            <TransferForm
              accounts={accounts}
              onSubmit={(transfer) => {
                addTransfer(transfer as Omit<Transfer, 'id'>)
                setOpen(false)
              }}
              onCancel={() => setOpen(false)}
            />
          ) : (
            <TransactionForm
              accounts={accounts}
              categories={categories}
              initialType={mode}
              onSubmit={(tx) => {
                addTransaction(tx as Omit<Transaction, 'id'>)
                setOpen(false)
              }}
              onCancel={() => setOpen(false)}
            />
          )}
        </Modal>
      )}
    </>
  )
}

export default AddTransactionButton
