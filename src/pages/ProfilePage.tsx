import { useState, useEffect } from 'react'
import { t } from '../i18n'
import { getUserSettings } from '../api/userSettings'
import { WeightLogSection } from '../components/profile/WeightLogSection'
import { CalorieHistorySection } from '../components/profile/CalorieHistorySection'
import { WeeklyReviewSection } from '../components/profile/WeeklyReviewSection'
import { SettingsForm } from '../components/settings/SettingsForm'

export function ProfilePage() {
  const [startWeight, setStartWeight] = useState<number | null>(null)
  const [targetWeight, setTargetWeight] = useState<number | null>(null)

  useEffect(() => {
    getUserSettings().then(settings => {
      if (settings) {
        setStartWeight(settings.start_weight_kg)
        setTargetWeight(settings.target_weight_kg)
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-4 h-14 flex items-center">
        <h1 className="text-xl font-bold text-gray-800">{t('profile.title')}</h1>
      </div>
      <div className="px-4 py-4 space-y-4 pb-24">
        <WeightLogSection startWeight={startWeight} targetWeight={targetWeight} />
        <CalorieHistorySection />
        <WeeklyReviewSection />
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3">{t('settings.title')}</h2>
          <SettingsForm />
        </div>
      </div>
    </div>
  )
}
