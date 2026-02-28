import { Check, ChefHat, Clock, Undo2, Utensils } from 'lucide-react'
import type { MealPlanWithRecipe } from '../../lib/types'
import { MEAL_TYPES } from '../../lib/constants'
import { t } from '../../i18n'

interface MealCardProps {
  plan: MealPlanWithRecipe
  onCook: () => void
  onMarkEaten: () => void
  onFreeMeal: () => void
  onUndo?: () => void
}

export function MealCard({ plan, onCook, onMarkEaten, onFreeMeal, onUndo }: MealCardProps) {
  const mealLabel = MEAL_TYPES.find((m) => m.value === plan.meal_type)?.label ?? plan.meal_type

  // Completed free meal
  if (plan.is_completed && plan.is_free_meal) {
    return (
      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">{mealLabel}</div>
            <div className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
              <Check size={16} />
              {t('plan.freeMeal')}
            </div>
            {plan.free_meal_note && (
              <div className="text-xs text-green-500 mt-0.5">{plan.free_meal_note}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {plan.free_meal_calories && (
              <div className="text-sm font-bold text-green-600">{plan.free_meal_calories} kcal</div>
            )}
            {onUndo && (
              <button onClick={onUndo} className="p-1.5 text-green-400 hover:text-orange-500" title={t('today.undo')}>
                <Undo2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Completed recipe
  if (plan.is_completed) {
    return (
      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
        <div className="flex items-center gap-3">
          {plan.recipe?.photo_url ? (
            <img src={plan.recipe.photo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <Check size={20} className="text-green-500" />
            </div>
          )}
          <div className="flex-1">
            <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-0.5">{mealLabel}</div>
            <div className="text-sm font-semibold text-green-700">
              {plan.recipe?.title ?? t('plan.completed')}
            </div>
            {plan.recipe?.calories && (
              <div className="text-xs text-green-500 mt-0.5">{plan.recipe.calories} kcal</div>
            )}
          </div>
          {onUndo && (
            <button onClick={onUndo} className="p-1.5 text-green-400 hover:text-orange-500" title={t('today.undo')}>
              <Undo2 size={16} />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Unassigned slot
  if (!plan.recipe) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-dashed border-gray-200">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{mealLabel}</div>
        <button
          onClick={onFreeMeal}
          className="w-full py-2 bg-gray-50 rounded-xl text-sm text-gray-500 font-medium"
        >
          {t('plan.markFree')}
        </button>
      </div>
    )
  }

  // Active recipe card
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs font-medium text-orange-500 uppercase tracking-wide mb-2">{mealLabel}</div>
      <div className="flex gap-3">
        {plan.recipe.photo_url ? (
          <img src={plan.recipe.photo_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <ChefHat size={24} className="text-orange-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{plan.recipe.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            {plan.recipe.calories && <span>{plan.recipe.calories} kcal</span>}
            {plan.recipe.prep_time_minutes && (
              <span className="flex items-center gap-0.5">
                <Clock size={11} />
                {plan.recipe.prep_time_minutes} Min.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onCook}
          className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1.5"
        >
          <ChefHat size={14} />
          {t('recipes.cookNow')}
        </button>
        <button
          onClick={onMarkEaten}
          className="py-2 px-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium"
        >
          <Check size={16} />
        </button>
        <button
          onClick={onFreeMeal}
          className="py-2 px-3 bg-gray-50 text-gray-500 rounded-xl text-sm font-medium"
        >
          <Utensils size={16} />
        </button>
      </div>
    </div>
  )
}
