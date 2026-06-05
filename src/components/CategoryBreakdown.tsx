import Icon from './Icon'
import { formatCurrency, formatPercent } from '../utils/format'
import { fractionOf } from '../utils/math'
import type { CategoryBreakdownItem } from '../types/finance'

const RADIUS = 70
const STROKE = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 2

type CategoryBreakdownProps = {
  categories: CategoryBreakdownItem[]
}

function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const total = categories.reduce((sum, c) => sum + c.amount, 0)

  const { arcs } = categories.reduce<{
    arcs: (CategoryBreakdownItem & { fraction: number; dash: number; gap: number; rotation: number })[]
    offset: number
  }>(
    (acc, c) => {
      const fraction = fractionOf(c.amount, total)
      const len = Math.max(fraction * CIRCUMFERENCE - GAP, 0)
      acc.arcs.push({
        ...c,
        fraction,
        dash: len,
        gap: CIRCUMFERENCE - len,
        rotation: fractionOf(acc.offset, total) * 360,
      })
      return { arcs: acc.arcs, offset: acc.offset + c.amount }
    },
    { arcs: [], offset: 0 },
  )

  return (
    <section className="card breakdown">
      <header className="card__header">
        <h3 className="card__title">Gastos por categoría</h3>
        <span className="card__subtitle tnum">{formatCurrency(total)} este mes</span>
      </header>

      <div className="breakdown__body">
        <div className="donut">
          <svg viewBox="0 0 180 180">
            <circle
              className="donut__bg"
              cx="90"
              cy="90"
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
            />
            <g transform="rotate(-90 90 90)">
              {arcs.map((arc) => (
                <circle
                  key={arc.id}
                  cx="90"
                  cy="90"
                  r={RADIUS}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={`${arc.dash} ${arc.gap}`}
                  strokeDashoffset={-((arc.rotation / 360) * CIRCUMFERENCE)}
                />
              ))}
            </g>
          </svg>
          <div className="donut__center">
            <span className="donut__total tnum">{formatCurrency(total)}</span>
            <span className="donut__label">gastado</span>
          </div>
        </div>

        <ul className="breakdown__list">
          {arcs.map((arc) => (
            <li key={arc.id} className="breakdown__item">
              <span className="breakdown__icon" style={{ '--c': arc.color } as Record<string, string>}>
                <Icon name={arc.icon} size={17} />
              </span>
              <span className="breakdown__label">{arc.label}</span>
              <span className="breakdown__bar">
                <span
                  className="breakdown__bar-fill"
                  style={{ width: `${arc.fraction * 100}%`, background: arc.color }}
                />
              </span>
              <span className="breakdown__amount tnum">{formatCurrency(arc.amount)}</span>
              <span className="breakdown__pct tnum">{formatPercent(arc.fraction)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default CategoryBreakdown
