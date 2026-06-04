import Icon from './Icon'
import Modal from './Modal'

// Diálogo de confirmación reutilizable (borrados, acciones destructivas).
function ConfirmDialog({
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Borrar',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm__message">{message}</p>
      <div className="form__actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm}>
          <Icon name="delete" size={17} strokeWidth={2} />
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
