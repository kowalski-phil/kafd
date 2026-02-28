export interface Cookbook {
  id: string
  name: string
  author: string | null
  created_at: string
}

export type IngredientCategory =
  | 'fruits_vegetables'
  | 'meat_fish'
  | 'dairy'
  | 'dry_goods'
  | 'spices'
  | 'other'

export interface Ingredient {
  name: string
  amount: number
  unit: string
  category: IngredientCategory
}

export interface RecipeStep {
  step_number: number
  instruction: string
  duration_seconds?: number
}

export type CategoryTag = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Recipe {
  id: string
  title: string
  cookbook_id: string | null
  page_number: number | null
  ingredients: Ingredient[]
  steps: RecipeStep[]
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  prep_time_minutes: number | null
  base_servings: number
  category_tags: CategoryTag[]
  is_favorite: boolean
  is_excluded: boolean
  photo_url: string | null
  created_at: string
  updated_at: string
  cookbook?: Cookbook
}

export interface RecipeFilters {
  search: string
  categories: CategoryTag[]
  cookbookId: string | null
  calorieMin: number | null
  calorieMax: number | null
  prepTimeMax: number | null
  favoritesOnly: boolean
  sortBy: 'title' | 'calories' | 'prep_time'
  sortDirection: 'asc' | 'desc'
}

export interface ClaudeParseResult {
  title: string
  ingredients: Ingredient[]
  steps: RecipeStep[]
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  prep_time_minutes: number | null
  base_servings: number | null
}

// Phase 2 types

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack_1' | 'snack_2'

export interface UserSettings {
  id: string
  daily_calorie_target: number
  meals_per_day: 3 | 4 | 5
  time_budget_breakfast: number
  time_budget_lunch: number
  time_budget_dinner: number
  time_budget_snack: number
  start_weight_kg: number | null
  target_weight_kg: number | null
  pantry_staples: string[]
  created_at: string
  updated_at: string
}

export interface MealPlan {
  id: string
  date: string
  meal_type: MealType
  recipe_id: string | null
  servings: number
  is_completed: boolean
  is_free_meal: boolean
  free_meal_calories: number | null
  free_meal_note: string | null
  is_meal_prep: boolean
  meal_prep_source_id: string | null
  created_at: string
  updated_at: string
}

export interface MealPlanWithRecipe extends MealPlan {
  recipe?: Recipe | null
}

export interface WeightLogEntry {
  id: string
  date: string
  weight_kg: number
  created_at: string
}

export interface ShoppingListItem {
  name: string
  amount: number
  unit: string
  category: IngredientCategory
  is_checked: boolean
}

export interface ShoppingList {
  id: string
  week_start: string
  items: ShoppingListItem[]
  created_at: string
}
