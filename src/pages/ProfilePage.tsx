import { t } from '../i18n'
import { SettingsForm } from '../components/settings/SettingsForm'

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-4 h-14 flex items-center">
        <h1 className="text-xl font-bold text-gray-800">{t('settings.title')}</h1>
      </div>
      <div className="px-4 py-4">
        <SettingsForm />
      </div>
    </div>
  )
}
