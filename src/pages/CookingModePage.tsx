import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { X, Loader2 } from 'lucide-react'
import { t } from '../i18n'
import { getRecipe } from '../api/recipes'
import { completeMealPlan } from '../api/mealPlans'
import { convertServings } from '../lib/servingMath'
import { useWakeLock } from '../hooks/useWakeLock'
import { CookingOverview } from '../components/cooking/CookingOverview'
import { IngredientChecklist } from '../components/cooking/IngredientChecklist'
import { StepByStep } from '../components/cooking/StepByStep'
import { CookingDone } from '../components/cooking/CookingDone'
import type { Recipe } from '../lib/types'

type CookingPhase = 'overview' | 'ingredients' | 'steps' | 'done'

export function CookingModePage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('plan')
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<CookingPhase>('overview')
  const [servings, setServings] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)

  useWakeLock()

  useEffect(() => {
    if (!id) return
    getRecipe(id)
      .then((r) => {
        setRecipe(r)
        setServings(r.base_servings)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  function handleClose() {
    if (planId) {
      navigate('/today')
    } else if (recipe) {
      navigate(`/recipes/${recipe.id}`)
    } else {
      navigate('/recipes')
    }
  }

  async function handleMarkComplete() {
    if (planId) {
      try {
        await completeMealPlan(planId)
      } catch (err) {
        console.error(err)
      }
    }
    navigate('/today')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">{t('general.error')}</p>
      </div>
    )
  }

  const adjustedIngredients = convertServings(recipe.ingredients, recipe.base_servings, servings)

  return (
    <div className="min-h-screen bg-white text-[18px]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-800 truncate pr-4">
          {t('cooking.title')}
        </h1>
        <button onClick={handleClose} className="p-2 -mr-2 text-gray-500">
          <X size={20} />
        </button>
      </div>

      {/* Phase content */}
      {phase === 'overview' && (
        <CookingOverview
          recipe={recipe}
          servings={servings}
          onServingsChange={setServings}
          onStart={() => setPhase('ingredients')}
        />
      )}

      {phase === 'ingredients' && (
        <IngredientChecklist
          ingredients={adjustedIngredients}
          onNext={() => { setCurrentStep(0); setPhase('steps') }}
        />
      )}

      {phase === 'steps' && (
        <StepByStep
          steps={recipe.steps}
          currentStep={currentStep}
          onPrevious={() => {
            if (currentStep === 0) setPhase('ingredients')
            else setCurrentStep(currentStep - 1)
          }}
          onNext={() => {
            if (currentStep >= recipe.steps.length - 1) setPhase('done')
            else setCurrentStep(currentStep + 1)
          }}
        />
      )}

      {phase === 'done' && (
        <CookingDone
          hasMealPlan={!!planId}
          onMarkComplete={handleMarkComplete}
          onBack={handleClose}
        />
      )}
    </div>
  )
}
