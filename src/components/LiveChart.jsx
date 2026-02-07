import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { subscribeToTaps, isConfigured } from '../lib/firebase'

const CHART_HEIGHT = 280

const PEAK_THRESHOLD = 20
const MOCK_INTERVAL_MS = 600
const MAX_POINTS = 80
const STORAGE_KEY = 'resonance-my-log'
const AGGREGATE_BUCKET_MS = 10000

function loadStoredTimestamps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function usePersistedResonanceData() {
  const [data, setData] = useState(() => buildSeriesFromTimestamps(loadStoredTimestamps()))

  useEffect(() => {
    const update = () => setData(buildSeriesFromTimestamps(loadStoredTimestamps()))
    update()
    const interval = setInterval(update, 2000)
    return () => clearInterval(interval)
  }, [])

  return data
}

function buildSeriesFromTimestamps(timestamps) {
  if (!timestamps || timestamps.length === 0) return []
  const sorted = [...timestamps].sort((a, b) => a - b)
  const t0 = sorted[0]
  const bucketCounts = new Map()
  sorted.forEach((ts) => {
    const bucket = Math.floor((ts - t0) / AGGREGATE_BUCKET_MS)
    bucketCounts.set(bucket, (bucketCounts.get(bucket) || 0) + 1)
  })
  const maxBucket = Math.max(...bucketCounts.keys(), 0)
  const arr = []
  for (let i = 0; i <= maxBucket; i++) {
    arr.push({
      time: t0 + i * AGGREGATE_BUCKET_MS,
      value: bucketCounts.get(i) || 0,
      label: `${i}`,
      index: i,
      displayLabel: i === 0 ? 'スタート' : '',
    })
  }
  const sliced = arr.slice(-MAX_POINTS)
  if (sliced.length > 0) sliced[0].displayLabel = 'スタート'
  if (sliced.length > 0) sliced[sliced.length - 1].displayLabel = '現在'
  return sliced
}

function useFirebaseResonanceData() {
  const [data, setData] = useState([])

  useEffect(() => {
    if (!isConfigured()) return () => {}
    const unsubscribe = subscribeToTaps((snapshot) => {
      const timestamps = Object.values(snapshot)
        .map((v) => (v && typeof v.t === 'number' ? v.t : null))
        .filter((t) => t != null)
      setData(buildSeriesFromTimestamps(timestamps))
    })
    return unsubscribe
  }, [])

  return data
}

function useMockResonanceData() {
  const startRef = useRef(Date.now())
  const [data, setData] = useState(() => {
    const base = 3
    const arr = Array.from({ length: 12 }, (_, i) => {
      const time = startRef.current - (12 - i) * 5000
      return {
        time,
        value: base + Math.floor(Math.random() * 6),
        label: `${i}`,
        index: i,
        displayLabel: i === 0 ? 'スタート' : null,
      }
    })
    return arr
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = (now - startRef.current) / 1000
      const base = 4 + Math.sin(elapsed * 0.2) * 5 + Math.random() * 8
      const spikeChance = 0.35
      const spike = Math.random() < spikeChance ? 15 + Math.random() * 22 : 0
      const value = Math.round(Math.max(0, base + spike))

      setData((prev) => {
        const next = [
          ...prev.map((d, i) => ({
            ...d,
            displayLabel: i === 0 ? 'スタート' : (i === prev.length - 1 ? null : d.displayLabel),
          })),
          {
            time: now,
            value,
            label: `${prev.length}`,
            index: prev.length,
            displayLabel: '現在',
          },
        ]
        const sliced = next.slice(-MAX_POINTS)
        if (sliced.length > 0) sliced[0].displayLabel = 'スタート'
        if (sliced.length > 0) sliced[sliced.length - 1].displayLabel = '現在'
        sliced.forEach((d, i) => { if (d.displayLabel == null) d.displayLabel = '' })
        return sliced
      })
    }, MOCK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return data
}

export default function LiveChart() {
  const firebaseData = useFirebaseResonanceData()
  const persisted = usePersistedResonanceData()
  const mockData = useMockResonanceData()
  const hasFirebase = isConfigured() && firebaseData.length > 0
  const hasPersisted = persisted.length > 0
  const data = hasFirebase ? firebaseData : hasPersisted ? persisted : mockData
  const isLive = hasFirebase
  const [showPeak, setShowPeak] = useState(false)
  const [chartWidth, setChartWidth] = useState(400)
  const containerRef = useRef(null)
  const peakTimeoutRef = useRef(null)
  const lastValue = data.length ? data[data.length - 1].value : 0
  const totalCount = data.reduce((acc, d) => acc + d.value, 0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const updateWidth = () => {
      const w = el.offsetWidth || el.getBoundingClientRect().width
      if (w > 0) setChartWidth(w)
    }
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {}
      if (typeof width === 'number' && width > 0) setChartWidth(width)
    })
    observer.observe(el)
    updateWidth()
    const t = setTimeout(updateWidth, 100)
    return () => { clearTimeout(t); observer.disconnect() }
  }, [])

  useEffect(() => {
    if (lastValue >= PEAK_THRESHOLD) {
      setShowPeak(true)
      if (peakTimeoutRef.current) clearTimeout(peakTimeoutRef.current)
      peakTimeoutRef.current = setTimeout(() => setShowPeak(false), 2500)
    }
    return () => {
      if (peakTimeoutRef.current) clearTimeout(peakTimeoutRef.current)
    }
  }, [lastValue])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 min-h-[340px] glass rounded-xl p-4 overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <span className="font-mono text-xs text-slate-500">
          左＝スタート → 右＝現在（時系列）
        </span>
        <div className="font-mono text-sm flex gap-4">
          <span className="text-neon-green/90">
            現在の熱量: <strong>{lastValue}</strong>
            {!isLive && <span className="text-amber-400/80 text-[10px] ml-1">(デモ)</span>}
            {isLive && <span className="text-neon-green/80 text-[10px] ml-1">(全員)</span>}
          </span>
          <span className="text-slate-400">
            累計: <strong>{totalCount}</strong>
            {!isLive && <span className="text-amber-400/80 text-[10px] ml-1">(デモ)</span>}
            {isLive && <span className="text-neon-green/80 text-[10px] ml-1">(全員)</span>}
          </span>
        </div>
      </div>

      {/* 幅は ResizeObserver で取得。高さ固定で折れ線を確実に描画 */}
      <div
        ref={containerRef}
        className="relative w-full flex-shrink-0"
        style={{ height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}
      >
        <>
          {chartWidth > 0 && (
            <LineChart
              width={Math.max(chartWidth, 400)}
              height={CHART_HEIGHT}
              data={data}
              margin={{ top: 8, right: 8, left: 8, bottom: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="displayLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Roboto Mono' }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                interval="preserveStartEnd"
                tickFormatter={(v) => v || ''}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Roboto Mono' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
                allowDataOverflow
                width={28}
              />
              <ReferenceLine
                y={PEAK_THRESHOLD}
                stroke="#00ff8866"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: 8,
                  fontFamily: 'Roboto Mono',
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.time
                    ? new Date(payload[0].payload.time).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : '熱量'
                }
                formatter={(value) => [`${value}`, '熱量']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00ff88"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={true}
                animationDuration={400}
                connectNulls
              />
            </LineChart>
          )}
          <AnimatePresence>
            {showPeak && (
              <motion.div
                key="peak"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute bottom-2 right-2 pointer-events-none z-10 font-mono text-lg sm:text-xl font-bold text-neon-green px-3 py-1.5 rounded glass"
                style={{ textShadow: '0 0 12px #00ff88, 0 0 24px #00ff88' }}
              >
                RESONANCE PEAK!
              </motion.div>
            )}
          </AnimatePresence>
        </>
      </div>
    </motion.div>
  )
}
