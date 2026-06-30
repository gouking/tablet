import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { statsAPI } from '../utils/api'

const TYPE_LABEL = { REBIRTH: '往生牌位', BLESSING: '祈福牌位', SALVATION: '超度牌位', DISASTER: '消災牌位' }
const TYPE_COLORS = { REBIRTH: '#7c3aed', BLESSING: '#b45309', SALVATION: '#1d4ed8', DISASTER: '#15803d' }

export default function StatsPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => { statsAPI.get().then(r => setStats(r.data)) }, [])

  if (!stats) return <div className="p-6 text-gray-400">載入中…</div>

  const typeData = Object.entries(TYPE_LABEL).map(([k, label]) => ({
    name: label, value: stats.byType[k] || 0, color: TYPE_COLORS[k],
  }))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">統計報表</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '牌位總數', value: stats.total },
          { label: '本月新增', value: stats.thisMonth },
          { label: '今年累計', value: stats.thisYear },
          { label: '本月打印', value: stats.recentPrints },
        ].map(({ label, value }) => (
          <div key={label} className="card">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-3xl font-semibold text-gray-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="card">
          <h2 className="text-sm font-medium text-gray-700 mb-4">近 6 個月登記趨勢</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyTrend} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v) => [v, '牌位']} />
              <Bar dataKey="value" fill="#b45309" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Type breakdown */}
        <div className="card">
          <h2 className="text-sm font-medium text-gray-700 mb-4">牌位類型分布</h2>
          <div className="space-y-3">
            {typeData.map(({ name, value, color }) => {
              const pct = stats.total ? Math.round((value / stats.total) * 100) : 0
              return (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{name}</span>
                    <span className="font-medium text-gray-900">{value} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>

          {stats.expiringSoon > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
              ⚠ 有 {stats.expiringSoon} 張牌位將在 30 天內到期
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
