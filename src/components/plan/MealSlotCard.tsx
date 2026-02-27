import { Check, Clock, Utensils } from 'lucide-react'
import type { MealPlanWithRecipe } from '../../lib/types'
import { MEAL_TYPES } from '../../lib/constants'
import { t } from '../../i18n'

interface MealSlotCardProps {
  plan: MealPlanWithRecipe
  onTap: (plan: MealPlanWithRecipe) => void
}

export function MealSlotCard({ plan, onTap }: MealSlotCardProps) {
  const mealLabel = MEAL_TYPES.find((m) => m.value === plan.meal_type)?.label ?? plan.meal_type

  if (plan.is_completed && plan.is_free_meal) {
    return (
      <div className="bg-green-50 rounded-xl p-2.5 border border-green-200">
        <div className="text-[10px] font-medium text-green-600 uppercase tracking-wide mb-0.5">
          {mealLabel}
        </div>
        <div className="text-xs font-medium text-green-700 flex items-center gap-1">
          <Check size={12} />
          {t('plan.freeMeal')}
          {plan.free_meal_calories && (
            <span className="text-[10px] text-green-500 ml-auto">{plan.free_meal_calories} kcal</span>
          )}
        </div>
      </div>
    )
  }

  if (plan.is_completed) {
    return (
      <div className="bg-green-50 rounded-xl p-2.5 border border-green-200">
        <div className="text-[10px] font-medium text-green-600 uppercase tracking-wide mb-0.5">
          {mealLabel}
        </div>
        <div className="text-xs font-medium text-green-700 flex items-center gap-1">
          <Check size={12} />
          {plan.recipe?.title ?? t('plan.completed')}
        </div>
        {plan.recipe?.calories && (
          <div className="text-[10px] text-green-500 mt-0.5">{plan.recipe.calories} kcal</div>
        )}
      </div>
    )
  }

  if (!plan.recipe) {
    return (
      <button
        onClick={() => onTap(plan)}
        className="w-full bg-gray-50 rounded-xl p-2.5 border border-dashed border-gray-200 text-left"
      >
        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
          {mealLabel}
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Utensils size={12} />
          {t('plan.swap')}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onTap(plan)}
      className="w-full bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm text-left active:scale-[0.98] transition-transform"
    >
      <div className="text-[10px] font-medium text-orange-500 uppercase tracking-wide mb-0.5">
        {mealLabel}
      </div>
      <div className="text-xs font-medium text-gray-800 leading-tight line-clamp-2">
        {plan.recipe.title}
      </div>
      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
        {plan.recipe.calories && <span>{plan.recipe.calories} kcal</span>}
        {plan.recipe.prep_time_minutes && (
          <span className="flex items-center gap-0.5 font-semibold text-gray-500">
            <Clock size={9} />
            {plan.recipe.prep_time_minutes} Min.
          </span>
        )}
      </div>
    </button>
  )
}
