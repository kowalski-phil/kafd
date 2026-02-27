import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimerReturn {
  secondsLeft: number
  isRunning: boolean
  start: (seconds: number) => void
  stop: () => void
  reset: () => void
}

export function useTimer(onDone?: () => void): UseTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback((seconds: number) => {
    stop()
    setSecondsLeft(seconds)
    setIsRunning(true)
  }, [stop])

  const reset = useCallback(() => {
    stop()
    setSecondsLeft(0)
  }, [stop])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stop()
          onDoneRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, stop])

  return { secondsLeft, isRunning, start, stop, reset }
}
