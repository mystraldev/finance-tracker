import { useState } from 'react'
import Icon from './Icon'
import Modal from './Modal'
import TransactionForm from './TransactionForm'
import { useFinance } from '../store/financeContext'

// Botón global "Añadir movimiento" + su modal. Reutilizable en cualquier página.
function AddTransactionButton({ label = 'Añadir movimiento' }) {
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
              addTransaction(tx)
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
