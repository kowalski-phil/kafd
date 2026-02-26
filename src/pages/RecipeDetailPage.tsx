import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Trash2, Clock, Flame } from 'lucide-react'
import { t } from '../i18n'
import { getRecipe, toggleFavorite, deleteRecipe } from '../api/recipes'
import { ServingConverter } from '../components/recipes/ServingConverter'
import { IngredientList } from '../components/recipes/IngredientList'
import { StepList } from '../components/recipes/StepList'
import { convertServings, convertCalories } from '../lib/servingMath'
import { CATEGORY_TAGS } from '../lib/constants'
import type { Recipe } from '../lib/types'

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [servings, setServings] = useState(1)

  useEffect(() => {
    if (!id) return
    loadRecipe(id)
  }, [id])

  async function loadRecipe(recipeId: string) {
    try {
      const data = await getRecipe(recipeId)
      setRecipe(data)
      setServings(data.base_servings)
    } catch (err) {
      console.error('Failed to load recipe:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleFavorite() {
    if (!recipe) return
    await toggleFavorite(recipe.id, recipe.is_favorite)
    setRecipe({ ...recipe, is_favorite: !recipe.is_favorite })
  }

  async function handleDelete() {
    if (!recipe) return
    if (!confirm(t('recipes.deleteConfirm'))) return
    await deleteRecipe(recipe.id)
    navigate('/recipes')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-12 text-gray-400">
        Rezept nicht gefunden
      </div>
    )
  }

  const convertedIngredients = convertServings(recipe.ingredients, recipe.base_servings, servings)
  const convertedCalories = convertCalories(recipe.calories, recipe.base_servings, servings)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
          <div className="flex gap-2">
            <button onClick={handleToggleFavorite} className="p-2">
              <Heart
                size={22}
                className={recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
              />
            </button>
            <button onClick={handleDelete} className="p-2">
              <Trash2 size={22} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Photo */}
      {recipe.photo_url && (
        <img
          src={recipe.photo_url}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="px-4 py-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{recipe.title}</h1>

        {/* Cookbook + Page */}
        {recipe.cookbook && (
          <p className="text-sm text-gray-400 mb-3">
            {recipe.cookbook.name}
            {recipe.page_number && ` — ${t('cookbook.page')} ${recipe.page_number}`}
          </p>
        )}

        {/* Category tags */}
        <div className="flex gap-2 mb-4">
          {recipe.category_tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium"
            >
              {CATEGORY_TAGS.find((c) => c.value === tag)?.label ?? tag}
            </span>
          ))}
        </div>

        {/* Meta row */}
        <div className="flex gap-4 mb-6 text-sm text-gray-500">
          {convertedCalories != null && (
            <div className="flex items-center gap-1">
              <Flame size={16} className="text-orange-400" />
              {convertedCalories} {t('recipes.calories')}
            </div>
          )}
          {recipe.prep_time_minutes != null && (
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-gray-400" />
              {recipe.prep_time_minutes} {t('recipes.minutes')}
            </div>
          )}
        </div>

        {/* Macros */}
        {(recipe.protein_g || recipe.carbs_g || recipe.fat_g) && (
          <div className="flex gap-4 mb-6 text-xs text-gray-400">
            {recipe.protein_g != null && <span>Protein: {recipe.protein_g}g</span>}
            {recipe.carbs_g != null && <span>Kohlenhydrate: {recipe.carbs_g}g</span>}
            {recipe.fat_g != null && <span>Fett: {recipe.fat_g}g</span>}
          </div>
        )}

        {/* Serving converter */}
        <ServingConverter
          servings={servings}
          baseServings={recipe.base_servings}
          onChange={setServings}
        />

        {/* Ingredients */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{t('recipes.ingredients')}</h2>
          <IngredientList ingredients={convertedIngredients} />
        </div>

        {/* Steps */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{t('recipes.steps')}</h2>
          <StepList steps={recipe.steps} />
        </div>
      </div>
    </div>
  )
}
