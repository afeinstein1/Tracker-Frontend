import { Progress } from '@chakra-ui/react'

export interface MeterProps {
  label?: string
  value: number
  maxValue: number
}

export function Meter({ label, value, maxValue }: MeterProps) {
  const percentage = maxValue === 0 ? 0 : Math.max(0, Math.min(100, (value / maxValue) * 100))

  return (
    <Progress.Root value={value} min={0} max={maxValue} size="lg" my={4}>
      <Progress.Label>{label}</Progress.Label>
      <Progress.Track>
        <Progress.Range
          css={{
            backgroundImage: 'linear-gradient(to right, #dc2626, #f97316, #eab308, #22c55e)',
            backgroundPosition: 'left center',
            backgroundSize: `${percentage > 0 ? 10000 / percentage : 100}% 100%`,
            transition: 'width 0.3s ease, background-size 0.3s ease'
          }}
        />
      </Progress.Track>
      <Progress.ValueText>{value.toFixed(2)}%</Progress.ValueText>
    </Progress.Root>
  )
}
