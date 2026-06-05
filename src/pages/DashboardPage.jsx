import { useFinance } from '../store/financeContext'
import SummaryCards from '../components/SummaryCards'
import NetWorthHero from '../components/NetWorthHero'
import SavingsRate from '../components/SavingsRate'
import CategoryBreakdown from '../components/CategoryBreakdown'
import RecentTransactions from '../components/RecentTransactions'
import AddTransactionButton from '../components/AddTransactionButton'
import MonthSelector from '../components/MonthSelector'
import {
  accountsWithBalance,
  monthlyGrowthRate,
  accountSeries,
  netWorthSeries,
  incomeExpenses,
  categoryBreakdown,
  recentTransactions,
  monthLabel,
} from '../utils/derive'

function DashboardPage() {
  const state = useFinance()
  const month = state.selectedMonth

  // Cuentas con saldo, variación y serie para el sparkline (todo derivado).
  const accounts = accountsWithBalance(state, month).map((a) => ({
    ...a,
    monthlyGrowthRate: monthlyGrowthRate(a, state.transactions, month),
    history: accountSeries(a, state.transactions, 7, month),
  }))

  const history = netWorthSeries(state, 7, month)
  const { income, expenses } = incomeExpenses(state.transactions, month)
  const breakdown = categoryBreakdown(state.transactions, state.categories, month)
  const recent = recentTransactions(state, 6)

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__greeting">Hola, Ferran</p>
          <h1 className="page-header__title">Tu resumen financiero</h1>
        </div>
        <div className="page-header__actions">
          <MonthSelector />
          <AddTransactionButton />
        </div>
      </header>

      <NetWorthHero accounts={accounts} history={history} month={monthLabel(month)} />

      <SummaryCards accounts={accounts} />

      <div className="grid-two">
        <SavingsRate income={income} expenses={expenses} />
        <RecentTransactions transactions={recent} />
      </div>

      <CategoryBreakdown categories={breakdown} />
    </>
  )
}

export default DashboardPage
