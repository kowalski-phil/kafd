import type { MealPlanWithRecipe, ShoppingListItem, IngredientCategory } from './types'

/** Aggregate ingredients from all meal plans into a shopping list, merging duplicates */
export function aggregateIngredients(
  plans: MealPlanWithRecipe[],
  pantryStaples: string[] = []
): ShoppingListItem[] {
  const pantrySet = new Set(pantryStaples.map(s => s.toLowerCase().trim()))

  // Key: normalized "name|unit" → accumulated item
  const merged = new Map<string, {
    name: string
    amount: number
    unit: string
    category: IngredientCategory
  }>()

  for (const plan of plans) {
    if (plan.is_free_meal || !plan.recipe) continue
    for (const ing of plan.recipe.ingredients) {
      if (!ing.name.trim()) continue
      const key = `${ing.name.toLowerCase().trim()}|${ing.unit.toLowerCase().trim()}`
      const existing = merged.get(key)
      if (existing) {
        existing.amount += ing.amount * plan.servings
      } else {
        merged.set(key, {
          name: ing.name,
          amount: ing.amount * plan.servings,
          unit: ing.unit,
          category: ing.category,
        })
      }
    }
  }

  // Sort by category then name
  const categoryOrder: IngredientCategory[] = [
    'fruits_vegetables', 'meat_fish', 'dairy', 'dry_goods', 'spices', 'other',
  ]

  return Array.from(merged.values())
    .sort((a, b) => {
      const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
      if (catDiff !== 0) return catDiff
      return a.name.localeCompare(b.name, 'de')
    })
    .map(item => ({
      ...item,
      amount: Math.round(item.amount * 10) / 10,
      is_checked: pantrySet.has(item.name.toLowerCase().trim()),
    }))
}
