type SparklineProps = {
  values: number[]
  up: boolean
}

export function Sparkline({ values, up }: SparklineProps) {
  if (values.length < 2) {
    return <div className="h-10 w-24" />
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const width = 96
  const height = 40
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / span) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-10 w-24"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={up ? '#0f7b4c' : '#c23b3b'}
        strokeWidth="2"
        points={points}
      />
    </svg>
  )
}
