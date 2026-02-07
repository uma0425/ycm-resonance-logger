import { Routes, Route, Link, useLocation } from 'react-router-dom'
import ParticipantView from './pages/ParticipantView'
import DashboardView from './pages/DashboardView'

function App() {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Routes>
        <Route path="/" element={<ParticipantView />} />
        <Route path="/dashboard" element={<DashboardView />} />
      </Routes>
      <Link
        to={isDashboard ? '/' : '/dashboard'}
        className="fixed bottom-4 right-4 z-50 text-xs font-mono text-neon-cyan/60 hover:text-neon-cyan glass px-3 py-2 rounded-lg"
        aria-label={isDashboard ? '参加者画面へ' : 'ダッシュボード'}
      >
        {isDashboard ? '参加者画面へ' : 'Dashboard'}
      </Link>
    </div>
  )
}

export default App
