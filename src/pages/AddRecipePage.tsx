import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X, Plus, Trash2 } from 'lucide-react'
import { t } from '../i18n'
import { CameraCapture } from '../components/capture/CameraCapture'
import { CookbookSelect } from '../components/cookbooks/CookbookSelect'
import { CategoryTagSelect } from '../components/recipes/CategoryTagSelect'
import { resizeImage } from '../lib/imageResize'
import { parseRecipePhoto } from '../api/claude'
import { uploadRecipePhoto } from '../api/storage'
import { createRecipe } from '../api/recipes'
import { INGREDIENT_CATEGORIES } from '../lib/constants'
import type { ClaudeParseResult, Ingredient, RecipeStep, CategoryTag, IngredientCategory } from '../lib/types'

/** Normalize German decimal comma to dot and parse as float */
function parseDecimal(value: string): number {
  return parseFloat(value.replace(',', '.')) || 0
}

type Step = 'capture' | 'parsing' | 'edit' | 'saving'

export function AddRecipePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('capture')
  const [error, setError] = useState<string | null>(null)

  // Photo data
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)

  // Parsed / editable data
  const [title, setTitle] = useState('')
  const [cookbookId, setCookbookId] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState<string>('')
  const [categoryTags, setCategoryTags] = useState<CategoryTag[]>([])
  const [baseServings, setBaseServings] = useState<string>('1')
  const [prepTime, setPrepTime] = useState<string>('')
  const [calories, setCalories] = useState<string>('')
  const [proteinG, setProteinG] = useState<string>('')
  const [carbsG, setCarbsG] = useState<string>('')
  const [fatG, setFatG] = useState<string>('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  // Raw string amounts for decimal input (parallel to ingredients array)
  const [ingredientAmounts, setIngredientAmounts] = useState<string[]>([])
  const [steps, setSteps] = useState<RecipeStep[]>([])

  async function handleCapture(file: File) {
    setPhotoFile(file)
    setPhotoPreviewUrl(URL.createObjectURL(file))
    setStep('parsing')
    setError(null)

    try {
      const { base64, mimeType } = await resizeImage(file)
      const result = await parseRecipePhoto(base64, mimeType)
      applyParseResult(result)
      setStep('edit')
    } catch (err) {
      console.error('Parse error:', err)
      setError(err instanceof Error ? err.message : t('capture.parseError'))
      setStep('edit')
    }
  }

  function applyParseResult(result: ClaudeParseResult) {
    setTitle(result.title || '')
    const ings = result.ingredients || []
    setIngredients(ings)
    setIngredientAmounts(ings.map((ing) => ing.amount ? String(ing.amount) : ''))
    setSteps(result.steps || [])
    if (result.calories != null) setCalories(result.calories.toString())
    if (result.protein_g != null) setProteinG(result.protein_g.toString())
    if (result.carbs_g != null) setCarbsG(result.carbs_g.toString())
    if (result.fat_g != null) setFatG(result.fat_g.toString())
    if (result.prep_time_minutes != null) setPrepTime(result.prep_time_minutes.toString())
    if (result.base_servings != null) setBaseServings(result.base_servings.toString())
  }

  function addIngredient() {
    setIngredients([
      ...ingredients,
      { name: '', amount: 0, unit: 'g', category: 'other' as IngredientCategory },
    ])
    setIngredientAmounts([...ingredientAmounts, ''])
  }

  function updateIngredient(index: number, updates: Partial<Ingredient>) {
    setIngredients(ingredients.map((ing, i) => (i === index ? { ...ing, ...updates } : ing)))
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index))
    setIngredientAmounts(ingredientAmounts.filter((_, i) => i !== index))
  }

  function addStep() {
    setSteps([
      ...steps,
      { step_number: steps.length + 1, instruction: '' },
    ])
  }

  function updateStep(index: number, instruction: string) {
    setSteps(steps.map((s, i) => (i === index ? { ...s, instruction } : s)))
  }

  function removeStep(index: number) {
    setSteps(
      steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, step_number: i + 1 }))
    )
  }

  async function handleSave() {
    if (!title.trim()) return
    setStep('saving')

    try {
      let photoUrl: string | null = null
      if (photoFile) {
        photoUrl = await uploadRecipePhoto(photoFile)
      }

      // Normalize ingredient amounts from raw string inputs
      const normalizedIngredients = ingredients.map((ing, i) => ({
        ...ing,
        amount: parseDecimal(ingredientAmounts[i] ?? String(ing.amount)),
      }))

      const recipe = await createRecipe({
        title: title.trim(),
        cookbook_id: cookbookId,
        page_number: pageNumber ? parseInt(pageNumber) : null,
        ingredients: normalizedIngredients,
        steps,
        calories: calories ? parseInt(calories) : null,
        protein_g: proteinG ? parseDecimal(proteinG) : null,
        carbs_g: carbsG ? parseDecimal(carbsG) : null,
        fat_g: fatG ? parseDecimal(fatG) : null,
        prep_time_minutes: prepTime ? parseInt(prepTime) : null,
        base_servings: parseInt(baseServings) || 1,
        category_tags: categoryTags,
        is_favorite: false,
        is_excluded: false,
        photo_url: photoUrl,
      })

      navigate(`/recipes/${recipe.id}`)
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : t('general.error'))
      setStep('edit')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            {step === 'capture' ? (
              <ArrowLeft size={22} className="text-gray-700" />
            ) : (
              <X size={22} className="text-gray-700" />
            )}
          </button>
          <h1 className="font-semibold text-gray-800">{t('capture.title')}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Step: Capture */}
      {step === 'capture' && <CameraCapture onCapture={handleCapture} />}

      {/* Step: Parsing */}
      {step === 'parsing' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
          <p className="text-sm text-gray-500">{t('capture.parsing')}</p>
          {photoPreviewUrl && (
            <img src={photoPreviewUrl} alt="" className="w-32 h-32 rounded-xl object-cover mt-6 opacity-50" />
          )}
        </div>
      )}

      {/* Step: Edit */}
      {(step === 'edit' || step === 'saving') && (
        <div className="px-4 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
          )}

          {photoPreviewUrl && (
            <img src={photoPreviewUrl} alt="" className="w-full h-32 rounded-xl object-cover" />
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Cookbook + Page */}
          <CookbookSelect value={cookbookId} onChange={setCookbookId} />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{t('cookbook.page')}</label>
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Kategorien</label>
            <CategoryTagSelect selected={categoryTags} onChange={setCategoryTags} />
          </div>

          {/* Servings + Prep time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('recipes.servings')}</label>
              <input
                type="number"
                min="1"
                value={baseServings}
                onChange={(e) => setBaseServings(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Zubereitungszeit (Min.)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
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
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Protein (g)</label>
              <input
                type="text"
                inputMode="decimal"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Kohlenhydrate (g)</label>
              <input
                type="text"
                inputMode="decimal"
                value={carbsG}
                onChange={(e) => setCarbsG(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Fett (g)</label>
              <input
                type="text"
                inputMode="decimal"
                value={fatG}
                onChange={(e) => setFatG(e.target.value)}
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
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ingredientAmounts[i] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setIngredientAmounts(ingredientAmounts.map((a, j) => j === i ? val : a))
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
              {steps.map((s, i) => (
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

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!title.trim() || step === 'saving'}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50 active:bg-orange-600 transition-colors"
          >
            {step === 'saving' ? t('capture.saving') : t('capture.save')}
          </button>
        </div>
      )}
    </div>
  )
}
