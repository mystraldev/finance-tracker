import { useState } from 'react'
import Icon from './Icon'
import Modal from './Modal'
import TransactionForm from './TransactionForm'
import { useFinance } from '../store/financeContext'
import type { Transaction } from '../types/finance'

type AddTransactionButtonProps = {
  label?: string
}

function AddTransactionButton({ label = 'Añadir movimiento' }: AddTransactionButtonProps) {
  const { accounts, categories, addTransaction } = useFinance()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
        <Icon name="plus" size={18} strokeWidth={2.2} />
        {label}
      </button>

      {open && (
        <Modal title="Nuevo movimiento" onClose={() => setOpen(false)}>
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSubmit={(tx) => {
              addTransaction(tx as Omit<Transaction, 'id'>)
              setOpen(false)
            }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      )}
    </>
  )
}

export default AddTransactionButton
