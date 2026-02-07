import { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

const BUCKET_SECONDS = 60
const MAX_ELAPSED_BUCKETS = 60
const MAX_TIMESTAMPS_FOR_CHART = 800
const CHART_HEIGHT = 96

export default function MyLog({ timestamps, sessionStartMs }) {
  const chartContainerRef = useRef(null)
  const [chartWidth, setChartWidth] = useState(300)
  const now = Date.now()
  const start = sessionStartMs != null && sessionStartMs > 0 ? sessionStartMs : now

  const { lineData, total } = useMemo(() => {
    const recent = timestamps.length > MAX_TIMESTAMPS_FOR_CHART
      ? timestamps.slice(-MAX_TIMESTAMPS_FOR_CHART)
      : timestamps
    const elapsedMin = Math.max(0, Math.floor((now - start) / 1000 / BUCKET_SECONDS))
    const numBuckets = Math.max(1, Math.min(elapsedMin + 1, MAX_ELAPSED_BUCKETS))
    const buckets = Array.from({ length: numBuckets }, (_, i) => ({
      min: i,
      label: `${i}分`,
      count: 0,
      index: i,
    }))

    recent.forEach((ts) => {
      if (ts < start) return
      const bucketIdx = Math.floor((ts - start) / 1000 / BUCKET_SECONDS)
      if (bucketIdx >= 0 && bucketIdx < numBuckets) buckets[bucketIdx].count += 1
    })

    const lineData = buckets.map((b, i) => ({
      ...b,
      displayLabel: i === 0 ? 'スタート' : i === buckets.length - 1 ? '現在' : b.label,
    }))

    const countInSession = recent.filter((ts) => ts >= start).length
    return {
      lineData,
      total: countInSession,
    }
  }, [timestamps, now, start])

  useEffect(() => {
    const el = chartContainerRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth || el.getBoundingClientRect().width
      if (w > 0) setChartWidth(w)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    const t = setTimeout(update, 50)
    return () => { clearTimeout(t); observer.disconnect() }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
          My Log（アクセスしてからの時間）
        </span>
        <span className="font-mono text-neon-cyan text-sm">
          合計 <strong>{total}</strong> 回
        </span>
      </div>
      <p className="font-mono text-[10px] text-slate-500 mb-1.5">
        左＝スタート(0分) → 右＝現在
      </p>

      <div
        ref={chartContainerRef}
        className="w-full overflow-hidden"
        style={{ height: CHART_HEIGHT }}
      >
        {lineData.length > 0 && chartWidth > 0 ? (
          <LineChart
            width={chartWidth}
            height={CHART_HEIGHT}
            data={lineData}
            margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
          >
            <XAxis
              dataKey="displayLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'Roboto Mono' }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'Roboto Mono' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 'auto']}
              width={24}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                borderRadius: 6,
                fontFamily: 'Roboto Mono',
                fontSize: 11,
              }}
              formatter={(value) => [value, 'タップ数']}
              labelFormatter={(label) => label}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#00f3ff"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={300}
              connectNulls
            />
          </LineChart>
        ) : (
          <div
            className="flex items-center justify-center w-full h-full text-slate-600 font-mono text-xs"
            style={{ height: CHART_HEIGHT }}
          >
            タップで記録され、ここに折れ線で表示されます。
          </div>
        )}
      </div>
    </motion.div>
  )
}
