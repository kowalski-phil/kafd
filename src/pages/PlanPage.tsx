import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import type { MealPlanWithRecipe, UserSettings } from '../lib/types'
import { getUserSettings } from '../api/userSettings'
import { getMealPlansForDateRange, upsertMealPlans, updateMealPlan, completeMealPlan, markFreeMeal } from '../api/mealPlans'
import { getRecipes } from '../api/recipes'
import { generateMealPlan } from '../lib/mealPlanGenerator'
import { getWeekStart, getWeekDates, toDateString, formatDateRange, offsetWeek } from '../lib/dateUtils'
import { WeekView } from '../components/plan/WeekView'
import { SwapMealModal } from '../components/plan/SwapMealModal'

export function PlanPage() {
  const navigate = useNavigate()
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [plans, setPlans] = useState<MealPlanWithRecipe[]>([])
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MealPlanWithRecipe | null>(null)
  const [freeMealTarget, setFreeMealTarget] = useState<MealPlanWithRecipe | null>(null)
  const [freeMealCal, setFreeMealCal] = useState('')
  const [freeMealNote, setFreeMealNote] = useState('')

  const weekDates = getWeekDates(weekStart)
  const startStr = toDateString(weekDates[0])
  const endStr = toDateString(weekDates[6])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p] = await Promise.all([
        getUserSettings(),
        getMealPlansForDateRange(startStr, endStr),
      ])
      setSettings(s)
      setPlans(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [startStr, endStr])

  useEffect(() => { loadData() }, [loadData])

  async function handleGenerate() {
    if (!settings) return
    setGenerating(true)
    try {
      const recipes = await getRecipes()
      const completedPlans = plans.filter((p) => p.is_completed)
      const generated = generateMealPlan({
        recipes,
        settings,
        dates: weekDates,
        existingCompleted: completedPlans,
      })
      await upsertMealPlans(generated)
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSwap(plan: MealPlanWithRecipe, recipeId: string) {
    try {
      await updateMealPlan(plan.id, { recipe_id: recipeId })
      setSelectedPlan(null)
      await loadData()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleComplete(plan: MealPlanWithRecipe) {
    try {
      await completeMealPlan(plan.id)
      setSelectedPlan(null)
      await loadData()
    } catch (err) {
      console.error(err)
    }
  }

  function handleFreeMealStart(plan: MealPlanWithRecipe) {
    setSelectedPlan(null)
    setFreeMealTarget(plan)
    setFreeMealCal('')
    setFreeMealNote('')
  }

  async function handleFreeMealSave() {
    if (!freeMealTarget) return
    try {
      await markFreeMeal(freeMealTarget.id, Number(freeMealCal) || 0, freeMealNote)
      setFreeMealTarget(null)
      await loadData()
    } catch (err) {
      console.error(err)
    }
  }

  function handleCook(plan: MealPlanWithRecipe) {
    if (plan.recipe_id) {
      navigate(`/cook/${plan.recipe_id}?plan=${plan.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Settings size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">{t('plan.noSettings')}</p>
        <button
          onClick={() => navigate('/profile')}
          className="px-6 py-2 bg-orange-500 text-white rounded-xl font-medium text-sm"
        >
          {t('plan.goToSettings')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <button onClick={() => setWeekStart(offsetWeek(weekStart, -1))} className="p-2 -ml-2">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-sm font-semibold text-gray-700">
          {formatDateRange(weekDates[0], weekDates[6])}
        </h1>
        <button onClick={() => setWeekStart(offsetWeek(weekStart, 1))} className="p-2 -mr-2">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Generate / Regenerate button */}
      <div className="px-4 py-3">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t('plan.generating')}
            </>
          ) : plans.length > 0 ? (
            <>
              <RefreshCw size={16} />
              {t('plan.regenerateWeek')}
            </>
          ) : (
            t('plan.generate')
          )}
        </button>
      </div>

      {/* Week View */}
      {plans.length > 0 ? (
        <WeekView weekStart={weekStart} plans={plans} onTapMeal={setSelectedPlan} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <p className="text-gray-400 text-sm">{t('plan.empty')}</p>
        </div>
      )}

      {/* Swap / Action Modal */}
      {selectedPlan && settings && (
        <SwapMealModal
          plan={selectedPlan}
          settings={settings}
          onSwap={handleSwap}
          onComplete={handleComplete}
          onFreeMeal={handleFreeMealStart}
          onCook={handleCook}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      {/* Free Meal Modal */}
      {freeMealTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setFreeMealTarget(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('today.freeMealTitle')}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {t('today.freeMealCalories')}
                </label>
                <input
                  type="number"
                  value={freeMealCal}
                  onChange={(e) => setFreeMealCal(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="kcal"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {t('today.freeMealNote')}
                </label>
                <input
                  type="text"
                  value={freeMealNote}
                  onChange={(e) => setFreeMealNote(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setFreeMealTarget(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm"
                >
                  {t('general.cancel')}
                </button>
                <button
                  onClick={handleFreeMealSave}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-medium text-sm"
                >
                  {t('general.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
