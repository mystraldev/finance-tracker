import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import CategoryForm from '../../../src/components/CategoryForm'

describe('CategoryForm', () => {
  it('shows validation error when submitting with an empty name', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CategoryForm onCancel={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText(/Ponle un nombre/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with the form data', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CategoryForm onCancel={vi.fn()} onSubmit={onSubmit} />)
    const input = container.querySelector('input[type="text"]')!
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ label: 'Test' }))
    })
  })

  it('submits the income flag when the income checkbox is checked', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CategoryForm onCancel={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.change(container.querySelector('input[type="text"]')!, { target: { value: 'Nómina' } })
    fireEvent.click(container.querySelector('input[type="checkbox"]')!)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ label: 'Nómina', isIncome: true }))
    })
  })

  it('pre-fills fields when editing an existing category', () => {
    render(
      <CategoryForm
        initial={{ id: 'cat-1', label: 'Comida', color: '#ff0000', icon: 'cart', budget: 200 }}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/Nombre/i)).toHaveValue('Comida')
  })

  it('cancels editing', () => {
    const onCancel = vi.fn()
    render(<CategoryForm onCancel={onCancel} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('renders color swatches', () => {
    render(<CategoryForm onCancel={vi.fn()} onSubmit={vi.fn()} />)
    const swatches = screen.getAllByRole('button').filter((b) => b.className.includes('swatch'))
    expect(swatches.length).toBeGreaterThan(0)
  })

  it('shows the category icon selector', () => {
    render(<CategoryForm onCancel={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText(/Icono/i)).toBeInTheDocument()
  })

  it('shows validation error when budget is invalid', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CategoryForm onCancel={vi.fn()} onSubmit={onSubmit} />)
    const input = container.querySelector('input[type="text"]')!
    fireEvent.change(input, { target: { value: 'Test' } })
    const budgetInput = screen.getByPlaceholderText('Sin límite')
    fireEvent.change(budgetInput, { target: { value: 'abc' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('El presupuesto no es válido.')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits with budget as undefined when budget is zero', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CategoryForm onCancel={vi.fn()} onSubmit={onSubmit} />)
    const input = container.querySelector('input[type="text"]')!
    fireEvent.change(input, { target: { value: 'Test' } })
    const budgetInput = screen.getByPlaceholderText('Sin límite')
    fireEvent.change(budgetInput, { target: { value: '0' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ budget: undefined }))
    })
  })

  it('pre-fills budget when editing a category with a budget', () => {
    render(
      <CategoryForm
        initial={{ id: 'cat-1', label: 'Comida', color: '#ff0000', icon: 'cart', budget: 200 }}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('Sin límite')).toHaveValue('200')
  })
})
