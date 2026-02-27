import type { IngredientCategory, CategoryTag, MealType } from './types'

export const INGREDIENT_CATEGORIES: { value: IngredientCategory; label: string }[] = [
  { value: 'fruits_vegetables', label: 'Obst & Gemüse' },
  { value: 'meat_fish', label: 'Fleisch & Fisch' },
  { value: 'dairy', label: 'Milchprodukte' },
  { value: 'dry_goods', label: 'Trockenwaren' },
  { value: 'spices', label: 'Gewürze & Öle' },
  { value: 'other', label: 'Sonstiges' },
]

export const CATEGORY_TAGS: { value: CategoryTag; label: string }[] = [
  { value: 'breakfast', label: 'Frühstück' },
  { value: 'lunch', label: 'Mittagessen' },
  { value: 'dinner', label: 'Abendessen' },
  { value: 'snack', label: 'Snack' },
]

export const MEAL_TYPES: { value: MealType; label: string; category: CategoryTag }[] = [
  { value: 'breakfast', label: 'Frühstück', category: 'breakfast' },
  { value: 'lunch', label: 'Mittagessen', category: 'lunch' },
  { value: 'dinner', label: 'Abendessen', category: 'dinner' },
  { value: 'snack_1', label: 'Snack 1', category: 'snack' },
  { value: 'snack_2', label: 'Snack 2', category: 'snack' },
]

export const DEFAULT_USER_SETTINGS = {
  daily_calorie_target: 1800,
  meals_per_day: 3 as 3 | 4 | 5,
  time_budget_breakfast: 15,
  time_budget_lunch: 30,
  time_budget_dinner: 30,
  time_budget_snack: 10,
  start_weight_kg: null as number | null,
  target_weight_kg: null as number | null,
  pantry_staples: [] as string[],
}

export const DEFAULT_RECIPE_FILTERS = {
  search: '',
  categories: [] as CategoryTag[],
  cookbookId: null,
  calorieMin: null,
  calorieMax: null,
  prepTimeMax: null,
  favoritesOnly: false,
  sortBy: 'title' as const,
  sortDirection: 'asc' as const,
}
