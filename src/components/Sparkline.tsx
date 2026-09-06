type SparklineProps = {
  values: number[]
  up: boolean
}

export function Sparkline({ values, up }: SparklineProps) {
  if (values.length < 2) {
    return <div className="h-11 w-28" />
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const width = 112
  const height = 44
  const color = up ? '#059669' : '#e11d48'

  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width
    const y = height - ((value - min) / span) * (height - 8) - 4
    return { x, y }
  })

  const line = coords.map((point) => `${point.x},${point.y}`).join(' ')
  const area = [
    `0,${height}`,
    ...coords.map((point) => `${point.x},${point.y}`),
    `${width},${height}`,
  ].join(' ')

  const gradientId = up ? 'sparkUp' : 'sparkDown'

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-11 w-28"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradientId})`} points={area} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={line}
      />
    </svg>
  )
}
