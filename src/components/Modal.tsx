import type { ReactNode } from 'react'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import Icon from './Icon'

type ModalProperties = {
  title: string
  onClose: () => void
  children: ReactNode
}

function Modal({ title, onClose, children }: ModalProperties) {
  useEffect(() => {
    const onKey = (event_: KeyboardEvent) => {
      if (event_.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function handleOverlayMouseDown(event_: React.MouseEvent<HTMLDivElement>) {
    if (event_.target === event_.currentTarget) onClose()
  }

  return createPortal(
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown} role="presentation">
      <div aria-label={title} aria-modal="true" className="modal" role="dialog">
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button aria-label="Cerrar" className="modal__close" onClick={onClose} type="button">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal
