import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SummaryCards from '../../../src/components/SummaryCards'

const accounts = [
  {
    id: 'checking',
    name: 'Cuenta corriente',
    type: 'cash' as const,
    icon: 'wallet',
    accent: 'indigo',
    openingBalance: 1500,
    balance: 2000,
    monthlyGrowthRate: 0.05,
    history: [1500, 1600, 1800, 2000],
  },
  {
    id: 'savings',
    name: 'Cuenta remunerada',
    type: 'savings' as const,
    icon: 'piggy',
    accent: 'emerald',
    openingBalance: 12500,
    interestRate: 0.0275,
    balance: 13000,
    monthlyGrowthRate: -0.01,
    history: [12500, 12800, 13000],
  },
]

describe('SummaryCards', () => {
  it('renders all account cards', () => {
    render(<SummaryCards accounts={accounts} />)
    expect(screen.getByText('Cuenta corriente')).toBeInTheDocument()
    expect(screen.getByText('Cuenta remunerada')).toBeInTheDocument()
  })

  it('formats balances as currency', () => {
    const { container } = render(<SummaryCards accounts={accounts} />)
    const balances = container.querySelectorAll('.summary-card__balance')
    expect(balances[0]).toHaveTextContent(/2/)
    expect(balances[1]).toHaveTextContent(/13/)
  })

  it('shows positive and negative growth rates', () => {
    render(<SummaryCards accounts={accounts} />)
    expect(screen.getByText(/5,/)).toBeInTheDocument()
    expect(screen.getByText(/1,/)).toBeInTheDocument()
  })

  it('shows TAE for savings accounts with interest rate', () => {
    render(<SummaryCards accounts={accounts} />)
    expect(screen.getByText(/TAE/)).toBeInTheDocument()
  })
})
