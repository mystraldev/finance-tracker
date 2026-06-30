import type { FinanceData } from '../../../src/types/finance'

import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFinance } from '../../../src/store/financeContext'
import { FinanceProvider } from '../../../src/store/FinanceProvider'

const mocks = vi.hoisted(() => ({
  fetchFinanceData: vi.fn(),
  upsertAccount: vi.fn(),
  upsertCategory: vi.fn(),
  upsertTransaction: vi.fn(),
  upsertSavingsGoal: vi.fn(),
  deleteAccount: vi.fn(),
  deleteCategory: vi.fn(),
  deleteTransaction: vi.fn(),
  deleteSavingsGoal: vi.fn(),
  clearAllData: vi.fn(),
  replaceAllData: vi.fn(),
}))

vi.mock('../../../src/store/authContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'dev@example.com' },
    session: { user: { id: 'user-1' } },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock('../../../src/data/supabaseFinanceRepo', () => ({
  newId: () => 'generated-id',
  fetchFinanceData: mocks.fetchFinanceData,
  upsertAccount: mocks.upsertAccount,
  upsertCategory: mocks.upsertCategory,
  upsertTransaction: mocks.upsertTransaction,
  upsertSavingsGoal: mocks.upsertSavingsGoal,
  deleteAccount: mocks.deleteAccount,
  deleteCategory: mocks.deleteCategory,
  deleteTransaction: mocks.deleteTransaction,
  deleteSavingsGoal: mocks.deleteSavingsGoal,
  clearAllData: mocks.clearAllData,
  replaceAllData: mocks.replaceAllData,
  remapFinanceData: (data: FinanceData) => data,
}))

const seed: FinanceData = {
  accounts: [
    { id: 'acc-1', name: 'Cash', type: 'cash', icon: 'wallet', accent: 'indigo', openingBalance: 100 },
  ],
  categories: [
    { id: 'cat-income', label: 'Income', color: '#22c55e', icon: 'salary' },
    { id: 'cat-food', label: 'Food', color: '#10b981', icon: 'cart' },
  ],
  transactions: [
    { id: 'tx-1', date: '2026-06-10', amount: 200, description: 'Salary', accountId: 'acc-1', categoryId: 'cat-income' },
  ],
  savingsGoals: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.fetchFinanceData.mockResolvedValue(structuredClone(seed))
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function setupReady() {
  const view = renderHook(() => useFinance(), { wrapper: FinanceProvider })
  await waitFor(() => expect(view.result.current?.accounts.length).toBeGreaterThan(0))
  return view
}

describe('FinanceProvider store', () => {
  it('loads finance data from Supabase on mount', async () => {
    const { result } = await setupReady()
    expect(result.current.accounts).toHaveLength(1)
    expect(result.current.categories).toHaveLength(2)
    expect(result.current.transactions).toHaveLength(1)
    expect(result.current.selectedMonth).toMatch(/^\d{4}-\d{2}$/)
    expect(mocks.fetchFinanceData).toHaveBeenCalled()
  })

  it('exposes repository-backed queries', async () => {
    const { result } = await setupReady()
    expect(
      result.current.getTransactions({ month: '2026-06', type: 'income' }),
    ).toHaveLength(1)
    expect(result.current.getAvailableMonths()).toContain('2026-06')
  })

  it('adds a transaction optimistically and persists it', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.addTransaction({
        date: '2026-06-15',
        amount: -10,
        description: 'Test',
        accountId: 'acc-1',
        categoryId: 'cat-food',
      })
    })
    expect(result.current.transactions).toHaveLength(2)
    await waitFor(() =>
      expect(mocks.upsertTransaction).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ id: 'generated-id', amount: -10 }),
      ),
    )
  })

  it('updates a transaction and persists the merged entity', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.updateTransaction({ id: 'tx-1', amount: 999 })
    })
    expect(result.current.transactions[0].amount).toBe(999)
    await waitFor(() =>
      expect(mocks.upsertTransaction).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ id: 'tx-1', amount: 999, description: 'Salary' }),
      ),
    )
  })

  it('deletes a transaction and persists the deletion', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.deleteTransaction('tx-1')
    })
    expect(result.current.transactions).toHaveLength(0)
    await waitFor(() => expect(mocks.deleteTransaction).toHaveBeenCalledWith('tx-1'))
  })

  it('adds and deletes an unused category', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.addCategory({ label: 'Unused', color: '#6366f1', icon: 'home' })
    })
    await waitFor(() => expect(mocks.upsertCategory).toHaveBeenCalled())

    act(() => {
      result.current.deleteCategory('generated-id')
    })
    expect(result.current.categories.some((c) => c.id === 'generated-id')).toBe(false)
    await waitFor(() => expect(mocks.deleteCategory).toHaveBeenCalledWith('generated-id'))
  })

  it('keeps a category referenced by a transaction and does not persist deletion', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.deleteCategory('cat-income')
    })
    expect(result.current.categories.some((c) => c.id === 'cat-income')).toBe(true)
    expect(mocks.deleteCategory).not.toHaveBeenCalled()
  })

  it('keeps an account referenced by a transaction and does not persist deletion', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.deleteAccount('acc-1')
    })
    expect(result.current.accounts.some((a) => a.id === 'acc-1')).toBe(true)
    expect(mocks.deleteAccount).not.toHaveBeenCalled()
  })

  it('adds, updates and deletes a savings goal', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.addSavingsGoal({
        name: 'Emergency',
        targetAmount: 1000,
        savedAmount: 100,
        icon: 'piggy',
        color: '#10b981',
      })
    })
    await waitFor(() => expect(mocks.upsertSavingsGoal).toHaveBeenCalled())

    act(() => {
      result.current.updateSavingsGoal({ id: 'generated-id', savedAmount: 250 })
    })
    expect(result.current.savingsGoals.at(-1)?.savedAmount).toBe(250)

    act(() => {
      result.current.deleteSavingsGoal('generated-id')
    })
    expect(result.current.savingsGoals).toHaveLength(0)
    await waitFor(() => expect(mocks.deleteSavingsGoal).toHaveBeenCalledWith('generated-id'))
  })

  it('updates an account and a category and persists the merged entities', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.updateAccount({ id: 'acc-1', name: 'Renamed' })
    })
    expect(result.current.accounts[0].name).toBe('Renamed')
    await waitFor(() =>
      expect(mocks.upsertAccount).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ id: 'acc-1', name: 'Renamed', openingBalance: 100 }),
      ),
    )

    act(() => {
      result.current.updateCategory({ id: 'cat-food', label: 'Groceries' })
    })
    expect(result.current.categories.find((c) => c.id === 'cat-food')?.label).toBe('Groceries')
    await waitFor(() =>
      expect(mocks.upsertCategory).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ id: 'cat-food', label: 'Groceries' }),
      ),
    )
  })

  it('adds and deletes an unused account', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.addAccount({ name: 'Savings', type: 'savings', icon: 'piggy', accent: 'emerald', openingBalance: 0 })
    })
    await waitFor(() => expect(mocks.upsertAccount).toHaveBeenCalled())

    act(() => {
      result.current.deleteAccount('generated-id')
    })
    expect(result.current.accounts.some((a) => a.id === 'generated-id')).toBe(false)
    await waitFor(() => expect(mocks.deleteAccount).toHaveBeenCalledWith('generated-id'))
  })

  it('keeps an account referenced only by a savings goal', async () => {
    const { result } = await setupReady()
    // New account ('generated-id') with no transactions, referenced by a goal.
    act(() => {
      result.current.addAccount({ name: 'Goal', type: 'cash', icon: 'wallet', accent: 'indigo', openingBalance: 0 })
    })
    act(() => {
      result.current.addSavingsGoal({
        name: 'Trip',
        targetAmount: 500,
        savedAmount: 0,
        icon: 'plane',
        color: '#3b82f6',
        accountId: 'generated-id',
      })
    })
    act(() => {
      result.current.deleteAccount('generated-id')
    })
    expect(result.current.accounts.some((a) => a.id === 'generated-id')).toBe(true)
    expect(mocks.deleteAccount).not.toHaveBeenCalled()
  })

  it('sets the selected month', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.setMonth('2025-01')
    })
    expect(result.current.selectedMonth).toBe('2025-01')
  })

  it('clears all data on reset', async () => {
    const { result } = await setupReady()
    act(() => {
      result.current.reset()
    })
    expect(result.current.transactions).toHaveLength(0)
    expect(result.current.accounts).toHaveLength(0)
    await waitFor(() => expect(mocks.clearAllData).toHaveBeenCalled())
  })

  it('imports data and replaces it in the database', async () => {
    const { result } = await setupReady()
    const imported: FinanceData = {
      accounts: [{ id: 'a', name: 'X', type: 'cash', icon: 'wallet', accent: 'indigo', openingBalance: 5 }],
      categories: [{ id: 'c', label: 'Y', color: '#000', icon: 'home' }],
      transactions: [],
      savingsGoals: [],
    }
    act(() => {
      result.current.importData(imported)
    })
    expect(result.current.accounts).toEqual(imported.accounts)
    await waitFor(() => expect(mocks.replaceAllData).toHaveBeenCalledWith('user-1', imported))
  })

  it('shows an error state when the initial load fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {
      // swallow the expected error log
    })
    mocks.fetchFinanceData.mockRejectedValue(new Error('boom'))

    render(
      <FinanceProvider>
        <span>protected child</span>
      </FinanceProvider>,
    )

    expect(await screen.findByText('No se pudieron cargar tus datos.')).toBeInTheDocument()
    expect(screen.queryByText('protected child')).not.toBeInTheDocument()
  })
})
