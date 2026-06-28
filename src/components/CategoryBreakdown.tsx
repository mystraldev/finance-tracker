import type { CategoryBreakdownItem } from '../types/finance'

import { formatCurrency, formatPercent } from '../utils/format'
import { fractionOf } from '../utils/math'
import Icon from './Icon'

const RADIUS = 70
const STROKE = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 2

type CategoryBreakdownProperties = {
  categories: CategoryBreakdownItem[]
}

function CategoryBreakdown({ categories }: CategoryBreakdownProperties) {
  const total = categories.reduce((sum, c) => sum + c.amount, 0)

  const arcs: (CategoryBreakdownItem & {
    fraction: number
    dash: number
    gap: number
    rotation: number
  })[] = []
  let offset = 0
  for (const c of categories) {
    const fraction = fractionOf(c.amount, total)
    const length_ = Math.max(fraction * CIRCUMFERENCE - GAP, 0)
    arcs.push({
      ...c,
      fraction,
      dash: length_,
      gap: CIRCUMFERENCE - length_,
      rotation: fractionOf(offset, total) * 360,
    })
    offset += c.amount
  }

  return (
    <section className="card breakdown">
      <header className="card__header">
        <h3 className="card__title">Gastos por categoría</h3>
        <span className="card__subtitle tnum">{formatCurrency(total)} este mes</span>
      </header>

      <div className="breakdown__body">
        <div className="donut">
          <svg viewBox="0 0 180 180">
            <circle className="donut__bg" cx="90" cy="90" fill="none" r={RADIUS} strokeWidth={STROKE} />
            <g transform="rotate(-90 90 90)">
              {arcs.map((arc) => (
                <circle
                  cx="90"
                  cy="90"
                  fill="none"
                  key={arc.id}
                  r={RADIUS}
                  stroke={arc.color}
                  strokeDasharray={`${arc.dash} ${arc.gap}`}
                  strokeDashoffset={-((arc.rotation / 360) * CIRCUMFERENCE)}
                  strokeLinecap="round"
                  strokeWidth={STROKE}
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
            <li className="breakdown__item" key={arc.id}>
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
