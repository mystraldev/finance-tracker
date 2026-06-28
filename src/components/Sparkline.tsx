type SparklineProperties = {
  data: number[]
  color?: string
  width?: number
  height?: number
  strokeWidth?: number
  fill?: boolean
  id: string
}

function Sparkline({ data, color = 'currentColor', width = 120, height = 36, strokeWidth = 2, fill = false, id }: SparklineProperties) {
  if (!data || data.length < 2) return

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pad = strokeWidth
  const innerW = width - pad * 2
  const innerH = height - pad * 2

  const points = data.map((value, index) => {
    const x = pad + (index / (data.length - 1)) * innerW
    const y = pad + (1 - (value - min) / span) * innerH
    return [x, y] as const
  })

  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  const area = `${line} L ${points.at(-1)![0].toFixed(2)} ${height} L ${points[0][0].toFixed(2)} ${height} Z`
  const gradId = `spark-${id}`

  return (
    <svg aria-hidden className="sparkline" height={height} preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`} width={width}>
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradId})`} stroke="none" />
        </>
      )}
      <path d={line} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
    </svg>
  )
}

export default Sparkline
