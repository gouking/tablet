import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { tabletsAPI, printAPI } from '../utils/api'
import TabletPreview from '../components/TabletPreview'

const TYPES = [
  { value: 'REBIRTH',   label: '往生牌位' },
  { value: 'BLESSING',  label: '祈福牌位' },
  { value: 'SALVATION', label: '超度牌位' },
  { value: 'DISASTER',  label: '消災牌位' },
]
const DURATIONS = ['七七四十九日', '一年', '三年', '永久']

const defaultForm = {
  type: 'REBIRTH', name: '', title: '顯', birthYear: '', deathYear: '',
  family: '', duration: '七七四十九日', note: '', endDate: '',
}

export default function TabletFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [copies, setCopies] = useState(1)

  useEffect(() => {
    if (isEdit) {
      tabletsAPI.get(id).then(r => {
        const t = r.data
        setForm({
          type: t.type, name: t.name, title: t.title || '顯',
          birthYear: t.birthYear || '', deathYear: t.deathYear || '',
          family: t.family || '', duration: t.duration,
          note: t.note || '', endDate: t.endDate?.split('T')[0] || '',
        })
      }).catch(() => { toast.error('載入失敗'); navigate('/tablets') })
    }
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await tabletsAPI.update(id, form)
        toast.success('已更新')
      } else {
        const { data } = await tabletsAPI.create(form)
        toast.success('牌位已建立')
        // Auto-open PDF
        window.open(printAPI.pdfUrl(data.id, copies), '_blank')
        navigate('/tablets')
        return
      }
      navigate('/tablets')
    } catch (err) {
      toast.error(err.response?.data?.error || '操作失敗')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (isEdit) window.open(printAPI.pdfUrl(id, copies), '_blank')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← 返回</button>
        <h1 className="text-xl font-semibold text-gray-900">{isEdit ? '編輯牌位' : '登記牌位'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_200px] gap-6">
        <div className="card space-y-4">
          {/* Type */}
          <div>
            <label className="label">牌位類型</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => set('type', value)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    form.type === value
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">稱謂</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="顯 / 先考 / 先妣…" />
            </div>
            <div>
              <label className="label">姓名 <span className="text-red-500">*</span></label>
              <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="如：王大明居士" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">生年</label>
              <input className="input" value={form.birthYear} onChange={e => set('birthYear', e.target.value)} placeholder="民國 50 年" />
            </div>
            <div>
              <label className="label">歿年</label>
              <input className="input" value={form.deathYear} onChange={e => set('deathYear', e.target.value)} placeholder="民國 112 年" />
            </div>
          </div>

          <div>
            <label className="label">供奉期間</label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <button key={d} type="button" onClick={() => set('duration', d)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    form.duration === d ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">到期日（選填）</label>
            <input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={{ width: 'fit-content' }} />
          </div>

          <div>
            <label className="label">陽上款</label>
            <input className="input" value={form.family} onChange={e => set('family', e.target.value)} placeholder="如：子 王小明 等仝叩" />
          </div>

          <div>
            <label className="label">備註</label>
            <textarea className="input h-16 resize-none" value={form.note} onChange={e => set('note', e.target.value)} placeholder="特別法會、祈願事項等…" />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '處理中…' : isEdit ? '儲存' : '建立並打印'}
            </button>
            {isEdit && (
              <button type="button" onClick={handlePrint} className="btn-secondary flex items-center gap-1.5">
                ▤ 列印 PDF
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-gray-500">份數</label>
              <input type="number" min={1} max={99} value={copies} onChange={e => setCopies(+e.target.value)}
                className="input w-16 text-center" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <TabletPreview data={form} />
        </div>
      </form>
    </div>
  )
}
