import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { tabletsAPI, printAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

const TYPE_LABEL = { REBIRTH: '往生牌位', BLESSING: '祈福牌位', SALVATION: '超度牌位', DISASTER: '消災牌位' }
const TYPE_COLOR = { REBIRTH: 'bg-purple-100 text-purple-700', BLESSING: 'bg-amber-100 text-amber-700', SALVATION: 'bg-blue-100 text-blue-700', DISASTER: 'bg-green-100 text-green-700' }
const STATUS_LABEL = { ACTIVE: '有效', EXPIRED: '到期', ARCHIVED: '封存' }
const STATUS_COLOR = { ACTIVE: 'bg-green-100 text-green-700', EXPIRED: 'bg-red-100 text-red-700', ARCHIVED: 'bg-gray-100 text-gray-500' }

export default function TabletListPage() {
  const { user } = useAuth()
  const [tablets, setTablets] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    tabletsAPI.list({ search, type: filterType || undefined, page, limit: 20 })
      .then(r => { setTablets(r.data.tablets); setTotal(r.data.total); setPages(r.data.pages) })
      .finally(() => setLoading(false))
  }, [search, filterType, page])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('確定刪除此牌位？')) return
    try {
      await tabletsAPI.delete(id)
      toast.success('已刪除')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || '刪除失敗')
    }
  }

  const handlePrint = (id) => window.open(printAPI.pdfUrl(id), '_blank')

  const handleBatchPrint = async () => {
    if (!selected.size) return
    try {
      const res = await printAPI.batch([...selected])
      const url = URL.createObjectURL(res.data)
      window.open(url)
      toast.success(`批次打印 ${selected.size} 張`)
      setSelected(new Set())
    } catch { toast.error('批次打印失敗') }
  }

  const toggleSelect = (id) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">牌位管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">共 {total} 筆</p>
        </div>
        <Link to="/tablets/new" className="btn-primary">+ 登記牌位</Link>
      </div>

      {/* Search & filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input className="input max-w-xs" placeholder="搜尋姓名…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <select className="input w-36"
          value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}>
          <option value="">全部類型</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {selected.size > 0 && (
          <button onClick={handleBatchPrint} className="btn-secondary flex items-center gap-1.5">
            ▤ 批次打印 ({selected.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-10 px-4 py-3"><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(tablets.map(t => t.id)) : new Set())} /></th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">姓名</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">類型</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">供奉期間</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">狀態</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">建立日期</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">載入中…</td></tr>
            ) : tablets.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">無符合的牌位</td></tr>
            ) : tablets.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.family || '—'}</div>
                </td>
                <td className="px-4 py-3"><span className={`badge ${TYPE_COLOR[t.type]}`}>{TYPE_LABEL[t.type]}</span></td>
                <td className="px-4 py-3 text-gray-600">{t.duration}</td>
                <td className="px-4 py-3"><span className={`badge ${STATUS_COLOR[t.status]}`}>{STATUS_LABEL[t.status]}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{t.createdAt?.split('T')[0]}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handlePrint(t.id)} className="px-2 py-1 text-xs text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded">列印</button>
                    <Link to={`/tablets/${t.id}/edit`} className="px-2 py-1 text-xs text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded">編輯</Link>
                    {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                      <button onClick={() => handleDelete(t.id)} className="px-2 py-1 text-xs text-gray-500 hover:text-red-700 hover:bg-red-50 rounded">刪除</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">← 上一頁</button>
          <span className="text-sm text-gray-500">{page} / {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">下一頁 →</button>
        </div>
      )}
    </div>
  )
}
