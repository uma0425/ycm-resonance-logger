import { motion } from 'framer-motion'
import LiveChart from '../components/LiveChart'

export default function DashboardView() {
  return (
    <div className="min-h-screen flex flex-col p-6">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-4"
      >
        <h1 className="font-mono text-neon-green text-2xl tracking-widest">
          RESONANCE DASHBOARD
        </h1>
        <p className="text-slate-400 text-sm mt-1">会場の熱量 — リアルタイム（全参加者集計）</p>
      </motion.header>

      <LiveChart />
    </div>
  )
}
