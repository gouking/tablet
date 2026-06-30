import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { statsAPI, tabletsAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

const TYPE_LABEL = { REBIRTH: '往生牌位', BLESSING: '祈福牌位', SALVATION: '超度牌位', DISASTER: '消災牌位' }
const TYPE_COLOR = { REBIRTH: 'bg-purple-100 text-purple-700', BLESSING: 'bg-amber-100 text-amber-700', SALVATION: 'bg-blue-100 text-blue-700', DISASTER: 'bg-green-100 text-green-700' }

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    statsAPI.get().then(r => setStats(r.data))
    tabletsAPI.list({ limit: 5 }).then(r => setRecent(r.data.tablets))
  }, [])

  const statCards = stats ? [
    { label: '牌位總數', value: stats.total, sub: '全部狀態' },
    { label: '本月新增', value: stats.thisMonth, sub: '本月登記' },
    { label: '本月打印', value: stats.recentPrints, sub: '打印次數' },
    { label: '即將到期', value: stats.expiringSoon, sub: '30 天內', warn: stats.expiringSoon > 0 },
  ] : []

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">總覽</h1>
        <p className="text-sm text-gray-500 mt-0.5">歡迎回來，{user?.name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats ? statCards.map(({ label, value, sub, warn }) => (
          <div key={label} className={`card ${warn ? 'border-orange-200 bg-orange-50' : ''}`}>
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-3xl font-semibold ${warn ? 'text-orange-600' : 'text-gray-900'}`}>{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        )) : [1,2,3,4].map(i => (
          <div key={i} className="card animate-pulse"><div className="h-12 bg-gray-100 rounded" /></div>
        ))}
      </div>

      {/* Type breakdown */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(TYPE_LABEL).map(([k, label]) => (
            <div key={k} className="card flex items-center gap-3">
              <span className={`badge ${TYPE_COLOR[k]}`}>{label}</span>
              <span className="text-lg font-semibold text-gray-700 ml-auto">{stats.byType[k] || 0}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent tablets */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-gray-900">最近登記</h2>
          <Link to="/tablets" className="text-sm text-amber-700 hover:underline">查看全部</Link>
        </div>
        <div className="space-y-2">
          {recent.map(t => (
            <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-medium">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.family || '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${TYPE_COLOR[t.type]}`}>{TYPE_LABEL[t.type]}</span>
                <Link to={`/tablets/${t.id}/edit`}
                  className="text-xs text-gray-400 hover:text-amber-700 px-2 py-1 rounded hover:bg-amber-50">
                  編輯
                </Link>
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">尚無牌位記錄</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mt-4">
        <Link to="/tablets/new" className="btn-primary">+ 登記新牌位</Link>
        <Link to="/stats" className="btn-secondary">查看報表</Link>
      </div>
    </div>
  )
}
