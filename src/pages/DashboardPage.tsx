import AddTransactionButton from '../components/AddTransactionButton'
import BudgetsCard from '../components/BudgetsCard'
import { budgetStatusRank } from '../components/budgetStatus'
import CategoryBreakdown from '../components/CategoryBreakdown'
import MonthSelector from '../components/MonthSelector'
import NetWorthHero from '../components/NetWorthHero'
import RecentTransactions from '../components/RecentTransactions'
import SavingsRate from '../components/SavingsRate'
import SummaryCards from '../components/SummaryCards'
import { useFinance } from '../store/financeContext'
import {
  accountSeries,
  accountsWithBalance,
  categoryBreakdown,
  categoryBudgets,
  incomeExpenses,
  monthLabel,
  monthlyGrowthRate,
  netWorthSeries,
  recentTransactions,
} from '../utils/derive'

export default function DashboardPage() {
  const state = useFinance()
  const month = state.selectedMonth

  const accounts = accountsWithBalance(state, month).map((a) => ({
    ...a,
    monthlyGrowthRate: monthlyGrowthRate(a, state.transactions, month),
    history: accountSeries(a, state.transactions, 7, month),
  }))

  const history = netWorthSeries(state, 7, month)
  const { income, expenses } = incomeExpenses(state.transactions, month)
  const breakdown = categoryBreakdown(state.transactions, state.categories, month)
  const budgets = categoryBudgets(state.transactions, state.categories, month)
  const priorityBudgets = budgets
    .toSorted((a, b) => budgetStatusRank[a.status] - budgetStatusRank[b.status] || b.pct - a.pct)
    .slice(0, 5)
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
        <SavingsRate expenses={expenses} income={income} />
        <RecentTransactions transactions={recent} />
      </div>

      <CategoryBreakdown categories={breakdown} />

      <BudgetsCard budgets={priorityBudgets} totalCount={budgets.length} />
    </>
  )
}
