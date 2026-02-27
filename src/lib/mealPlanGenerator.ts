import type { Recipe, MealType, UserSettings, MealPlan } from './types'
import { MEAL_TYPES } from './constants'
import { toDateString } from './dateUtils'

interface GeneratorInput {
  recipes: Recipe[]
  settings: UserSettings
  dates: Date[]
  existingCompleted?: MealPlan[]
}

type PlanSlot = Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>

/**
 * Determine which meal slots to use based on meals_per_day.
 * 3 → breakfast/lunch/dinner
 * 4 → + snack_1
 * 5 → + snack_2
 */
export function getMealSlots(mealsPerDay: 3 | 4 | 5): typeof MEAL_TYPES[number][] {
  return MEAL_TYPES.slice(0, mealsPerDay)
}

/** Get the time budget for a given meal type from settings */
function getTimeBudget(settings: UserSettings, mealType: MealType): number {
  switch (mealType) {
    case 'breakfast': return settings.time_budget_breakfast
    case 'lunch': return settings.time_budget_lunch
    case 'dinner': return settings.time_budget_dinner
    case 'snack_1':
    case 'snack_2': return settings.time_budget_snack
  }
}

/** Weighted random pick from an array of { item, weight } */
function weightedPick<T>(items: { item: T; weight: number }[]): T | null {
  if (items.length === 0) return null
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0)
  let r = Math.random() * totalWeight
  for (const { item, weight } of items) {
    r -= weight
    if (r <= 0) return item
  }
  return items[items.length - 1].item
}

/** Get the category tag that matches a meal type */
function mealTypeToCategory(mealType: MealType): string {
  if (mealType === 'snack_1' || mealType === 'snack_2') return 'snack'
  return mealType
}

/**
 * Generate a week of meal plans.
 * Pure function — does not call any API.
 */
export function generateMealPlan({ recipes, settings, dates, existingCompleted = [] }: GeneratorInput): PlanSlot[] {
  const slots = getMealSlots(settings.meals_per_day)
  const result: PlanSlot[] = []

  // Track how many times each recipe is used across the week
  const weekUsage = new Map<string, number>()

  // Pre-index completed meals by date+mealType
  const completedSet = new Set(
    existingCompleted.map((m) => `${m.date}_${m.meal_type}`)
  )

  for (const date of dates) {
    const dateStr = toDateString(date)
    const dayPlans: PlanSlot[] = []

    for (const slot of slots) {
      // Skip if already completed (when regenerating a day)
      if (completedSet.has(`${dateStr}_${slot.value}`)) {
        const existing = existingCompleted.find(
          (m) => m.date === dateStr && m.meal_type === slot.value
        )
        if (existing) {
          const { id: _, created_at: _c, updated_at: _u, ...rest } = existing
          result.push(rest)
          continue
        }
      }

      const category = mealTypeToCategory(slot.value)
      const timeBudget = getTimeBudget(settings, slot.value)

      // Filter eligible recipes
      const eligible = recipes.filter((r) => {
        if (r.is_excluded) return false
        if (!r.category_tags.includes(category as Recipe['category_tags'][number])) return false
        if (r.prep_time_minutes != null && r.prep_time_minutes > timeBudget) return false
        // Max 2x same recipe per week
        if ((weekUsage.get(r.id) ?? 0) >= 2) return false
        return true
      })

      if (eligible.length === 0) {
        console.warn(`[MealPlan] No eligible recipes for ${dateStr} ${slot.value} (category=${category}, timeBudget=${timeBudget}min). Total recipes with this category: ${recipes.filter(r => !r.is_excluded && r.category_tags.includes(category as Recipe['category_tags'][number])).length}`)
      }

      const weighted = eligible.map((r) => ({
        item: r,
        weight: r.is_favorite ? 3 : 1,
      }))

      const picked = weightedPick(weighted)

      const plan: PlanSlot = {
        date: dateStr,
        meal_type: slot.value,
        recipe_id: picked?.id ?? null,
        servings: 1,
        is_completed: false,
        is_free_meal: false,
        free_meal_calories: null,
        free_meal_note: null,
        is_meal_prep: false,
        meal_prep_source_id: null,
      }

      if (picked) {
        weekUsage.set(picked.id, (weekUsage.get(picked.id) ?? 0) + 1)
      }

      dayPlans.push(plan)
    }

    // Calorie balancing: check if daily total is within ±10% of target
    const dayCalories = dayPlans.reduce((sum, p) => {
      if (!p.recipe_id) return sum
      const recipe = recipes.find((r) => r.id === p.recipe_id)
      return sum + (recipe?.calories ?? 0)
    }, 0)

    const target = settings.daily_calorie_target
    const lowerBound = target * 0.9
    const upperBound = target * 1.1

    if (dayCalories > 0 && (dayCalories < lowerBound || dayCalories > upperBound)) {
      // Try swapping the highest-calorie meal up to 5 times
      for (let attempt = 0; attempt < 5; attempt++) {
        // Find the plan with the highest calorie recipe
        let maxCalIdx = -1
        let maxCal = 0
        for (let i = 0; i < dayPlans.length; i++) {
          const p = dayPlans[i]
          if (!p.recipe_id || p.is_completed) continue
          const r = recipes.find((rec) => rec.id === p.recipe_id)
          if (r && (r.calories ?? 0) > maxCal) {
            maxCal = r.calories ?? 0
            maxCalIdx = i
          }
        }
        if (maxCalIdx === -1) break

        const planToSwap = dayPlans[maxCalIdx]
        const slot = slots.find((s) => s.value === planToSwap.meal_type)!
        const category = mealTypeToCategory(slot.value)
        const timeBudget = getTimeBudget(settings, slot.value)

        // Calculate calories from other meals
        const otherCalories = dayPlans.reduce((sum, p, i) => {
          if (i === maxCalIdx || !p.recipe_id) return sum
          const recipe = recipes.find((r) => r.id === p.recipe_id)
          return sum + (recipe?.calories ?? 0)
        }, 0)

        const neededCalories = target - otherCalories

        // Find recipes closer to the needed calories
        const alternatives = recipes.filter((r) => {
          if (r.is_excluded || r.calories == null) return false
          if (!r.category_tags.includes(category as Recipe['category_tags'][number])) return false
          if (r.prep_time_minutes != null && r.prep_time_minutes > timeBudget) return false
          if ((weekUsage.get(r.id) ?? 0) >= 2) return false
          if (r.id === planToSwap.recipe_id) return false
          return true
        })

        // Pick the one closest to needed calories
        const sorted = alternatives.sort((a, b) =>
          Math.abs((a.calories ?? 0) - neededCalories) - Math.abs((b.calories ?? 0) - neededCalories)
        )

        if (sorted.length > 0) {
          const replacement = sorted[0]
          // Update usage tracking
          if (planToSwap.recipe_id) {
            weekUsage.set(planToSwap.recipe_id, (weekUsage.get(planToSwap.recipe_id) ?? 0) - 1)
          }
          weekUsage.set(replacement.id, (weekUsage.get(replacement.id) ?? 0) + 1)
          dayPlans[maxCalIdx] = { ...dayPlans[maxCalIdx], recipe_id: replacement.id }

          // Recheck
          const newTotal = dayPlans.reduce((sum, p) => {
            if (!p.recipe_id) return sum
            const recipe = recipes.find((r) => r.id === p.recipe_id)
            return sum + (recipe?.calories ?? 0)
          }, 0)
          if (newTotal >= lowerBound && newTotal <= upperBound) break
        } else {
          break
        }
      }
    }

    result.push(...dayPlans)
  }

  return result
}
