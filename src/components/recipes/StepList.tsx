import { Clock } from 'lucide-react'
import type { RecipeStep } from '../../lib/types'

interface StepListProps {
  steps: RecipeStep[]
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} Sek.`
  const min = Math.round(seconds / 60)
  return `${min} Min.`
}

export function StepList({ steps }: StepListProps) {
  return (
    <ol className="space-y-4">
      {steps.map((step) => (
        <li key={step.step_number} className="flex gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0 mt-0.5">
            {step.step_number}
          </span>
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">{step.instruction}</p>
            {step.duration_seconds && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-gray-400">
                <Clock size={12} />
                {formatDuration(step.duration_seconds)}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
