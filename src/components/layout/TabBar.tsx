import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, BookOpen, CalendarRange, ShoppingCart, Settings } from 'lucide-react'
import { t } from '../../i18n'

const tabs = [
  { path: '/today', label: t('nav.today'), icon: CalendarDays },
  { path: '/recipes', label: t('nav.recipes'), icon: BookOpen },
  { path: '/plan', label: t('nav.plan'), icon: CalendarRange },
  { path: '/shopping', label: t('nav.shopping'), icon: ShoppingCart },
  { path: '/profile', label: t('nav.profile'), icon: Settings },
]

export function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path)
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
