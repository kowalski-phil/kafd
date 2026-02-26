import type { IngredientCategory, CategoryTag } from './types'

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
