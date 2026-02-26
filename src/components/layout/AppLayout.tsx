import { Outlet, useLocation } from 'react-router-dom'
import { TabBar } from './TabBar'

const HIDE_TAB_BAR_ROUTES = ['/recipes/add']

export function AppLayout() {
  const location = useLocation()
  const hideTabBar = HIDE_TAB_BAR_ROUTES.some((r) => location.pathname.startsWith(r))

  return (
    <div className="min-h-screen bg-gray-50">
      <main className={hideTabBar ? '' : 'pb-20'}>
        <Outlet />
      </main>
      {!hideTabBar && <TabBar />}
    </div>
  )
}
