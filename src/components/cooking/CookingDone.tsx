import { Check, ArrowLeft } from 'lucide-react'
import { t } from '../../i18n'

interface CookingDoneProps {
  hasMealPlan: boolean
  onMarkComplete: () => void
  onBack: () => void
}

export function CookingDone({ hasMealPlan, onMarkComplete, onBack }: CookingDoneProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <Check size={40} className="text-green-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('cooking.done')}</h2>
      <p className="text-gray-500 mb-8">{t('cooking.doneMessage')}</p>

      {hasMealPlan ? (
        <button
          onClick={onMarkComplete}
          className="w-full max-w-xs py-3 bg-green-500 text-white rounded-xl text-lg font-semibold mb-3"
        >
          {t('cooking.markComplete')}
        </button>
      ) : null}

      <button
        onClick={onBack}
        className="w-full max-w-xs py-3 bg-gray-100 text-gray-600 rounded-xl text-base font-medium flex items-center justify-center gap-2"
      >
        <ArrowLeft size={18} />
        {t('cooking.backToRecipe')}
      </button>
    </div>
  )
}
