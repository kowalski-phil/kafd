import type { MealPlanWithRecipe } from './types'
import { toDateString, subDays } from './dateUtils'

/**
 * Calculate streak: consecutive days (ending today or yesterday) with at least 1 completed meal.
 * Looks back up to `maxDays` from today.
 */
export function calculateStreak(plans: MealPlanWithRecipe[]): number {
  // Build a set of dates that have at least 1 completed meal
  const completedDates = new Set<string>()
  for (const plan of plans) {
    if (plan.is_completed) {
      completedDates.add(plan.date)
    }
  }

  const today = new Date()
  const todayStr = toDateString(today)

  // Start from today if it has completions, otherwise from yesterday
  let startDay = 0
  if (!completedDates.has(todayStr)) {
    const yesterdayStr = toDateString(subDays(today, 1))
    if (!completedDates.has(yesterdayStr)) return 0
    startDay = 1
  }

  let streak = 0
  for (let i = startDay; i < 365; i++) {
    const dateStr = toDateString(subDays(today, i))
    if (completedDates.has(dateStr)) {
      streak++
    } else {
      break
    }
  }

  return streak
}
