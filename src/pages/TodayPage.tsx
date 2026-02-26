import { CalendarDays } from 'lucide-react'
import { t } from '../i18n'

export function TodayPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <CalendarDays size={48} className="text-gray-300 mb-4" />
      <h1 className="text-xl font-semibold text-gray-700 mb-2">{t('nav.today')}</h1>
      <p className="text-gray-400 text-sm">{t('today.placeholder')}</p>
    </div>
  )
}
