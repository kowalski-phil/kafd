import type { MealPlanWithRecipe } from './types'

export interface DailyCalorieSummary {
  date: string
  consumed: number
  target: number
}

/** Group meal plans by date and sum consumed (completed) calories */
export function aggregateDailyCalories(
  plans: MealPlanWithRecipe[],
  target: number
): DailyCalorieSummary[] {
  const byDate = new Map<string, number>()

  for (const plan of plans) {
    if (!plan.is_completed) continue
    const cal = plan.is_free_meal
      ? (plan.free_meal_calories ?? 0)
      : (plan.recipe?.calories ?? 0)
    byDate.set(plan.date, (byDate.get(plan.date) ?? 0) + cal)
  }

  return Array.from(byDate.entries())
    .map(([date, consumed]) => ({ date, consumed, target }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
