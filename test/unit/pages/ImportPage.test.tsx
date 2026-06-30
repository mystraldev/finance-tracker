import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ImportPage from '../../../src/pages/ImportPage'

const mocks = vi.hoisted(() => ({ extract: vi.fn(), bulkInsert: vi.fn() }))

vi.mock('../../../src/lib/pdfText', () => ({ extractPdfLines: mocks.extract }))
vi.mock('../../../src/store/authContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }))
vi.mock('../../../src/store/financeContext', () => ({
  useFinance: () => ({ accounts: [], categories: [], transactions: [] }),
}))
vi.mock('../../../src/data/supabaseFinanceRepo', () => ({
  bulkInsert: mocks.bulkInsert,
  upsertAccount: vi.fn(),
}))

const lines = [
  'Cuenta personal (EUR)',
  '1 ene 2026 Mercadona Comercio -30,00€ 70,00€ 0,00€ 0,00€ 0,00€',
  '2 ene 2026 Nómina Recargar 1.000,00€ 1.070,00€ 0,00€ 0,00€ 0,00€',
]

beforeEach(() => {
  vi.clearAllMocks()
  mocks.extract.mockResolvedValue(lines)
  mocks.bulkInsert.mockResolvedValue(undefined)
})

function selectFile() {
  const file = new File(['%PDF'], 'statement.pdf', { type: 'application/pdf' })
  const input = document.querySelector('input[type="file"]')
  if (input) fireEvent.change(input, { target: { files: [file] } })
}

describe('ImportPage', () => {
  it('shows the dropzone initially', () => {
    render(<ImportPage />)
    expect(screen.getByText('Sube tu extracto PDF')).toBeInTheDocument()
  })

  it('parses the PDF and previews the planned import', async () => {
    render(<ImportPage />)
    selectFile()
    expect(await screen.findByRole('button', { name: /Importar 2 movimientos/ })).toBeInTheDocument()
    expect(screen.getByText('Mercadona')).toBeInTheDocument()
  })

  it('imports the transactions on confirm', async () => {
    render(<ImportPage />)
    selectFile()
    fireEvent.click(await screen.findByRole('button', { name: /Importar 2 movimientos/ }))
    await waitFor(() => expect(mocks.bulkInsert).toHaveBeenCalled())
    expect(await screen.findByText(/importados correctamente/)).toBeInTheDocument()
  })

  it('reports when no EUR accounts are found', async () => {
    mocks.extract.mockResolvedValue(['random text', 'no accounts here'])
    render(<ImportPage />)
    selectFile()
    expect(await screen.findByText(/No se han encontrado cuentas/)).toBeInTheDocument()
  })
})
