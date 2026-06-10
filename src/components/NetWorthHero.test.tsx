import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NetWorthHero from './NetWorthHero'
import type { AccountWithBalance } from '../types/finance'

type HeroAccount = AccountWithBalance & { monthlyGrowthRate: number; history: number[] }

function account(id: string, balance: number, accent = 'indigo'): HeroAccount {
  return {
    id,
    name: id,
    type: 'cash',
    icon: 'wallet',
    accent,
    openingBalance: 0,
    balance,
    monthlyGrowthRate: 0,
    history: [balance],
  }
}

describe('NetWorthHero', () => {
  it('clamps negative balances out of the composition bar', () => {
    const accounts = [account('positive', 3000), account('overdrawn', -1000, 'emerald')]
    const { container } = render(
      <NetWorthHero
        accounts={accounts}
        history={[
          { label: 'may', value: 1500 },
          { label: 'jun', value: 2000 },
        ]}
        month="Junio de 2026"
      />,
    )

    const widths = [...container.querySelectorAll<HTMLElement>('.hero__segment')].map(
      (el) => parseFloat(el.style.width),
    )
    expect(widths).toEqual([100, 0])
  })

  it('reports the direction of change when the previous net worth is negative', () => {
    const { container } = render(
      <NetWorthHero
        accounts={[account('recovering', 500)]}
        history={[
          { label: 'may', value: -1000 },
          { label: 'jun', value: 500 },
        ]}
        month="Junio de 2026"
      />,
    )

    expect(container.querySelector('.hero__delta')?.className).toContain('is-up')
  })
})
