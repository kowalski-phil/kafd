import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { t } from '../../i18n'
import { getMealPlansForDateRange } from '../../api/mealPlans'
import { getUserSettings } from '../../api/userSettings'
import { toDateString, subDays, formatDayMonth } from '../../lib/dateUtils'
import { aggregateDailyCalories } from '../../lib/calorieHistory'

type Period = 7 | 14 | 30

export function CalorieHistorySection() {
  const [period, setPeriod] = useState<Period>(7)
  const [chartData, setChartData] = useState<{ date: string, label: string, consumed: number, target: number }[]>([])
  const [target, setTarget] = useState(1800)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const today = new Date()
      const start = subDays(today, period - 1)
      const [plans, settings] = await Promise.all([
        getMealPlansForDateRange(toDateString(start), toDateString(today)),
        getUserSettings(),
      ])
      const dailyTarget = settings?.daily_calorie_target ?? 1800
      setTarget(dailyTarget)
      const summaries = aggregateDailyCalories(plans, dailyTarget)

      // Fill in all days in range (including days with 0 consumed)
      const allDays: typeof chartData = []
      for (let i = 0; i < period; i++) {
        const d = subDays(today, period - 1 - i)
        const dateStr = toDateString(d)
        const found = summaries.find(s => s.date === dateStr)
        allDays.push({
          date: dateStr,
          label: formatDayMonth(d),
          consumed: found?.consumed ?? 0,
          target: dailyTarget,
        })
      }
      setChartData(allDays)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { loadData() }, [loadData])

  // Stats
  const daysWithData = chartData.filter(d => d.consumed > 0)
  const avgConsumed = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.consumed, 0) / daysWithData.length)
    : 0
  const daysUnder = daysWithData.filter(d => d.consumed <= d.target).length
  const daysOver = daysWithData.filter(d => d.consumed > d.target).length

  const periods: Period[] = [7, 14, 30]

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">{t('calories.title')}</h2>
        <div className="flex gap-1">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {p} {t('calories.days')}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          {t('general.loading')}
        </div>
      ) : (
        <div className="h-48 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={period <= 7 ? 0 : period <= 14 ? 1 : 3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                formatter={(value: number | undefined) => [`${value ?? 0} kcal`, t('calories.consumed')]}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <ReferenceLine
                y={target}
                stroke="#f97316"
                strokeDasharray="4 4"
                label={{ value: `${t('calories.target')} ${target}`, fontSize: 10, fill: '#f97316', position: 'right' }}
              />
              <Bar dataKey="consumed" radius={[4, 4, 0, 0]} maxBarSize={24}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.consumed === 0 ? '#e5e7eb' : entry.consumed <= target ? '#22c55e' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary stats */}
      {daysWithData.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-gray-800">{avgConsumed}</p>
            <p className="text-[10px] text-gray-400 uppercase">{t('calories.avgPerDay')}</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-500">{daysUnder}</p>
            <p className="text-[10px] text-gray-400 uppercase">{t('calories.daysUnder')}</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-500">{daysOver}</p>
            <p className="text-[10px] text-gray-400 uppercase">{t('calories.daysOver')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
