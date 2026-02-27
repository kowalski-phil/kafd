import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Trash2, Clock, Flame, Pencil, Plus, Camera, ImagePlus } from 'lucide-react'
import { t } from '../i18n'
import { getRecipe, toggleFavorite, deleteRecipe, updateRecipe } from '../api/recipes'
import { uploadRecipePhoto } from '../api/storage'
import { ServingConverter } from '../components/recipes/ServingConverter'
import { IngredientList } from '../components/recipes/IngredientList'
import { StepList } from '../components/recipes/StepList'
import { CookbookSelect } from '../components/cookbooks/CookbookSelect'
import { CategoryTagSelect } from '../components/recipes/CategoryTagSelect'
import { convertServings, convertCalories } from '../lib/servingMath'
import { CATEGORY_TAGS, INGREDIENT_CATEGORIES } from '../lib/constants'
import type { Recipe, Ingredient, RecipeStep, CategoryTag, IngredientCategory } from '../lib/types'

/** Normalize German decimal comma to dot and parse as float */
function parseDecimal(value: string): number {
  return parseFloat(value.replace(',', '.')) || 0
}

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [servings, setServings] = useState(1)

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCookbookId, setEditCookbookId] = useState<string | null>(null)
  const [editPageNumber, setEditPageNumber] = useState('')
  const [editCategoryTags, setEditCategoryTags] = useState<CategoryTag[]>([])
  const [editBaseServings, setEditBaseServings] = useState('1')
  const [editPrepTime, setEditPrepTime] = useState('')
  const [editCalories, setEditCalories] = useState('')
  const [editProteinG, setEditProteinG] = useState('')
  const [editCarbsG, setEditCarbsG] = useState('')
  const [editFatG, setEditFatG] = useState('')
  const [editIngredients, setEditIngredients] = useState<Ingredient[]>([])
  const [editIngredientAmounts, setEditIngredientAmounts] = useState<string[]>([])
  const [editSteps, setEditSteps] = useState<RecipeStep[]>([])

  // Photo replacement state
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null)
  const photoInputCameraRef = useRef<HTMLInputElement>(null)
  const photoInputGalleryRef = useRef<HTMLInputElement>(null)

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

  function enterEditMode() {
    if (!recipe) return
    setEditTitle(recipe.title)
    setEditCookbookId(recipe.cookbook_id)
    setEditPageNumber(recipe.page_number != null ? String(recipe.page_number) : '')
    setEditCategoryTags([...recipe.category_tags])
    setEditBaseServings(String(recipe.base_servings))
    setEditPrepTime(recipe.prep_time_minutes != null ? String(recipe.prep_time_minutes) : '')
    setEditCalories(recipe.calories != null ? String(recipe.calories) : '')
    setEditProteinG(recipe.protein_g != null ? String(recipe.protein_g) : '')
    setEditCarbsG(recipe.carbs_g != null ? String(recipe.carbs_g) : '')
    setEditFatG(recipe.fat_g != null ? String(recipe.fat_g) : '')
    setEditIngredients(recipe.ingredients.map((ing) => ({ ...ing })))
    setEditIngredientAmounts(recipe.ingredients.map((ing) => ing.amount ? String(ing.amount) : ''))
    setEditSteps(recipe.steps.map((s) => ({ ...s })))
    setNewPhotoFile(null)
    setNewPhotoPreview(null)
    setEditError(null)
    setIsEditing(true)
  }

  function cancelEdit() {
    if (newPhotoPreview) URL.revokeObjectURL(newPhotoPreview)
    setIsEditing(false)
    setNewPhotoFile(null)
    setNewPhotoPreview(null)
    setEditError(null)
  }

  async function handleSave() {
    if (!recipe || !editTitle.trim()) return
    setSaving(true)
    setEditError(null)

    try {
      let photoUrl = recipe.photo_url
      if (newPhotoFile) {
        photoUrl = await uploadRecipePhoto(newPhotoFile)
      }

      // Normalize ingredient amounts from raw string inputs
      const normalizedIngredients = editIngredients.map((ing, i) => ({
        ...ing,
        amount: parseDecimal(editIngredientAmounts[i] ?? String(ing.amount)),
      }))

      const updated = await updateRecipe(recipe.id, {
        title: editTitle.trim(),
        cookbook_id: editCookbookId,
        page_number: editPageNumber ? parseInt(editPageNumber) : null,
        category_tags: editCategoryTags,
        base_servings: parseInt(editBaseServings) || 1,
        prep_time_minutes: editPrepTime ? parseInt(editPrepTime) : null,
        calories: editCalories ? parseInt(editCalories) : null,
        protein_g: editProteinG ? parseDecimal(editProteinG) : null,
        carbs_g: editCarbsG ? parseDecimal(editCarbsG) : null,
        fat_g: editFatG ? parseDecimal(editFatG) : null,
        ingredients: normalizedIngredients,
        steps: editSteps,
        photo_url: photoUrl,
      })

      // Reload to get full data with cookbook join
      await loadRecipe(recipe.id)
      setServings(updated.base_servings)
      if (newPhotoPreview) URL.revokeObjectURL(newPhotoPreview)
      setNewPhotoFile(null)
      setNewPhotoPreview(null)
      setIsEditing(false)
    } catch (err) {
      console.error('Save error:', err)
      setEditError(err instanceof Error ? err.message : t('general.error'))
    } finally {
      setSaving(false)
    }
  }

  // Ingredient editing helpers
  function addIngredient() {
    setEditIngredients([
      ...editIngredients,
      { name: '', amount: 0, unit: 'g', category: 'other' as IngredientCategory },
    ])
    setEditIngredientAmounts([...editIngredientAmounts, ''])
  }

  function updateIngredient(index: number, updates: Partial<Ingredient>) {
    setEditIngredients(editIngredients.map((ing, i) => (i === index ? { ...ing, ...updates } : ing)))
  }

  function removeIngredient(index: number) {
    setEditIngredients(editIngredients.filter((_, i) => i !== index))
    setEditIngredientAmounts(editIngredientAmounts.filter((_, i) => i !== index))
  }

  // Step editing helpers
  function addStep() {
    setEditSteps([
      ...editSteps,
      { step_number: editSteps.length + 1, instruction: '' },
    ])
  }

  function updateStep(index: number, instruction: string) {
    setEditSteps(editSteps.map((s, i) => (i === index ? { ...s, instruction } : s)))
  }

  function removeStep(index: number) {
    setEditSteps(
      editSteps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, step_number: i + 1 }))
    )
  }

  // Photo handling
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (newPhotoPreview) URL.revokeObjectURL(newPhotoPreview)
    setNewPhotoFile(file)
    setNewPhotoPreview(URL.createObjectURL(file))
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

  // Determine which photo URL to display
  const displayPhotoUrl = isEditing
    ? (newPhotoPreview ?? recipe.photo_url)
    : recipe.photo_url

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          {isEditing ? (
            <>
              <button onClick={cancelEdit} className="p-2 -ml-2 text-gray-500 text-sm font-medium">
                {t('general.cancel')}
              </button>
              <h1 className="font-semibold text-gray-800">{t('recipes.edit')}</h1>
              <button
                onClick={handleSave}
                disabled={!editTitle.trim() || saving}
                className="p-2 -mr-2 text-orange-500 text-sm font-semibold disabled:opacity-50"
              >
                {saving ? t('general.loading') : t('general.save')}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate(-1)} className="p-2 -ml-2">
                <ArrowLeft size={22} className="text-gray-700" />
              </button>
              <div className="flex gap-2">
                <button onClick={enterEditMode} className="p-2">
                  <Pencil size={20} className="text-gray-400" />
                </button>
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
            </>
          )}
        </div>
      </div>

      {/* Photo */}
      {isEditing ? (
        <div className="relative">
          {displayPhotoUrl ? (
            <img src={displayPhotoUrl} alt="" className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
              <Camera size={32} className="text-gray-300" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex gap-2">
            <label className="flex items-center gap-1 px-3 py-1.5 bg-white/90 rounded-lg text-xs font-medium text-gray-700 shadow-sm cursor-pointer active:bg-gray-100">
              <Camera size={14} />
              Foto
              <input
                ref={photoInputCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
            <label className="flex items-center gap-1 px-3 py-1.5 bg-white/90 rounded-lg text-xs font-medium text-gray-700 shadow-sm cursor-pointer active:bg-gray-100">
              <ImagePlus size={14} />
              Galerie
              <input
                ref={photoInputGalleryRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        displayPhotoUrl && (
          <img
            src={displayPhotoUrl}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
        )
      )}

      {/* Edit mode */}
      {isEditing ? (
        <div className="px-4 py-4 space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{editError}</div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Titel</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Cookbook + Page */}
          <CookbookSelect value={editCookbookId} onChange={setEditCookbookId} />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{t('cookbook.page')}</label>
            <input
              type="number"
              value={editPageNumber}
              onChange={(e) => setEditPageNumber(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Kategorien</label>
            <CategoryTagSelect selected={editCategoryTags} onChange={setEditCategoryTags} />
          </div>

          {/* Servings + Prep time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('recipes.servings')}</label>
              <input
                type="number"
                min="1"
                value={editBaseServings}
                onChange={(e) => setEditBaseServings(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Zubereitungszeit (Min.)</label>
              <input
                type="number"
                value={editPrepTime}
                onChange={(e) => setEditPrepTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Calories + Macros */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Kalorien (kcal)</label>
              <input
                type="number"
                value={editCalories}
                onChange={(e) => setEditCalories(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Protein (g)</label>
              <input
                type="text"
                inputMode="decimal"
                value={editProteinG}
                onChange={(e) => setEditProteinG(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Kohlenhydrate (g)</label>
              <input
                type="text"
                inputMode="decimal"
                value={editCarbsG}
                onChange={(e) => setEditCarbsG(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Fett (g)</label>
              <input
                type="text"
                inputMode="decimal"
                value={editFatG}
                onChange={(e) => setEditFatG(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{t('recipes.ingredients')}</label>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1 text-xs text-orange-500 font-medium"
              >
                <Plus size={14} /> {t('general.add')}
              </button>
            </div>
            <div className="space-y-2">
              {editIngredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editIngredientAmounts[i] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setEditIngredientAmounts(editIngredientAmounts.map((a, j) => j === i ? val : a))
                      updateIngredient(i, { amount: parseDecimal(val) })
                    }}
                    placeholder="Menge"
                    className="w-16 px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(i, { unit: e.target.value })}
                    placeholder="Einheit"
                    className="w-14 px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, { name: e.target.value })}
                    placeholder="Zutat"
                    className="flex-1 px-2 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <select
                    value={ing.category}
                    onChange={(e) => updateIngredient(i, { category: e.target.value as IngredientCategory })}
                    className="w-20 px-1 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {INGREDIENT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="p-2 text-gray-300 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{t('recipes.steps')}</label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 text-xs text-orange-500 font-medium"
              >
                <Plus size={14} /> {t('general.add')}
              </button>
            </div>
            <div className="space-y-2">
              {editSteps.map((s, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0 mt-1">
                    {s.step_number}
                  </span>
                  <textarea
                    value={s.instruction}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder="Anweisung..."
                    rows={2}
                    className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="p-2 text-gray-300 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* View mode */
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
      )}
    </div>
  )
}
