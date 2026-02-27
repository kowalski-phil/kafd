import { ChefHat, Clock } from 'lucide-react'
import type { Recipe } from '../../lib/types'
import { t } from '../../i18n'

interface CookingOverviewProps {
  recipe: Recipe
  servings: number
  onServingsChange: (s: number) => void
  onStart: () => void
}

export function CookingOverview({ recipe, servings, onServingsChange, onStart }: CookingOverviewProps) {
  return (
    <div className="flex flex-col items-center px-6 py-8">
      {recipe.photo_url ? (
        <img src={recipe.photo_url} alt="" className="w-40 h-40 rounded-2xl object-cover mb-6" />
      ) : (
        <div className="w-40 h-40 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
          <ChefHat size={48} className="text-orange-300" />
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">{recipe.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        {recipe.calories && <span>{recipe.calories} kcal</span>}
        {recipe.prep_time_minutes && (
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {recipe.prep_time_minutes} Min.
          </span>
        )}
      </div>

      {/* Servings selector */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-base text-gray-600">{t('cooking.servings')}:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onServingsChange(Math.max(1, servings - 1))}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-lg font-bold flex items-center justify-center"
          >
            −
          </button>
          <span className="text-xl font-bold text-gray-800 w-8 text-center">{servings}</span>
          <button
            onClick={() => onServingsChange(servings + 1)}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 text-lg font-bold flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs py-3 bg-orange-500 text-white rounded-xl text-lg font-semibold"
      >
        {t('cooking.start')}
      </button>
    </div>
  )
}
