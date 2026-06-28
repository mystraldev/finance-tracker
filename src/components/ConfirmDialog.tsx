import Icon from './Icon'
import Modal from './Modal'

type ConfirmDialogProperties = {
  title?: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ title = '¿Estás seguro?', message, confirmLabel = 'Borrar', onConfirm, onCancel }: ConfirmDialogProperties) {
  return (
    <Modal onClose={onCancel} title={title}>
      <p className="confirm__message">{message}</p>
      <div className="form__actions">
        <button className="btn-ghost" onClick={onCancel} type="button">
          Cancelar
        </button>
        <button className="btn-danger" onClick={onConfirm} type="button">
          <Icon name="delete" size={17} strokeWidth={2} />
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
