import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { t } from '../../i18n'
import { getUserSettings, upsertUserSettings } from '../../api/userSettings'
import { DEFAULT_USER_SETTINGS } from '../../lib/constants'
import { PantryStaplesInput } from './PantryStaplesInput'

export function SettingsForm() {
  const [form, setForm] = useState(DEFAULT_USER_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUserSettings()
      .then((data) => {
        if (data) {
          setForm({
            daily_calorie_target: data.daily_calorie_target,
            meals_per_day: data.meals_per_day,
            time_budget_breakfast: data.time_budget_breakfast,
            time_budget_lunch: data.time_budget_lunch,
            time_budget_dinner: data.time_budget_dinner,
            time_budget_snack: data.time_budget_snack,
            start_weight_kg: data.start_weight_kg,
            target_weight_kg: data.target_weight_kg,
            pantry_staples: data.pantry_staples,
          })
        }
      })
      .catch(() => setError(t('general.error')))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await upsertUserSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError(t('general.error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    )
  }

  const inputClass = 'w-full bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
      )}

      {/* Calorie Target */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          {t('settings.calorieTarget')}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={form.daily_calorie_target}
            onChange={(e) => setForm({ ...form, daily_calorie_target: Number(e.target.value) })}
            className={inputClass}
            min={800}
            max={5000}
            step={50}
          />
          <span className="text-sm text-gray-500 whitespace-nowrap">{t('settings.calorieUnit')}</span>
        </div>
      </div>

      {/* Meals per Day */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {t('settings.mealsPerDay')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm({ ...form, meals_per_day: n })}
              className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                form.meals_per_day === n
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Time Budgets */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {t('settings.timeBudgets')}
        </label>
        <div className="space-y-2">
          {[
            { key: 'time_budget_breakfast' as const, label: t('settings.timeBudgetBreakfast') },
            { key: 'time_budget_lunch' as const, label: t('settings.timeBudgetLunch') },
            { key: 'time_budget_dinner' as const, label: t('settings.timeBudgetDinner') },
            { key: 'time_budget_snack' as const, label: t('settings.timeBudgetSnack') },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-28">{label}</span>
              <input
                type="number"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                className={inputClass}
                min={5}
                max={120}
                step={5}
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">{t('settings.minutes')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t('settings.startWeight')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={form.start_weight_kg ?? ''}
              onChange={(e) => setForm({ ...form, start_weight_kg: e.target.value ? Number(e.target.value) : null })}
              className={inputClass}
              step={0.1}
              placeholder="—"
            />
            <span className="text-sm text-gray-500">{t('settings.weightUnit')}</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            {t('settings.targetWeight')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={form.target_weight_kg ?? ''}
              onChange={(e) => setForm({ ...form, target_weight_kg: e.target.value ? Number(e.target.value) : null })}
              className={inputClass}
              step={0.1}
              placeholder="—"
            />
            <span className="text-sm text-gray-500">{t('settings.weightUnit')}</span>
          </div>
        </div>
      </div>

      {/* Pantry Staples */}
      <PantryStaplesInput
        staples={form.pantry_staples}
        onChange={(pantry_staples) => setForm({ ...form, pantry_staples })}
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : saved ? (
          <>
            <Check size={18} />
            {t('settings.saved')}
          </>
        ) : (
          t('general.save')
        )}
      </button>
    </div>
  )
}
