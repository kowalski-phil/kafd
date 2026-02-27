import type { MealPlanWithRecipe } from '../../lib/types'
import { formatDateShort, isSameDay } from '../../lib/dateUtils'
import { MealSlotCard } from './MealSlotCard'

interface DayColumnProps {
  date: Date
  plans: MealPlanWithRecipe[]
  onTapMeal: (plan: MealPlanWithRecipe) => void
}

export function DayColumn({ date, plans, onTapMeal }: DayColumnProps) {
  const isToday = isSameDay(date, new Date())
  const dayCalories = plans.reduce((sum, p) => {
    if (p.is_free_meal && p.free_meal_calories) return sum + p.free_meal_calories
    if (p.recipe?.calories) return sum + p.recipe.calories
    return sum
  }, 0)

  return (
    <div className={`min-w-[140px] flex-shrink-0 ${isToday ? 'relative' : ''}`}>
      <div className={`text-center py-1.5 rounded-t-xl text-xs font-semibold ${
        isToday ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {formatDateShort(date)}
      </div>
      <div className="space-y-1.5 p-1.5 bg-gray-50 rounded-b-xl min-h-[200px]">
        {plans.map((plan) => (
          <MealSlotCard key={plan.id} plan={plan} onTap={onTapMeal} />
        ))}
        {dayCalories > 0 && (
          <div className="text-center text-[10px] text-gray-400 pt-1">
            {dayCalories} kcal
          </div>
        )}
      </div>
    </div>
  )
}
