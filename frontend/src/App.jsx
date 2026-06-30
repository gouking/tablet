import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'
import TabletListPage from './pages/TabletListPage'
import TabletFormPage from './pages/TabletFormPage'
import StatsPage from './pages/StatsPage'
import PrintHistoryPage from './pages/PrintHistoryPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">載入中…</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="tablets" element={<TabletListPage />} />
          <Route path="tablets/new" element={<TabletFormPage />} />
          <Route path="tablets/:id/edit" element={<TabletFormPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="print-history" element={<PrintHistoryPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
