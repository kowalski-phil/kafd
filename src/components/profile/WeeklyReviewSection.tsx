import { useState, useEffect, useCallback } from 'react'
import { t } from '../../i18n'
import { getMealPlansForDateRange } from '../../api/mealPlans'
import { getWeightLog } from '../../api/weightLog'
import { getUserSettings } from '../../api/userSettings'
import { getWeekStart, getWeekDates, toDateString, formatDateRange, offsetWeek } from '../../lib/dateUtils'
import { aggregateDailyCalories } from '../../lib/calorieHistory'
import { calculateStreak } from '../../lib/streakCalculator'
import { subDays } from '../../lib/dateUtils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function WeeklyReviewSection() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [stats, setStats] = useState<{
    daysInBudget: number
    recipesCooked: number
    avgCalories: number
    weightChange: number | null
    streak: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const weekDates = getWeekDates(weekStart)
  const startStr = toDateString(weekDates[0])
  const endStr = toDateString(weekDates[6])

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const streakStart = toDateString(subDays(new Date(), 90))
      const [plans, settings, weightEntries, allRecentPlans] = await Promise.all([
        getMealPlansForDateRange(startStr, endStr),
        getUserSettings(),
        getWeightLog(90),
        getMealPlansForDateRange(streakStart, toDateString(new Date())),
      ])

      const target = settings?.daily_calorie_target ?? 1800
      const dailySummaries = aggregateDailyCalories(plans, target)

      // Days in budget
      const daysWithData = dailySummaries.filter(d => d.consumed > 0)
      const daysInBudget = daysWithData.filter(d => d.consumed <= d.target).length

      // Recipes cooked (completed, non-free meals)
      const recipesCooked = plans.filter(p => p.is_completed && !p.is_free_meal).length

      // Average calories
      const avgCalories = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((s, d) => s + d.consumed, 0) / daysWithData.length)
        : 0

      // Weight change: first and last entry within the week
      const weekWeights = weightEntries
        .filter(e => e.date >= startStr && e.date <= endStr)
        .sort((a, b) => a.date.localeCompare(b.date))
      const weightChange = weekWeights.length >= 2
        ? Math.round((weekWeights[weekWeights.length - 1].weight_kg - weekWeights[0].weight_kg) * 10) / 10
        : null

      // Streak
      const streak = calculateStreak(allRecentPlans)

      setStats({ daysInBudget, recipesCooked, avgCalories, weightChange, streak })
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [startStr, endStr])

  useEffect(() => { loadStats() }, [loadStats])

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">{t('review.title')}</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setWeekStart(offsetWeek(weekStart, -1))} className="p-1">
            <ChevronLeft size={16} className="text-gray-400" />
          </button>
          <span className="text-xs text-gray-500">{formatDateRange(weekDates[0], weekDates[6])}</span>
          <button onClick={() => setWeekStart(offsetWeek(weekStart, 1))} className="p-1">
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
          {t('general.loading')}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            value={`${stats.daysInBudget}/7`}
            label={t('review.daysInBudget')}
            color="text-green-500"
          />
          <StatCard
            value={String(stats.recipesCooked)}
            label={t('review.recipesCooked')}
            color="text-orange-500"
          />
          <StatCard
            value={stats.avgCalories > 0 ? `${stats.avgCalories}` : '–'}
            label={t('review.avgCalories')}
            color="text-gray-800"
          />
          <StatCard
            value={stats.weightChange !== null
              ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange} kg`
              : '–'}
            label={t('review.weightChange')}
            color={stats.weightChange !== null && stats.weightChange < 0 ? 'text-green-500' : stats.weightChange !== null && stats.weightChange > 0 ? 'text-red-500' : 'text-gray-400'}
          />
          <div className="col-span-2 flex items-center justify-center gap-2 py-1">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-semibold text-orange-600">{stats.streak}</span>
            <span className="text-xs text-gray-400">{t('review.streak')}</span>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 text-sm py-4">
          {t('review.noData')}
        </div>
      )}
    </div>
  )
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-400 uppercase">{label}</p>
    </div>
  )
}
