import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const nav = [
  { to: '/',              icon: '⊞', label: '總覽' },
  { to: '/tablets',       icon: '☰', label: '牌位管理' },
  { to: '/tablets/new',   icon: '+', label: '登記牌位' },
  { to: '/stats',         icon: '▦', label: '統計報表' },
  { to: '/print-history', icon: '▤', label: '打印記錄' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">位</div>
            <div>
              <div className="text-sm font-semibold text-gray-900">牌位打印系統</div>
              <div className="text-xs text-gray-400">{user?.temple?.name}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-amber-50 text-amber-800 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }>
              <span className="w-4 text-center opacity-60">{icon}</span>
              {label}
            </NavLink>
          ))}
          {user?.role === 'ADMIN' && (
            <NavLink to="/register"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-amber-50 text-amber-800 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }>
              <span className="w-4 text-center opacity-60">✦</span>
              帳號管理
            </NavLink>
          )}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600" title="登出">✕</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
