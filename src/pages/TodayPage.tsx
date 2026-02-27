import { useState, useEffect, useCallback } from 'react'
import { CalendarRange, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import type { MealPlanWithRecipe, UserSettings } from '../lib/types'
import { getUserSettings } from '../api/userSettings'
import { getMealPlansForDate, completeMealPlan, markFreeMeal } from '../api/mealPlans'
import { toDateString } from '../lib/dateUtils'
import { CalorieSummary } from '../components/today/CalorieSummary'
import { MealCard } from '../components/today/MealCard'
import { FreeMealModal } from '../components/today/FreeMealModal'

export function TodayPage() {
  const navigate = useNavigate()
  const today = toDateString(new Date())
  const [plans, setPlans] = useState<MealPlanWithRecipe[]>([])
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [freeMealTarget, setFreeMealTarget] = useState<MealPlanWithRecipe | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p] = await Promise.all([
        getUserSettings(),
        getMealPlansForDate(today),
      ])
      setSettings(s)
      setPlans(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => { loadData() }, [loadData])

  async function handleMarkEaten(plan: MealPlanWithRecipe) {
    try {
      await completeMealPlan(plan.id)
      await loadData()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleFreeMealSave(calories: number, note: string) {
    if (!freeMealTarget) return
    try {
      await markFreeMeal(freeMealTarget.id, calories, note)
      setFreeMealTarget(null)
      await loadData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    )
  }

  // Calculate calorie numbers
  const target = settings?.daily_calorie_target ?? 1800
  const planned = plans.reduce((sum, p) => {
    if (p.is_free_meal && p.free_meal_calories) return sum + p.free_meal_calories
    return sum + (p.recipe?.calories ?? 0)
  }, 0)
  const consumed = plans.filter((p) => p.is_completed).reduce((sum, p) => {
    if (p.is_free_meal && p.free_meal_calories) return sum + p.free_meal_calories
    return sum + (p.recipe?.calories ?? 0)
  }, 0)

  // Format today's date in German
  const todayDate = new Date()
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const dayName = dayNames[todayDate.getDay()]
  const dateStr = `${dayName}, ${todayDate.getDate()}.${todayDate.getMonth() + 1}.`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-4 h-14 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{t('today.title')}</h1>
          <p className="text-xs text-gray-400 -mt-0.5">{dateStr}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Calorie Summary */}
        {plans.length > 0 && (
          <CalorieSummary target={target} planned={planned} consumed={consumed} />
        )}

        {/* Meal Cards */}
        {plans.length > 0 ? (
          <div className="space-y-3">
            {plans.map((plan) => (
              <MealCard
                key={plan.id}
                plan={plan}
                onCook={() => {
                  if (plan.recipe_id) navigate(`/cook/${plan.recipe_id}?plan=${plan.id}`)
                }}
                onMarkEaten={() => handleMarkEaten(plan)}
                onFreeMeal={() => setFreeMealTarget(plan)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarRange size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">{t('today.noplan')}</p>
            <button
              onClick={() => navigate('/plan')}
              className="px-6 py-2 bg-orange-500 text-white rounded-xl font-medium text-sm"
            >
              {t('today.goToPlan')}
            </button>
          </div>
        )}
      </div>

      {/* Free Meal Modal */}
      {freeMealTarget && (
        <FreeMealModal
          onSave={handleFreeMealSave}
          onClose={() => setFreeMealTarget(null)}
        />
      )}
    </div>
  )
}
