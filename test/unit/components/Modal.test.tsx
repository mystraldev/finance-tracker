import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Modal from '../../../src/components/Modal'

describe('Modal', () => {
  it('renders the title and children in a dialog', () => {
    render(
      <Modal onClose={() => {}} title="Mi título">
        <p>Contenido</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Mi título')).toBeInTheDocument()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('calls onClose when clicking the close button', () => {
    const onClose = vi.fn()
    render(
      <Modal onClose={onClose} title="X">
        <span />
      </Modal>,
    )
    fireEvent.click(screen.getByLabelText('Cerrar'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when pressing Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal onClose={onClose} title="X">
        <span />
      </Modal>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on overlay click but not on panel click', () => {
    const onClose = vi.fn()
    render(
      <Modal onClose={onClose} title="X">
        <span>panel</span>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    fireEvent.mouseDown(dialog) // panel stops propagation
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.mouseDown(dialog.parentElement as HTMLElement) // overlay
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
