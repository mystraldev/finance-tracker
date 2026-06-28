import type { ThemeContextValue } from '../../../src/store/themeContext'
import type { FinanceContextValue, FinanceData } from '../../../src/types/finance'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createFinanceBackup } from '../../../src/data/financeRepo'
import SettingsPage from '../../../src/pages/SettingsPage'
import { FinanceContext } from '../../../src/store/financeContext'
import { ThemeContext } from '../../../src/store/themeContext'

const data: FinanceData = {
  accounts: [
    {
      id: 'cash',
      name: 'Cash',
      type: 'cash',
      icon: 'wallet',
      accent: 'indigo',
      openingBalance: 10,
    },
  ],
  categories: [{ id: 'income', label: 'Income', color: '#22c55e', icon: 'salary' }],
  transactions: [
    {
      id: 'tx-1',
      date: '2026-06-09',
      amount: 10,
      description: 'Income',
      accountId: 'cash',
      categoryId: 'income',
    },
  ],
  savingsGoals: [],
}

function createFinanceValue(overrides: Partial<FinanceContextValue> = {}): FinanceContextValue {
  return {
    ...data,
    selectedMonth: '2026-06',
    getTransactions: vi.fn(() => data.transactions),
    getAvailableMonths: vi.fn(() => ['2026-06']),
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    addCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    addAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
    addSavingsGoal: vi.fn(),
    updateSavingsGoal: vi.fn(),
    deleteSavingsGoal: vi.fn(),
    setMonth: vi.fn(),
    importData: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  }
}

function createThemeValue(overrides: Partial<ThemeContextValue> = {}): ThemeContextValue {
  return {
    mode: 'system',
    theme: 'light',
    systemTheme: 'light',
    setMode: vi.fn(),
    cycleMode: vi.fn(),
    ...overrides,
  }
}

function renderPage({
  finance = createFinanceValue(),
  theme = createThemeValue(),
}: {
  finance?: FinanceContextValue
  theme?: ThemeContextValue
} = {}) {
  render(
    <FinanceContext.Provider value={finance}>
      <ThemeContext.Provider value={theme}>
        <SettingsPage />
      </ThemeContext.Provider>
    </FinanceContext.Provider>,
  )
  return { finance, theme }
}

function createJsonFile(contents: unknown) {
  const file = new File([''], 'backup.json', { type: 'application/json' })
  Object.defineProperty(file, 'text', {
    value: vi.fn().mockResolvedValue(JSON.stringify(contents)),
  })
  return file
}

describe('SettingsPage', () => {
  it('imports a valid backup file after confirmation', async () => {
    const finance = createFinanceValue()
    renderPage({ finance })

    fireEvent.change(screen.getByLabelText('Seleccionar backup JSON'), {
      target: { files: [createJsonFile(createFinanceBackup(data))] },
    })

    expect(await screen.findByText('Importar backup')).toBeInTheDocument()
    expect(finance.importData).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Importar' }))

    expect(screen.getByText('Datos importados correctamente.')).toBeInTheDocument()
    expect(finance.importData).toHaveBeenCalledWith(data)
  })

  it('keeps current data when the import is cancelled', async () => {
    const finance = createFinanceValue()
    renderPage({ finance })

    fireEvent.change(screen.getByLabelText('Seleccionar backup JSON'), {
      target: { files: [createJsonFile(createFinanceBackup(data))] },
    })

    expect(await screen.findByText('Importar backup')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(finance.importData).not.toHaveBeenCalled()
    expect(screen.queryByText('Importar backup')).not.toBeInTheDocument()
  })

  it('rejects invalid backup files', async () => {
    const finance = createFinanceValue()
    renderPage({ finance })

    fireEvent.change(screen.getByLabelText('Seleccionar backup JSON'), {
      target: { files: [createJsonFile({ app: 'finance-tracker', data })] },
    })

    expect(await screen.findByText('El archivo no tiene un backup válido.')).toBeInTheDocument()
    expect(finance.importData).not.toHaveBeenCalled()
  })

  it('updates the theme mode from settings', () => {
    const theme = createThemeValue()
    renderPage({ theme })

    fireEvent.click(screen.getByRole('button', { name: 'Oscuro' }))

    expect(theme.setMode).toHaveBeenCalledWith('dark')
  })

  it('confirms before resetting demo data', () => {
    const finance = createFinanceValue()
    renderPage({ finance })

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar demo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))

    expect(finance.reset).toHaveBeenCalled()
    expect(screen.getByText('Datos restaurados al estado demo.')).toBeInTheDocument()
  })

  it('rejects import when JSON file is invalid', async () => {
    const finance = createFinanceValue()
    renderPage({ finance })

    const file = new File(['{ invalid json }'], 'backup.json', { type: 'application/json' })
    fireEvent.change(screen.getByLabelText('Seleccionar backup JSON'), {
      target: { files: [file] },
    })

    expect(await screen.findByText('No se ha podido leer el archivo JSON.')).toBeInTheDocument()
    expect(finance.importData).not.toHaveBeenCalled()
  })

  it('shows the current theme label based on mode', () => {
    renderPage()
    expect(screen.getByText(/Tema actual:/)).toBeInTheDocument()
  })

  it('shows data summary in the local data card', () => {
    renderPage()
    expect(screen.getByText(/1 cuentas/)).toBeInTheDocument()
    expect(screen.getByText(/1 categorías/)).toBeInTheDocument()
    expect(screen.getByText(/1 movimientos/)).toBeInTheDocument()
    expect(screen.getByText(/0 objetivos/)).toBeInTheDocument()
  })
})
