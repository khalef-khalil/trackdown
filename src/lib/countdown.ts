export interface CountdownData {
  id: string
  start_value: number
  rate_per_second: number
  started_at: string
  is_running: boolean
  created_at: string
  updated_at: string
}

export const calculateCurrentValue = (countdown: CountdownData): number => {
  if (!countdown.is_running) {
    return countdown.start_value
  }

  const startTime = new Date(countdown.started_at).getTime()
  const currentTime = new Date().getTime()
  const elapsedSeconds = (currentTime - startTime) / 1000
  const decrement = elapsedSeconds * countdown.rate_per_second
  const currentValue = countdown.start_value - decrement

  return Math.max(0, currentValue)
}

export const getMaxDecimalPlaces = (startValue: string, rate: string): number => {
  const startDecimals = startValue.includes('.') ? startValue.split('.')[1].length : 0
  const rateDecimals = rate.includes('.') ? rate.split('.')[1].length : 0
  return Math.max(startDecimals, rateDecimals)
}

export const formatCount = (value: number, maxDecimals: number): string => {
  return value.toFixed(maxDecimals)
} 