import { useFinance } from '../store/financeContext'
import { addMonths, monthLabel } from '../utils/derive'
import Icon from './Icon'

export default function MonthSelector() {
  const { selectedMonth, setMonth } = useFinance()
  return (
    <div className="month-nav">
      <button aria-label="Mes anterior" className="month-nav__btn" onClick={() => setMonth(addMonths(selectedMonth, -1))} type="button">
        <Icon name="chevronLeft" size={18} />
      </button>
      <span className="month-nav__label">{monthLabel(selectedMonth)}</span>
      <button aria-label="Mes siguiente" className="month-nav__btn" onClick={() => setMonth(addMonths(selectedMonth, 1))} type="button">
        <Icon name="chevronRight" size={18} />
      </button>
    </div>
  )
}
