import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import CategoryForm from '../../../src/components/CategoryForm'

describe('CategoryForm', () => {
  it('shows validation error when submitting with an empty name', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CategoryForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText(/Ponle un nombre/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with the form data', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CategoryForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    const input = container.querySelector('input[type="text"]')!
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ label: 'Test' }))
    })
  })

  it('pre-fills fields when editing an existing category', () => {
    render(
      <CategoryForm
        initial={{ id: 'cat-1', label: 'Comida', color: '#ff0000', icon: 'cart', budget: 200 }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/Nombre/i)).toHaveValue('Comida')
  })

  it('cancels editing', () => {
    const onCancel = vi.fn()
    render(<CategoryForm onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('renders color swatches', () => {
    render(<CategoryForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const swatches = screen.getAllByRole('button').filter((b) => b.className.includes('swatch'))
    expect(swatches.length).toBeGreaterThan(0)
  })

  it('shows the category icon selector', () => {
    render(<CategoryForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText(/Icono/i)).toBeInTheDocument()
  })
})
