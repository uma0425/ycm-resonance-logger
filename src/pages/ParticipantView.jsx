import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ResonanceButton from '../components/ResonanceButton'
import MyLog from '../components/MyLog'

const STORAGE_KEY = 'resonance-my-log'
const SESSION_START_KEY = 'resonance-session-start'
/** 200人想定: 1ユーザーあたりのログ上限（メモリ・localStorage・再描画負荷対策） */
const MAX_LOG_LENGTH = 500
/** localStorage 保存の debounce（ms）。連打時も書き込み回数を抑える */
const SAVE_DEBOUNCE_MS = 600

function getOrCreateSessionStart() {
  try {
    const stored = sessionStorage.getItem(SESSION_START_KEY)
    if (stored) {
      const n = parseInt(stored, 10)
      if (!Number.isNaN(n) && n > 0) return n
    }
  } catch (_) {}
  const now = Date.now()
  try {
    sessionStorage.setItem(SESSION_START_KEY, String(now))
  } catch (_) {}
  return now
}

function loadLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const arr = Array.isArray(parsed) ? parsed : []
    return arr.slice(-MAX_LOG_LENGTH)
  } catch {
    return []
  }
}

function saveLog(log) {
  try {
    const toSave = log.length > MAX_LOG_LENGTH ? log.slice(-MAX_LOG_LENGTH) : log
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (_) {}
}

export default function ParticipantView() {
  const [sessionStartMs] = useState(getOrCreateSessionStart)
  const [log, setLog] = useState(loadLog)
  const saveTimeoutRef = useRef(null)

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveLog(log)
      saveTimeoutRef.current = null
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveLog(log)
      }
    }
  }, [log])

  const onResonance = useCallback(() => {
    setLog((prev) => {
      const next = [...prev, Date.now()]
      return next.length > MAX_LOG_LENGTH ? next.slice(-MAX_LOG_LENGTH) : next
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-72">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="font-mono text-neon-cyan text-lg tracking-widest uppercase">
          Resonance Logger
        </h1>
        <p className="text-slate-400 text-sm mt-1">YCM — 心が動いた瞬間を残す</p>
      </motion.header>

      <ResonanceButton onPress={onResonance} />

      <MyLog timestamps={log} sessionStartMs={sessionStartMs} />
    </div>
  )
}
