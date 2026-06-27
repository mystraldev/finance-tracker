import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ConfirmDialog from '../../../src/components/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders the message and wires confirm / cancel', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        confirmLabel="Borrar"
        message="¿Borrar esto?"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByText('¿Borrar esto?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
