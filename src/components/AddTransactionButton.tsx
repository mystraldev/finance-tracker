import type { Transaction } from '../types/finance'

import { useState } from 'react'

import { useFinance } from '../store/financeContext'
import Icon from './Icon'
import Modal from './Modal'
import TransactionForm from './TransactionForm'

type AddTransactionButtonProperties = {
  label?: string
}

function AddTransactionButton({ label = 'Añadir movimiento' }: AddTransactionButtonProperties) {
  const { accounts, categories, addTransaction } = useFinance()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="btn-primary" onClick={() => setOpen(true)} type="button">
        <Icon name="plus" size={18} strokeWidth={2.2} />
        {label}
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} title="Nuevo movimiento">
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onCancel={() => setOpen(false)}
            onSubmit={(tx) => {
              addTransaction(tx as Omit<Transaction, 'id'>)
              setOpen(false)
            }}
          />
        </Modal>
      )}
    </>
  )
}

export default AddTransactionButton
