import { useEffect, useRef } from 'react'

export function useWakeLock() {
  const wakeLock = useRef<WakeLockSentinel | null>(null)

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock.current = await navigator.wakeLock.request('screen')
      }
    } catch {
      // Wake Lock not supported or permission denied
    }
  }

  useEffect(() => {
    requestWakeLock()

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      wakeLock.current?.release()
      wakeLock.current = null
    }
  }, [])
}
