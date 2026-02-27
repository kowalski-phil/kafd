import type { RecipeStep } from '../../lib/types'
import { t } from '../../i18n'
import { CookingTimer } from './CookingTimer'

interface StepByStepProps {
  steps: RecipeStep[]
  currentStep: number
  onPrevious: () => void
  onNext: () => void
}

export function StepByStep({ steps, currentStep, onPrevious, onNext }: StepByStepProps) {
  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  return (
    <div className="px-6 py-6 flex flex-col min-h-[calc(100vh-56px)]">
      {/* Step counter */}
      <div className="text-center mb-2">
        <span className="text-sm text-gray-400">
          {t('cooking.step')} {currentStep + 1} {t('cooking.of')} {steps.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === currentStep ? 'w-6 bg-orange-500' : i < currentStep ? 'w-1.5 bg-orange-300' : 'w-1.5 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step instruction */}
      <div className="flex-1">
        <p className="text-lg leading-relaxed text-gray-800">{step.instruction}</p>

        {/* Timer if step has duration */}
        {step.duration_seconds && (
          <CookingTimer durationSeconds={step.duration_seconds} />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-base font-semibold disabled:opacity-30"
        >
          {t('cooking.previous')}
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-base font-semibold"
        >
          {isLast ? t('cooking.finish') : t('cooking.next')}
        </button>
      </div>
    </div>
  )
}
