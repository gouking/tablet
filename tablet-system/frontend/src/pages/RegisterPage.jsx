import { useState } from 'react'
import { authAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'STAFF', templeId: user?.temple?.id || 1 })
  const [loading, setLoading] = useState(false)

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-gray-400">僅限管理員使用此頁面</div>
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.register(form)
      toast.success('帳號建立成功')
      setForm({ email: '', password: '', name: '', role: 'STAFF', templeId: user.temple.id })
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || '建立失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">建立帳號</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">姓名</label>
          <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="工作人員姓名" />
        </div>
        <div>
          <label className="label">電子信箱</label>
          <input className="input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="staff@temple.tw" />
        </div>
        <div>
          <label className="label">密碼（至少 6 碼）</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
        <div>
          <label className="label">角色</label>
          <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="STAFF">一般工作人員</option>
            <option value="MANAGER">分院管理員</option>
            <option value="ADMIN">系統管理員</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? '建立中…' : '建立帳號'}
        </button>
      </form>
    </div>
  )
}
