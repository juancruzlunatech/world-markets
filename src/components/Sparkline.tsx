// This component draws a tiny trend line for a market.
// It takes the recent values from the API and converts them into a simple SVG polyline.
// This makes the dashboard feel more alive and helps users quickly identify if the
// index is trending up or down.

type SparklineProps = {
  values: number[]
  up: boolean
}

export function Sparkline({ values, up }: SparklineProps) {
  // If there are not enough values, we render a blank space to avoid errors.
  if (values.length < 2) {
    return <div className="h-10 w-24" />
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const width = 96
  const height = 40

  // Map each data point to SVG coordinates.
  // The x position is based on the index in the array,
  // and the y position is based on the value relative to the min/max range.
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
