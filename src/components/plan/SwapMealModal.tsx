import { useState, useEffect } from 'react'
import { X, ChefHat, Check, Utensils, Clock } from 'lucide-react'
import { t } from '../../i18n'
import type { Recipe, MealPlanWithRecipe } from '../../lib/types'
import { MEAL_TYPES } from '../../lib/constants'
import { getRecipes } from '../../api/recipes'
import type { UserSettings } from '../../lib/types'

interface SwapMealModalProps {
  plan: MealPlanWithRecipe
  settings: UserSettings
  onSwap: (plan: MealPlanWithRecipe, recipeId: string) => void
  onComplete: (plan: MealPlanWithRecipe) => void
  onFreeMeal: (plan: MealPlanWithRecipe) => void
  onCook: (plan: MealPlanWithRecipe) => void
  onClose: () => void
}

export function SwapMealModal({ plan, settings, onSwap, onComplete, onFreeMeal, onCook, onClose }: SwapMealModalProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [showRecipes, setShowRecipes] = useState(false)

  const mealLabel = MEAL_TYPES.find((m) => m.value === plan.meal_type)?.label ?? plan.meal_type

  useEffect(() => {
    if (showRecipes) {
      getRecipes().then((all) => {
        const category = plan.meal_type === 'snack_1' || plan.meal_type === 'snack_2' ? 'snack' : plan.meal_type
        const timeBudget = plan.meal_type === 'breakfast' ? settings.time_budget_breakfast
          : plan.meal_type === 'lunch' ? settings.time_budget_lunch
          : plan.meal_type === 'dinner' ? settings.time_budget_dinner
          : settings.time_budget_snack

        const filtered = all.filter((r) => {
          if (r.is_excluded) return false
          if (!r.category_tags.includes(category as Recipe['category_tags'][number])) return false
          if (r.prep_time_minutes != null && r.prep_time_minutes > timeBudget) return false
          return true
        })
        setRecipes(filtered)
      })
    }
  }, [showRecipes, plan.meal_type, settings])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{mealLabel}</h2>
          <button onClick={onClose} className="p-1 text-gray-400">
            <X size={20} />
          </button>
        </div>

        {!showRecipes ? (
          /* Action buttons */
          <div className="p-4 space-y-2">
            {plan.recipe && !plan.is_completed && (
              <button
                onClick={() => onCook(plan)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-50 text-orange-600 font-medium text-sm"
              >
                <ChefHat size={18} />
                {t('plan.cookNow')}
              </button>
            )}
            {!plan.is_completed && (
              <button
                onClick={() => onComplete(plan)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-50 text-green-600 font-medium text-sm"
              >
                <Check size={18} />
                {t('plan.markComplete')}
              </button>
            )}
            {!plan.is_completed && (
              <button
                onClick={() => onFreeMeal(plan)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-600 font-medium text-sm"
              >
                <Utensils size={18} />
                {t('plan.markFree')}
              </button>
            )}
            <button
              onClick={() => setShowRecipes(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-600 font-medium text-sm"
            >
              <Utensils size={18} />
              {t('plan.swap')}
            </button>
          </div>
        ) : (
          /* Recipe list for swapping */
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('plan.swapTitle')}</h3>
            {recipes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">{t('plan.noRecipes')}</p>
            ) : (
              recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => onSwap(plan, recipe.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 text-left active:bg-gray-50"
                >
                  {recipe.photo_url ? (
                    <img src={recipe.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ChefHat size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{recipe.title}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {recipe.calories && <span>{recipe.calories} kcal</span>}
                      {recipe.prep_time_minutes && (
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} />
                          {recipe.prep_time_minutes} Min.
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
