import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-800 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">位</div>
          <h1 className="text-xl font-semibold text-gray-900">牌位打印系統</h1>
          <p className="text-sm text-gray-500 mt-1">請登入以繼續</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">電子信箱</label>
            <input className="input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="admin@temple.tw" required />
          </div>
          <div>
            <label className="label">密碼</label>
            <input className="input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? '登入中…' : '登入'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          預設帳號：admin@temple.tw ／ admin1234
        </p>
      </div>
    </div>
  )
}
