import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts'
import { Plus, Trash2 } from 'lucide-react'
import { t } from '../../i18n'
import { getWeightLog, logWeight, deleteWeightEntry } from '../../api/weightLog'
import { toDateString, formatDayMonth } from '../../lib/dateUtils'
import type { WeightLogEntry } from '../../lib/types'

interface WeightLogSectionProps {
  startWeight: number | null
  targetWeight: number | null
}

export function WeightLogSection({ startWeight, targetWeight }: WeightLogSectionProps) {
  const [entries, setEntries] = useState<WeightLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [weightInput, setWeightInput] = useState('')
  const [dateInput, setDateInput] = useState(toDateString(new Date()))
  const [saving, setSaving] = useState(false)

  const loadEntries = useCallback(async () => {
    try {
      const data = await getWeightLog(90)
      setEntries(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadEntries() }, [loadEntries])

  const handleSave = async () => {
    const weight = parseFloat(weightInput)
    if (isNaN(weight) || weight < 30 || weight > 300) return
    setSaving(true)
    try {
      await logWeight(dateInput, weight)
      setWeightInput('')
      await loadEntries()
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteWeightEntry(id)
      await loadEntries()
    } catch {
      // silently fail
    }
  }

  // Chart data: ascending order, last 30 entries
  const chartData = [...entries]
    .reverse()
    .slice(-30)
    .map(e => ({
      date: formatDayMonth(new Date(e.date + 'T00:00:00')),
      weight: e.weight_kg,
    }))

  // Y axis domain
  const weights = chartData.map(d => d.weight)
  const allWeights = [...weights]
  if (startWeight) allWeights.push(startWeight)
  if (targetWeight) allWeights.push(targetWeight)
  const yMin = allWeights.length > 0 ? Math.floor(Math.min(...allWeights) - 1) : 60
  const yMax = allWeights.length > 0 ? Math.ceil(Math.max(...allWeights) + 1) : 120

  // Recent entries for list (newest 5)
  const recentEntries = entries.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-3">{t('weight.title')}</h2>

      {/* Entry form */}
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={dateInput}
          onChange={e => setDateInput(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-xl text-sm"
        />
        <input
          type="number"
          step="0.1"
          min="30"
          max="300"
          value={weightInput}
          onChange={e => setWeightInput(e.target.value)}
          placeholder="kg"
          className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm"
        />
        <button
          onClick={handleSave}
          disabled={saving || !weightInput}
          className="px-3 py-2 bg-orange-500 text-white rounded-xl disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          {t('general.loading')}
        </div>
      ) : chartData.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          {t('weight.noData')}
        </div>
      ) : (
        <div className="h-48 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                formatter={(value: number | undefined) => [`${value ?? 0} kg`, t('weight.weight')]}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              {targetWeight && (
                <ReferenceLine
                  y={targetWeight}
                  stroke="#22c55e"
                  strokeDasharray="4 4"
                  label={{ value: t('weight.target'), fontSize: 10, fill: '#22c55e', position: 'right' }}
                />
              )}
              {startWeight && (
                <ReferenceLine
                  y={startWeight}
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  label={{ value: t('weight.start'), fontSize: 10, fill: '#9ca3af', position: 'right' }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-gray-400 uppercase font-medium">{t('weight.recent')}</p>
          {recentEntries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600">
                {formatDayMonth(new Date(entry.date + 'T00:00:00'))}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                  {entry.weight_kg} kg
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-1 text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
