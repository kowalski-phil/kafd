import { Play, Pause, RotateCcw } from 'lucide-react'
import { useTimer } from '../../hooks/useTimer'
import { t } from '../../i18n'

interface CookingTimerProps {
  durationSeconds: number
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 880
    oscillator.type = 'sine'
    gain.gain.value = 0.3
    oscillator.start()
    // Beep pattern: 3 short beeps
    setTimeout(() => { gain.gain.value = 0 }, 200)
    setTimeout(() => { gain.gain.value = 0.3 }, 400)
    setTimeout(() => { gain.gain.value = 0 }, 600)
    setTimeout(() => { gain.gain.value = 0.3 }, 800)
    setTimeout(() => {
      oscillator.stop()
      ctx.close()
    }, 1000)
  } catch {
    // Audio not available
  }
}

export function CookingTimer({ durationSeconds }: CookingTimerProps) {
  const { secondsLeft, isRunning, start, stop, reset } = useTimer(playBeep)

  const displaySeconds = secondsLeft > 0 ? secondsLeft : durationSeconds
  const minutes = Math.floor(displaySeconds / 60)
  const seconds = displaySeconds % 60

  const isDone = secondsLeft === 0 && !isRunning && durationSeconds > 0

  return (
    <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-xl">
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-0.5">{t('cooking.timer')}</div>
        <div className={`text-2xl font-mono font-bold ${
          isDone ? 'text-green-500' : isRunning ? 'text-orange-500' : 'text-gray-700'
        }`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        {isDone && (
          <div className="text-xs text-green-500 font-medium">{t('cooking.timerDone')}</div>
        )}
      </div>
      <div className="flex gap-2">
        {isRunning ? (
          <button
            onClick={stop}
            className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"
          >
            <Pause size={18} />
          </button>
        ) : (
          <button
            onClick={() => start(secondsLeft > 0 ? secondsLeft : durationSeconds)}
            className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center"
          >
            <Play size={18} />
          </button>
        )}
        <button
          onClick={() => { reset() }}
          className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  )
}
