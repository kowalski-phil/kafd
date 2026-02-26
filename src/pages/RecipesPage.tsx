import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { t } from '../i18n'
import { getRecipes } from '../api/recipes'
import { getCookbooks } from '../api/cookbooks'
import { filterRecipes } from '../lib/recipeFilters'
import { DEFAULT_RECIPE_FILTERS } from '../lib/constants'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { FilterBar } from '../components/recipes/FilterBar'
import type { Recipe, RecipeFilters, Cookbook } from '../lib/types'

export function RecipesPage() {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([])
  const [filters, setFilters] = useState<RecipeFilters>(DEFAULT_RECIPE_FILTERS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [recipesData, cookbooksData] = await Promise.all([
        getRecipes(),
        getCookbooks(),
      ])
      setRecipes(recipesData)
      setCookbooks(cookbooksData)
    } catch (err) {
      console.error('Failed to load recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filterRecipes(recipes, filters)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">{t('nav.recipes')}</h1>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('recipes.search')}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          cookbooks={cookbooks}
        />
      </div>

      {/* Recipe list */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              {recipes.length === 0 ? t('recipes.empty') : t('recipes.noResults')}
            </p>
            {recipes.length === 0 && (
              <p className="text-gray-300 text-xs mt-1">{t('recipes.emptyHint')}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/recipes/add')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center active:bg-orange-600 transition-colors z-20"
      >
        <Plus size={28} />
      </button>
    </div>
  )
}
