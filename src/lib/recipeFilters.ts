import type { Recipe, RecipeFilters } from './types'

export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  let result = recipes

  // Text search (title + ingredient names)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q))
    )
  }

  // Category filter
  if (filters.categories.length > 0) {
    result = result.filter((r) =>
      filters.categories.some((c) => r.category_tags.includes(c))
    )
  }

  // Cookbook filter
  if (filters.cookbookId) {
    result = result.filter((r) => r.cookbook_id === filters.cookbookId)
  }

  // Calorie range
  if (filters.calorieMin != null) {
    result = result.filter((r) => r.calories != null && r.calories >= filters.calorieMin!)
  }
  if (filters.calorieMax != null) {
    result = result.filter((r) => r.calories != null && r.calories <= filters.calorieMax!)
  }

  // Prep time
  if (filters.prepTimeMax != null) {
    result = result.filter(
      (r) => r.prep_time_minutes != null && r.prep_time_minutes <= filters.prepTimeMax!
    )
  }

  // Favorites
  if (filters.favoritesOnly) {
    result = result.filter((r) => r.is_favorite)
  }

  // Sort
  result = [...result].sort((a, b) => {
    const dir = filters.sortDirection === 'asc' ? 1 : -1
    switch (filters.sortBy) {
      case 'title':
        return dir * a.title.localeCompare(b.title, 'de')
      case 'calories':
        return dir * ((a.calories ?? 0) - (b.calories ?? 0))
      case 'prep_time':
        return dir * ((a.prep_time_minutes ?? 0) - (b.prep_time_minutes ?? 0))
      default:
        return 0
    }
  })

  return result
}
