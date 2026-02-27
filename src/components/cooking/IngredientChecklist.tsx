import { useState } from 'react'
import { Check } from 'lucide-react'
import type { Ingredient } from '../../lib/types'
import { t } from '../../i18n'

interface IngredientChecklistProps {
  ingredients: Ingredient[]
  onNext: () => void
}

export function IngredientChecklist({ ingredients, onNext }: IngredientChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggleItem(index: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="px-6 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('cooking.ingredients')}</h2>

      <div className="space-y-2 mb-8">
        {ingredients.map((ing, i) => (
          <button
            key={i}
            onClick={() => toggleItem(i)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
              checked.has(i) ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              checked.has(i) ? 'bg-green-500' : 'border-2 border-gray-300'
            }`}>
              {checked.has(i) && <Check size={14} className="text-white" />}
            </div>
            <span className={`text-base ${
              checked.has(i) ? 'text-green-700 line-through' : 'text-gray-800'
            }`}>
              {ing.amount} {ing.unit} {ing.name}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-orange-500 text-white rounded-xl text-lg font-semibold"
      >
        {t('cooking.next')}
      </button>
    </div>
  )
}
