import Icon from './Icon'
import { useFinance } from '../store/financeContext'
import { addMonths, monthLabel } from '../utils/derive'

function MonthSelector() {
  const { selectedMonth, setMonth } = useFinance()
  return (
    <div className="month-nav">
      <button
        type="button"
        className="month-nav__btn"
        aria-label="Mes anterior"
        onClick={() => setMonth(addMonths(selectedMonth, -1))}
      >
        <Icon name="chevronLeft" size={18} />
      </button>
      <span className="month-nav__label">{monthLabel(selectedMonth)}</span>
      <button
        type="button"
        className="month-nav__btn"
        aria-label="Mes siguiente"
        onClick={() => setMonth(addMonths(selectedMonth, 1))}
      >
        <Icon name="chevronRight" size={18} />
      </button>
    </div>
  )
}

export default MonthSelector
