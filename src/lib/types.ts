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
