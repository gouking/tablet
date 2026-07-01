import { useEffect, useState } from 'react'
import { printAPI } from '../utils/api'

const TYPE_LABEL = { REBIRTH: '往生牌位', BLESSING: '祈福牌位', SALVATION: '超度牌位', DISASTER: '消災牌位' }

export default function PrintHistoryPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    printAPI.jobs().then(r => setJobs(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-5">打印記錄</h1>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">牌位姓名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">類型</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">份數</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">打印機</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">時間</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">載入中…</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">尚無打印記錄</td></tr>
            ) : jobs.map(j => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{j.tablet?.name}</td>
                <td className="px-4 py-3 text-gray-500">{TYPE_LABEL[j.tablet?.type] || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{j.copies} 份</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{j.printer || '預設'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{j.createdAt?.replace('T', ' ').slice(0, 16)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
